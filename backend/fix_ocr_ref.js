const fs = require('fs');
let js = fs.readFileSync('services/ocr_service.js', 'utf8');

// 1. Fix the ReferenceError
js = js.replace(/let ocrResult = await runTesseract\(processedPath\)\.catch/g, `let ocrResult = await runTesseract(processedPaths[0]).catch`);

// 2. Add some logging
const targetLog = `        const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];`;
const replaceLog = `        const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
        console.log("[OCR] Type of paths:", typeof paths, Array.isArray(paths));
        console.log("[OCR] paths array:", paths);`;
js = js.replace(targetLog, replaceLog);

fs.writeFileSync('services/ocr_service.js', js);
console.log("Fixed ReferenceError and added logging!");
