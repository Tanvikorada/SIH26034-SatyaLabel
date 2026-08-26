with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'const { violations, stats } = validateCompliance(fieldsMap, ocrResult.text, {',
    'const { violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, {'
)

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
