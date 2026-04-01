import os
import torch
from doctr.models import ocr_predictor, detection, recognition
from doctr.io import DocumentFile
import argparse
import json

def main(image_path):
    # 1. Initialize models without pre-trained weights
    # Based on file size (~40MB detection, ~60MB recognition), we guess these archs:
    det_model = detection.db_mobilenet_v3_large(pretrained=False)
    rec_model = recognition.crnn_vgg16_bn(pretrained=False)

    # 2. Load the custom state dicts
    det_path = "doctr_det_model.pt"
    rec_path = "doctr_rec_model.pt"

    print(f"[*] Loading detection model from {det_path}...")
    det_state = torch.load(det_path, map_location="cpu")
    det_model.load_state_dict(det_state)

    print(f"[*] Loading recognition model from {rec_path}...")
    rec_state = torch.load(rec_path, map_location="cpu")
    rec_model.load_state_dict(rec_state)

    # 3. Create the OCR predictor
    predictor = ocr_predictor(det_arch=det_model, rec_arch=rec_model, pretrained=True)
    # Note: 'pretrained=True' here refers to other components (like orientation) 
    # but we passed our custom architectures.

    # 4. Perform inference
    print(f"[*] Analyzing image: {image_path}...")
    doc = DocumentFile.from_images(image_path)
    result = predictor(doc)

    # 5. Show results
    print("\n--- OCR Results ---\n")
    json_output = result.export()
    print(json.dumps(json_output, indent=2))
    
    # Simple text extraction summary
    print("\n--- Extracted Text Summary ---\n")
    for page in result.pages:
        for block in page.blocks:
            for line in block.lines:
                print(" ".join([word.value for word in line.words]))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image", help="Path to the image to analyze")
    args = parser.parse_args()
    
    if not os.path.exists(args.image):
        print(f"Error: Image '{args.image}' not found.")
    else:
        main(args.image)
