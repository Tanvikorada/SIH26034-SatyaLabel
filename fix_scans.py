with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('async function runScanPipeline(scan, imagePath, sourceType) {', 'async function runScanPipeline(scan, imagePath, metadata = {}) {')
text = text.replace('const metadata = { sourceType };', '')
text = text.replace('runOcrPipeline(path.resolve(imagePath), metadata);', 'runOcrPipeline(path.resolve(imagePath), metadata);')
text = text.replace('setImmediate(() => runScanPipeline(scan, req.file.path, sourceType));', 'setImmediate(() => runScanPipeline(scan, req.file.path, meta));')
text = text.replace('const { violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, {', 'const { violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata); //')

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
