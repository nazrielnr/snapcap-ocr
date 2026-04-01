"""
server.py - FastAPI backend for SnapCap OCR.

Loads docTR models (detection + recognition) on startup
and exposes a POST /api/ocr endpoint for receipt scanning.

Usage:
    python server.py
    # or: uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import os
import sys
import time
import logging
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from doctr.models import detection, recognition, ocr_predictor
from doctr.io import DocumentFile

from receipt_parser import parse_receipt

# ---- Config ----
DET_MODEL_PATH = "doctr_det_model.pt"
REC_MODEL_PATH = "doctr_rec_model.pt"
HOST = "0.0.0.0"
PORT = 8000

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("snapcap")

# ---- Global model holder ----
predictor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown."""
    global predictor

    logger.info("Loading OCR models...")
    t0 = time.time()

    # Recognition model (crnn_vgg16_bn - perfect match)
    rec_model = recognition.crnn_vgg16_bn(pretrained=False)
    rec_state = torch.load(REC_MODEL_PATH, map_location="cpu", weights_only=True)
    rec_model.load_state_dict(rec_state)
    logger.info(f"  Recognition model loaded ({len(rec_state)} params)")

    # Detection model (FAST-tiny, custom has fused layers → use pretrained)
    det_state = torch.load(DET_MODEL_PATH, map_location="cpu", weights_only=True)
    det_model = detection.fast_tiny(pretrained=False)
    missing, unexpected = det_model.load_state_dict(det_state, strict=False)

    if len(missing) == 0 and len(unexpected) == 0:
        logger.info(f"  Detection model loaded from custom weights")
    else:
        logger.info(f"  Custom det model incompatible (fused layers), using pretrained fast_tiny")
        det_model = detection.fast_tiny(pretrained=True)

    # Build predictor
    predictor = ocr_predictor(det_arch=det_model, reco_arch=rec_model, pretrained=False)
    logger.info(f"  OCR predictor ready in {time.time() - t0:.1f}s")

    yield

    # Cleanup
    predictor = None
    logger.info("OCR models unloaded.")


# ---- FastAPI App ----
app = FastAPI(
    title="SnapCap OCR API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS (allow frontend dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": predictor is not None,
    }


@app.post("/api/ocr")
async def process_receipt(file: UploadFile = File(...)):
    """
    Process a receipt image and return structured OCR data.

    Accepts: multipart/form-data with 'file' field (image/jpeg, image/png, etc.)
    Returns: JSON with merchant, items, totals, confidence, raw lines.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="OCR model not loaded yet")

    # Validate file type
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Expected image file, got {content_type}")

    try:
        # Read image bytes
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")
        t0 = time.time()

        # Save to temp file for docTR (it needs a file path)
        import tempfile
        suffix = ".jpg" if "jpeg" in content_type or "jpg" in content_type else ".png"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        try:
            # Run OCR
            doc = DocumentFile.from_images(tmp_path)
            result = predictor(doc)
        finally:
            os.unlink(tmp_path)

        elapsed = time.time() - t0
        logger.info(f"OCR completed in {elapsed:.2f}s")

        # Extract lines with confidence
        lines = []
        for page in result.pages:
            for block in page.blocks:
                for line in block.lines:
                    words = [w.value for w in line.words]
                    confs = [w.confidence for w in line.words]
                    text = " ".join(words)
                    avg_conf = sum(confs) / len(confs) if confs else 0
                    lines.append({"text": text, "confidence": round(avg_conf, 3)})

        # Parse into structured receipt
        parsed = parse_receipt(lines)

        # Determine overall confidence
        avg_conf = parsed["avg_confidence"]
        if avg_conf >= 0.8:
            confidence_level = "high"
        elif avg_conf >= 0.5:
            confidence_level = "low"
        else:
            confidence_level = "failed"

        response = {
            "success": True,
            "data": {
                "merchant": parsed["merchant"],
                "items": parsed["items"],
                "subtotal": parsed["subtotal"],
                "tax": parsed["tax"],
                "service": parsed["service"],
                "grand_total": parsed["grand_total"],
                "date": parsed["date"],
                "raw_lines": parsed["raw_lines"],
                "confidence": confidence_level,
                "confidence_score": round(avg_conf * 100),
            },
            "processing_time_ms": round(elapsed * 1000),
        }

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "data": None,
            },
        )


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting SnapCap OCR server on {HOST}:{PORT}")
    uvicorn.run("server:app", host=HOST, port=PORT, reload=False)
