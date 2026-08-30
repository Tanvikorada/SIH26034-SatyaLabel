const fs = require('fs');
let js = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

// The image source logic
const targetImg = `                <img 
                  src={batch?.original_image?.startsWith('http') ? batch.original_image : \`/\${batch.original_image}\`} 
                  alt="Original Product"
                  className="w-full h-full object-cover"
                />`;

const replaceImg = `                <img 
                  src={(() => {
                    let firstImg = batch?.original_image;
                    if (firstImg?.startsWith('[')) {
                      try { firstImg = JSON.parse(firstImg)[0]; } catch(e){}
                    }
                    if (!firstImg) return '';
                    return firstImg.startsWith('http') ? firstImg : \`/\${firstImg}\`;
                  })()}
                  alt="Original Product"
                  className="w-full h-full object-cover"
                />`;

if (js.includes(targetImg)) {
  js = js.replace(targetImg, replaceImg);
  fs.writeFileSync('frontend/app/batch/[id]/page.jsx', js);
  console.log("Fixed Batch UI image parsing!");
} else {
  console.log("Could not find image tag in batch page.");
}
