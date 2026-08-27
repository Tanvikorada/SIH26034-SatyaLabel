import re

with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

ocr = ocr.replace("modelName = 'llama-3.2-90b-vision-preview'", "modelName = 'qwen/qwen3.8-27b'")
ocr = ocr.replace("=== 'llama-3.2-90b-vision-preview' ? 'llama-3.2-11b-vision-preview' : 'llama-3.2-90b-vision-preview'", "=== 'qwen/qwen3.8-27b' ? 'qwen/qwen3.6-27b' : 'qwen/qwen3.8-27b'")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)

print("Updated to Qwen Vision")
