"""
test_ocr.py - Script untuk testing model OCR (docTR) pada gambar receipt.

Model yang digunakan:
  - Detection:    doctr_det_model.pt  (FAST-tiny, reparameterized/fused)
  - Recognition:  doctr_rec_model.pt  (CRNN VGG16-BN)

Cara menjalankan:
  python test_ocr.py receipt_0000.jpg
  python test_ocr.py receipt_0000.jpg --show-json
  python test_ocr.py receipt_0000.jpg --visualize
"""

import os
import sys
import argparse
import json
import torch
from doctr.models import detection, recognition, ocr_predictor
from doctr.io import DocumentFile


def load_models(det_path="doctr_det_model.pt", rec_path="doctr_rec_model.pt"):
    """Load detection and recognition models."""
    
    # --- Recognition Model ---
    # Architecture: CRNN with VGG16-BN backbone (perfect match)
    print(f"[*] Loading recognition model from {rec_path}...")
    rec_model = recognition.crnn_vgg16_bn(pretrained=False)
    rec_state = torch.load(rec_path, map_location="cpu", weights_only=True)
    rec_model.load_state_dict(rec_state)
    print(f"    [OK] Recognition model loaded ({len(rec_state)} parameters)")

    # --- Detection Model ---
    # Architecture: FAST-tiny (reparameterized/fused version)
    # The custom .pt file has fused Conv+BN layers (fused_conv) which don't match
    # the standard FAST-tiny state_dict. We use a pretrained FAST-tiny as the
    # detection backbone instead, and load the custom recognition weights.
    #
    # NOTE: Jika ingin menggunakan detection model kustom, arsitektur harus
    # dicocokkan dengan versi reparameterized dari TextNet backbone.
    print(f"[*] Loading detection model...")
    
    # Try loading custom detection model first
    det_state = torch.load(det_path, map_location="cpu", weights_only=True)
    det_model = detection.fast_tiny(pretrained=False)
    
    # Check if custom state dict is compatible
    missing, unexpected = det_model.load_state_dict(det_state, strict=False)
    
    if len(missing) == 0 and len(unexpected) == 0:
        print(f"    [OK] Custom detection model loaded perfectly ({len(det_state)} parameters)")
    else:
        print(f"    [!] Custom detection model has fused layers (reparameterized)")
        print(f"      Missing keys: {len(missing)}, Unexpected keys: {len(unexpected)}")
        print(f"    -> Falling back to pretrained FAST-tiny detection model...")
        det_model = detection.fast_tiny(pretrained=True)
        print(f"    [OK] Pretrained detection model loaded")

    return det_model, rec_model


def run_ocr(image_path, det_model, rec_model):
    """Run OCR on an image and return the result."""
    
    # Build the OCR predictor
    predictor = ocr_predictor(
        det_arch=det_model,
        reco_arch=rec_model,
        pretrained=False,  # We already loaded weights
    )

    # Load and process the image
    print(f"\n[*] Processing image: {image_path}")
    doc = DocumentFile.from_images(image_path)
    result = predictor(doc)
    
    return result


def print_results(result, show_json=False):
    """Print OCR results in a readable format."""
    
    print("\n" + "=" * 60)
    print("  OCR RESULTS - Extracted Text")
    print("=" * 60 + "\n")

    line_count = 0
    word_count = 0

    for page_idx, page in enumerate(result.pages):
        for block_idx, block in enumerate(page.blocks):
            for line_idx, line in enumerate(block.lines):
                words = [word.value for word in line.words]
                confidences = [word.confidence for word in line.words]
                
                text = " ".join(words)
                avg_conf = sum(confidences) / len(confidences) if confidences else 0
                
                if avg_conf > 0.8:
                    conf_indicator = "[H]"
                elif avg_conf > 0.5:
                    conf_indicator = "[M]"
                else:
                    conf_indicator = "[L]"
                print(f"  {conf_indicator} {text:<45} (conf: {avg_conf:.2f})")
                
                line_count += 1
                word_count += len(words)

    print(f"\n{'--' * 30}")
    print(f"  Total: {line_count} lines, {word_count} words")
    print(f"  Legend: [H] high conf (>0.8)  [M] medium (>0.5)  [L] low (<0.5)")
    print(f"{'--' * 30}\n")

    if show_json:
        print("\n" + "=" * 60)
        print("  FULL JSON OUTPUT")
        print("=" * 60 + "\n")
        json_output = result.export()
        print(json.dumps(json_output, indent=2, ensure_ascii=False))


def visualize_result(result, image_path):
    """Save a visualization of the OCR result."""
    try:
        import matplotlib
        matplotlib.use("Agg")  # Non-interactive backend
        import matplotlib.pyplot as plt
        
        # Use docTR's built-in visualization
        synthetic_pages = result.synthesize()
        
        output_path = os.path.splitext(image_path)[0] + "_ocr_result.png"
        
        fig, axes = plt.subplots(1, 2, figsize=(16, 10))
        
        # Original image
        from PIL import Image
        orig_img = Image.open(image_path)
        axes[0].imshow(orig_img)
        axes[0].set_title("Original Image", fontsize=14)
        axes[0].axis("off")
        
        # Synthetic/reconstructed text
        axes[1].imshow(synthetic_pages[0])
        axes[1].set_title("Reconstructed Text", fontsize=14)
        axes[1].axis("off")
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()
        
        print(f"[*] Visualization saved to: {output_path}")
        
    except ImportError as e:
        print(f"[!] Cannot visualize: {e}")
        print("    Install matplotlib: pip install matplotlib")


def main():
    parser = argparse.ArgumentParser(
        description="Test docTR OCR models on receipt images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_ocr.py receipt_0000.jpg
  python test_ocr.py receipt_0000.jpg --show-json
  python test_ocr.py receipt_0000.jpg --visualize
  python test_ocr.py receipt_0000.jpg --det-model custom_det.pt --rec-model custom_rec.pt
        """
    )
    parser.add_argument("image", help="Path to the image to analyze")
    parser.add_argument("--det-model", default="doctr_det_model.pt", help="Path to detection model")
    parser.add_argument("--rec-model", default="doctr_rec_model.pt", help="Path to recognition model")
    parser.add_argument("--show-json", action="store_true", help="Show full JSON output")
    parser.add_argument("--visualize", action="store_true", help="Save visualization image")
    
    args = parser.parse_args()

    # Validate inputs
    if not os.path.exists(args.image):
        print(f"Error: Image '{args.image}' not found.")
        sys.exit(1)

    if not os.path.exists(args.det_model):
        print(f"Error: Detection model '{args.det_model}' not found.")
        sys.exit(1)

    if not os.path.exists(args.rec_model):
        print(f"Error: Recognition model '{args.rec_model}' not found.")
        sys.exit(1)

    # Load models
    det_model, rec_model = load_models(args.det_model, args.rec_model)

    # Run OCR
    result = run_ocr(args.image, det_model, rec_model)

    # Print results
    print_results(result, show_json=args.show_json)

    # Optionally visualize
    if args.visualize:
        visualize_result(result, args.image)

    print("[*] Done!")


if __name__ == "__main__":
    main()
