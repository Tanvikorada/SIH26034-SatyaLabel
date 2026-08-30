with open('backend/services/ocr_service.js', 'r', encoding='utf-8') as f:
    ocr = f.read()

# Force output to JPEG in sharp and set extension to .jpg
new_preprocess = """async function preprocessImage(imagePath) {
    const dir = path.dirname(imagePath);
    const base = path.basename(imagePath, path.extname(imagePath));
    const processedPath = path.join(dir, `${base}_ocr_ready.jpg`);
  
    const meta = await sharp(imagePath).metadata();
    const longest = Math.max(meta.width || 0, meta.height || 0);
  
    let pipeline = sharp(imagePath).rotate();
  
    if (longest > MAX_DIMENSION_PX) {
      pipeline = pipeline.resize(MAX_DIMENSION_PX, MAX_DIMENSION_PX, { fit: 'inside', withoutEnlargement: true });
    }
  
    pipeline = pipeline.grayscale().normalize().sharpen({ sigma: 1.2, m1: 1.5 }).jpeg({ quality: 90 });
    await pipeline.toFile(processedPath);
    return processedPath;
  }"""

import re
ocr = re.sub(r'async function preprocessImage\(imagePath\) \{[\s\S]*?await pipeline\.toFile\(processedPath\);\n    return processedPath;\n  \}', new_preprocess, ocr)

# In runGeminiVision, set mimeType correctly
ocr = ocr.replace("const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';", "const mimeType = 'image/jpeg';")

with open('backend/services/ocr_service.js', 'w', encoding='utf-8') as f:
    f.write(ocr)
print("Updated preprocessing and mime logic")
