const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetStr = `if (rawProductData.meta_image_quality && rawProductData.meta_image_quality !== 'good') {
           fieldsMap._quality_warning = rawProductData.meta_quality_reason || 'Image quality too poor for full verification.';
        }`;

const replacement = `if (rawProductData.meta_image_quality && rawProductData.meta_image_quality !== 'good') {
           let qReason = rawProductData.meta_quality_reason || 'Image quality too poor for full verification.';
           if (rawProductData.meta_image_quality === 'glare') {
              qReason = 'Highly reflective foil glare detected covering text. Try scanning under diffused lighting without flash.';
           }
           fieldsMap._quality_warning = qReason;
        }`;

js = js.replace(targetStr, replacement);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Glare fixed");
