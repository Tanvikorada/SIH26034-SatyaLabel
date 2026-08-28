const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `let productsArray = ocrResult.geminiStructuredData;
    if (!Array.isArray(productsArray)) {
      productsArray = [productsArray];
    }`;

const r1 = `let productsArray = ocrResult.geminiStructuredData;
    // Handle new { "products": [...] } wrapper from prompt change
    if (productsArray && productsArray.products && Array.isArray(productsArray.products)) {
      productsArray = productsArray.products;
    } else if (!Array.isArray(productsArray)) {
      productsArray = [productsArray];
    }`;

js = js.replace(s1, r1);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("JSON array unwrapper added");
