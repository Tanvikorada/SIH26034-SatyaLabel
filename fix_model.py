for filename in ['backend/services/ocr_service.js', 'backend/services/rules_engine.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Try using gemini-1.5-flash-latest or gemini-pro
    # Actually gemini-1.5-flash is standard. If it failed, let's fallback to gemini-pro (which is 1.0 Pro and definitely exists in old API versions) if the package update doesn't work.
    # But wait! gemini-1.5-flash might just be gemini-1.5-flash-latest.
    text = text.replace("'gemini-1.5-flash'", "'gemini-1.5-flash-latest'")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)
print("Done")
