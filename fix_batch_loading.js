const fs = require('fs');
let js = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const target = `<h2 className="text-[20px] font-medium text-text-primary mb-2">Analyzing Image...</h2>
            <p className="text-text-secondary text-center max-w-md">
              The AI Brain is analyzing the image to detect multiple products, check image quality, and evaluate compliance.
            </p>`;
            
const replacement = `
            <div className="flex flex-col items-center">
              <h2 className="text-[20px] font-medium text-text-primary mb-2 animate-pulse">
                {batch?.status === 'processing' ? 'Running Legal Compliance Engine...' : 'Analyzing Image...'}
              </h2>
              <div className="h-8 mb-4 flex items-center justify-center">
                <p className="text-accent text-sm font-medium animate-fade-in text-center">
                   {batch?.status === 'processing' ? 'This takes about 10-15 seconds. Please do not close this window.' : 'Initializing Cloud AI...'}
                </p>
              </div>
              <p className="text-text-secondary text-center max-w-md">
                The AI Brain is scanning the image to detect products, evaluating image quality, and computing 15+ strict Legal Metrology checks.
              </p>
            </div>`;

js = js.replace(target, replacement);

const emptyTarget = `              {batch?.scans?.map((scan, i) => (`;
const emptyReplacement = `              
              {batch?.scans?.length === 0 && batch?.status === 'completed' && (
                <div className="flex flex-col items-center justify-center py-16 bg-surface/30 rounded-2xl border border-border mt-8">
                  <div className="text-6xl mb-4 opacity-50">📦</div>
                  <h3 className="text-xl font-medium text-text-primary mb-2">No FMCG Products Detected</h3>
                  <p className="text-text-secondary text-center max-w-sm">
                    The AI could not identify any valid consumer packaging in this image. Please ensure the label is clearly visible and try again.
                  </p>
                  <button onClick={() => router.push('/upload')} className="mello-btn-secondary mt-6">Scan New Image</button>
                </div>
              )}
              {batch?.scans?.map((scan, i) => (`;
js = js.replace(emptyTarget, emptyReplacement);

fs.writeFileSync('frontend/app/batch/[id]/page.jsx', js);
console.log("Batch loading and empty state fixed");
