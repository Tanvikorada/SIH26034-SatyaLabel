const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

// Replace the entire block
fe = fe.replace(
  /<h2 className="text-\[22px\] font-medium text-red-500 mb-2">Scan Failed<\/h2>[\s\S]*?<p className="text-text-secondary mb-6">\{batch\?\.error_message \|\| "We could not process this image\. Please try again\."\}<\/p>/g,
  `{batch?.error_message === 'SINGLE_IMAGE_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 text-3xl mx-auto">&#128161;</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Multiple Products Detected</h2>
                   <p className="text-text-secondary mb-6 max-w-md mx-auto">More than one product was detected in this photo. To maintain an accurate legal chain of evidence, please scan only one product at a time.</p>
                 </>
               ) : batch?.error_message === 'MULTIPLE_IMAGES_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 text-3xl mx-auto">&#128230;</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Please Scan One Item At A Time</h2>
                   <p className="text-text-secondary mb-6 max-w-md mx-auto">You uploaded photos of different products. The AI requires all photos in a single batch to be of the same item (e.g., front and back of the same bottle).</p>
                 </>
               ) : (
                 <>
                   <h2 className="text-[22px] font-medium text-red-500 mb-2">Scan Failed</h2>
                   <p className="text-text-secondary mb-6">{batch?.error_message || "We could not process this image. Please try again."}</p>
                 </>
               )}`
);

fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
console.log("FE FIXED");
