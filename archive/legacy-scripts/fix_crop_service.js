const fs = require('fs');

// 1. Fix crop_service.js Markdown bug
let cropJs = fs.readFileSync('backend/services/crop_service.js', 'utf8');
const targetParse = `const boxes = JSON.parse(text);`;
const replaceParse = `const cleanedText = text.replace(/\`\`\`(?:json)?\\s*/g, '').replace(/\`\`\`\\s*$/g, '').trim();
    const boxes = JSON.parse(cleanedText);`;
if (cropJs.includes(targetParse)) {
  cropJs = cropJs.replace(targetParse, replaceParse);
}
// Enhance Prompt
const targetPrompt = `Detect distinct packaged products (like chips, biscuits, bottles) in this image. For each distinct product, return its 2D bounding box. Return ONLY a valid JSON array of objects. Format: [ { \\"ymin\\": 0, \\"xmin\\": 0, \\"ymax\\": 1000, \\"xmax\\": 1000 } ]. Do not include markdown.`;
const replacePrompt = `Detect EVERY individual packaged product (like chips, biscuits, bottles) in this image. If there are multiple products side-by-side, you MUST return a separate bounding box for each one. Return ONLY a valid JSON array of objects. Format: [ { \\"ymin\\": 0, \\"xmin\\": 0, \\"ymax\\": 1000, \\"xmax\\": 1000 } ]. Do not include markdown.`;
cropJs = cropJs.replace(targetPrompt, replacePrompt);
fs.writeFileSync('backend/services/crop_service.js', cropJs);
console.log("Fixed crop_service.js");

// 2. Fix scans.js hardcoded [0] bug
let scansJs = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetLoop = `        let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;
        if (!Array.isArray(productsArray)) productsArray = [productsArray];
        
        const rawProductData = productsArray[0];
        if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
        
        try {`;

const replaceLoop = `        let productsArray = ocrResult.geminiStructuredData?.products || ocrResult.geminiStructuredData;
        if (!Array.isArray(productsArray)) productsArray = [productsArray];
        
        for (const rawProductData of productsArray) {
          if (!rawProductData || Object.keys(rawProductData).length === 0) continue;
          
          try {`;

// Now we have an extra loop, which means we need an extra closing brace!
const endTarget = `        successfulScans++;
        } catch (innerErr) {
          global.lastInnerErr = innerErr.stack || innerErr.message;
          console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
          require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
        }
      }`;
const endReplace = `          successfulScans++;
          } catch (innerErr) {
            global.lastInnerErr = innerErr.stack || innerErr.message;
            console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
            require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
          }
        } // close productsArray loop
      }`;

if (scansJs.includes(targetLoop.replace(/\r\n/g, '\n'))) {
  scansJs = scansJs.replace(targetLoop.replace(/\r\n/g, '\n'), replaceLoop);
  scansJs = scansJs.replace(endTarget.replace(/\r\n/g, '\n'), endReplace);
} else {
  scansJs = scansJs.replace(targetLoop, replaceLoop);
  scansJs = scansJs.replace(endTarget, endReplace);
}
fs.writeFileSync('backend/routes/scans.js', scansJs);
console.log("Fixed scans.js");
