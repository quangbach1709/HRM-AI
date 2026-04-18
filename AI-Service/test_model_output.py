#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test model output shapes and behavior"""

import sys
import os
import numpy as np
import torch

# Add Silent-Face path
SILENT_FACE_PATH = os.path.join(os.path.dirname(__file__), 'Silent-Face-Anti-Spoofing')
sys.path.insert(0, SILENT_FACE_PATH)

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

print("="*60)
print("Testing Model Loading and Output Shape")
print("="*60)

# Initialize
predictor = AntiSpoofPredict(device_id=0)
cropper = CropImage()

model_dir = os.path.join(SILENT_FACE_PATH, 'resources', 'anti_spoof_models')
models = sorted([f for f in os.listdir(model_dir) if f.endswith('.pth')])

print(f"\nFound {len(models)} models in {model_dir}:")
for i, m in enumerate(models):
    print(f"  {i+1}. {m}")

# Test with dummy image
print(f"\nCreating dummy image (480x640x3)...")
dummy_img = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)

print(f"Detecting face bbox...")
try:
    bbox = predictor.get_bbox(dummy_img)
    print(f"  Bbox: {bbox}")
except Exception as e:
    print(f"  ERROR: {e}")
    bbox = None

if bbox:
    prediction = np.zeros((1, 3))
    
    for model_name in models:
        h_input, w_input, model_type, scale = parse_model_name(model_name)
        
        param = {
            "org_img": dummy_img,
            "bbox": bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }
        
        if scale is None:
            param["crop"] = False
        
        print(f"\nModel: {model_name}")
        print(f"  Config: h={h_input}, w={w_input}, type={model_type}, scale={scale}")
        
        img_crop = cropper.crop(**param)
        print(f"  Cropped shape: {img_crop.shape}")
        
        model_path = os.path.join(model_dir, model_name)
        result = predictor.predict(img_crop, model_path)
        
        print(f"  Output shape: {result.shape}")
        print(f"  Output values: {result}")
        print(f"  Output dtype: {result.dtype}")
        print(f"  Sum along axis 1: {np.sum(result, axis=1)}")  # Should be ~1.0 if softmax
        
        prediction += result
    
    print(f"\n" + "="*60)
    print(f"Accumulated prediction: {prediction}")
    print(f"Total models: {len(models)}")
    print(f"Score (class 1): {prediction[0][1]}")
    print(f"Score / num_models: {prediction[0][1] / len(models)}")
    print(f"Argmax: {np.argmax(prediction)}")
    print("="*60)
