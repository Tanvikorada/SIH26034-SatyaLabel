import re

def fix_models(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace specific model strings with their -latest or -001 equivalents
    content = content.replace("'gemini-1.5-flash'", "'gemini-1.5-flash-latest'")
    content = content.replace("'gemini-1.5-pro'", "'gemini-1.5-pro-latest'")
    content = content.replace("'gemini-1.5-flash-8b'", "'gemini-1.0-pro-vision-latest'")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_models('backend/services/ocr_service.js')
fix_models('backend/services/rules_engine.js')
