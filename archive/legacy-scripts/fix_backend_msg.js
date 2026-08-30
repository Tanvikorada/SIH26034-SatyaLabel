const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `if (productsArray.length > 1) {
          await batch.update({ status: 'failed', errorMessage: 'Multiple products detected.' });
          return;
        }`;

const replace = `if (productsArray.length > 1) {
          const isMultiImage = filePathsArray.length > 1;
          const msg = isMultiImage 
            ? 'MULTIPLE_IMAGES_MULTIPLE_PRODUCTS' 
            : 'SINGLE_IMAGE_MULTIPLE_PRODUCTS';
          await batch.update({ status: 'failed', errorMessage: msg });
          return;
        }`;

js = js.replace(target, replace);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Backend updated!");
