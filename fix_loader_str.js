const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const startStr = "{loading || batch?.status === 'processing' ? (";
const endStr = ") : batch?.status === 'failed' ? (";

const startIdx = fe.indexOf(startStr);
const endIdx = fe.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replace = `{loading || batch?.status === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-full max-w-md bg-surface/30 border border-border rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                {/* Animated scan line background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                  <div className="w-full h-[2px] bg-accent shadow-[0_0_15px_var(--color-primary)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-surface rounded-full animate-spin border-t-accent"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">AI</div>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-medium text-text-primary">Legal Compliance Engine</h2>
                    <p className="text-[13px] text-accent animate-pulse">Running live analysis...</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px] border border-green-500/50">✓</div>
                    <span className="text-[13px] font-mono text-text-secondary">Image securely uploaded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-accent border-r-transparent animate-spin"></div>
                    <span className="text-[13px] font-mono text-text-primary">Extracting text & bounding boxes</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-30">
                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                    <span className="text-[13px] font-mono text-text-secondary">Cross-referencing Legal Metrology Act</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-30">
                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                    <span className="text-[13px] font-mono text-text-secondary">Generating official violation notices</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/50 text-center relative z-10">
                  <p className="text-[12px] text-text-muted">This deep-scan takes approximately 15 seconds.<br/>Please do not close this window.</p>
                </div>
              </div>
            </div>
          `;
          
  fe = fe.substring(0, startIdx) + replace + fe.substring(endIdx);
  fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
  console.log("LOADER FIXED");
} else {
  console.log("INDEX NOT FOUND");
}
