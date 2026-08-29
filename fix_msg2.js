const fs = require('fs');

let backend = fs.readFileSync('backend/routes/scans.js', 'utf8');
backend = backend.replace(
  /errorMessage: 'Multiple products detected.'/g, 
  "errorMessage: filePathsArray.length > 1 ? 'MULTIPLE_IMAGES_MULTIPLE_PRODUCTS' : 'SINGLE_IMAGE_MULTIPLE_PRODUCTS'"
);
fs.writeFileSync('backend/routes/scans.js', backend);

let frontend = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');
const feTarget = `          ) : batch?.status === 'failed' ? (
             <div className="flex flex-col items-center justify-center py-32 text-center">
               <h2 className="text-[22px] font-medium text-red-500 mb-2">Scan Failed</h2>
               <p className="text-text-secondary mb-6">{batch?.error_message || "We could not process this image. Please try again."}</p>
               <button onClick={() => router.push('/upload')} className="mello-btn-secondary">Try Another Image</button>
             </div>
          ) : (`;

const feReplace = `          ) : batch?.status === 'failed' ? (
             <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
               {batch?.error_message === 'SINGLE_IMAGE_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 text-3xl">💡</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Multiple Products Detected</h2>
                   <p className="text-text-secondary mb-6 max-w-md">More than one product was detected in this photo. To maintain an accurate legal chain of evidence, please scan only one product at a time.</p>
                 </>
               ) : batch?.error_message === 'MULTIPLE_IMAGES_MULTIPLE_PRODUCTS' ? (
                 <>
                   <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 text-3xl">📦</div>
                   <h2 className="text-[22px] font-medium text-text-primary mb-2">Please Scan One Item At A Time</h2>
                   <p className="text-text-secondary mb-6 max-w-md">You uploaded photos of different products. The AI requires all photos in a single batch to be of the same item (e.g., front and back of the same bottle).</p>
                 </>
               ) : (
                 <>
                   <h2 className="text-[22px] font-medium text-red-500 mb-2">Scan Failed</h2>
                   <p className="text-text-secondary mb-6">{batch?.error_message || "We could not process this image. Please try again."}</p>
                 </>
               )}
               <button onClick={() => router.push('/upload')} className="mello-btn-primary px-8">Scan New Product</button>
             </div>
          ) : (`;

if(frontend.includes("Scan Failed")) {
  frontend = frontend.replace(feTarget, feReplace);
  fs.writeFileSync('frontend/app/batch/[id]/page.jsx', frontend);
}

