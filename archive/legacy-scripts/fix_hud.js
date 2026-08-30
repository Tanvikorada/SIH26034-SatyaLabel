const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const oldLoadingState = /<div className="flex items-center justify-center min-h-\[60vh\]">[\s\S]*?Please do not close this window\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newLoadingState = `<div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-4xl mx-auto">
            
            {/* Main HUD Container */}
            <div className="w-full glass rounded-[24px] overflow-hidden border border-accent/30 shadow-[0_0_50px_rgba(99,91,255,0.1)] relative">
              
              {/* Header Bar */}
              <div className="bg-black/40 border-b border-border/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-[12px] font-mono tracking-widest text-text-muted uppercase">SatyaLabel Legal Metrology Core [v2.4.1]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-accent animate-pulse">CONNECTION SECURE</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
              </div>

              {/* Grid Layout for Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-[400px]">
                
                {/* Left Side: Visual Scanner (1 col) */}
                <div className="col-span-1 border-r border-border/50 bg-black/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  
                  {/* Grid Background Effect */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Rotating Radar / Core */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-[spin_4s_linear_infinite]"></div>
                    {/* Inner Ring (Reverse) */}
                    <div className="absolute inset-4 rounded-full border border-dashed border-accent/30 animate-[spin_6s_linear_infinite_reverse]"></div>
                    {/* Center Core */}
                    <div className="absolute inset-16 rounded-full bg-accent/10 border border-accent shadow-[0_0_20px_rgba(99,91,255,0.4)] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent animate-pulse" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center z-10">
                    <div className="text-[12px] font-mono text-accent mb-1 tracking-widest">VISION ENGINE</div>
                    <div className="text-[10px] font-mono text-text-muted">Extracting Bounding Boxes...</div>
                  </div>
                </div>

                {/* Right Side: Terminal Log (2 cols) */}
                <div className="col-span-2 bg-[#050505]/80 p-6 font-mono text-[13px] leading-relaxed relative flex flex-col justify-end">
                  
                  {/* Fake Terminal Logs container that scrolls up */}
                  <div className="overflow-hidden flex flex-col justify-end h-full relative z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}>
                    <div className="flex flex-col space-y-3 animate-[slideUp_15s_linear_forwards]">
                      
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+0.00s]</span> <span>&gt; INITIALIZING SECURE CLOUD HANDSHAKE...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+0.12s]</span> <span>&gt; IMAGE RECEIVED: [BLOB_ID: 9XF2-4A] (4.2 MB)</span></div>
                      <div className="text-accent flex gap-3"><span className="text-green-500">[+0.45s]</span> <span>&gt; WARMING UP GEMINI 1.5 PRO MULTIMODAL...</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+1.20s]</span> <span>&gt; EXECUTING OCR LAYER 1 (TEXT EXTRACTION)...</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+2.55s]</span> <span>&gt; APPLYING BOUNDING BOXES FOR FONT SIZE MEASUREMENT...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+4.10s]</span> <span>&gt; CROSS-REFERENCING: [Rule 6 - Manufacturer Address]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+4.80s]</span> <span>&gt; DETECTED: "PEPSICO INDIA HOLDINGS PVT. LTD."</span></div>
                      <div className="text-amber-500 flex gap-3"><span className="text-green-500">[+6.33s]</span> <span>&gt; VALIDATING [Rule 2 - MRP Inclusive of Taxes]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+7.15s]</span> <span>&gt; EXTRACTED DATA: MRP Rs. 10.00 (INCL. OF ALL TAXES)</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+9.00s]</span> <span>&gt; CROSS-REFERENCING: [Rule 6 - Best Before Date]</span></div>
                      <div className="text-text-primary flex gap-3"><span className="text-green-500">[+9.50s]</span> <span>&gt; DETECTED DATE FORMAT: DD/MM/YY (NON-STANDARD COMPLIANCE FLAG)</span></div>
                      <div className="text-accent flex gap-3"><span className="text-green-500">[+11.20s]</span> <span>&gt; AGGREGATING RULE 1-33 RESULTS...</span></div>
                      <div className="text-text-muted flex gap-3"><span className="text-green-500">[+13.40s]</span> <span>&gt; COMPILING LEGAL METROLOGY REPORT PACKET...</span></div>
                      <div className="text-green-500 flex gap-3 animate-pulse"><span className="text-green-500">[+14.80s]</span> <span>&gt; FINALIZING RESULT. WAITING FOR DATABASE SYNC...</span></div>
                      
                    </div>
                  </div>
                  
                  {/* Blinking Cursor */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 mt-4 z-20">
                    <span className="text-accent font-mono">&gt;</span>
                    <span className="w-2 h-4 bg-accent animate-ping"></span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>`;

if (fe.match(oldLoadingState)) {
  fe = fe.replace(oldLoadingState, newLoadingState);
  console.log("HUD MATCHED AND REPLACED");
} else {
  console.log("HUD FAILED TO MATCH");
}

let css = fs.readFileSync('frontend/app/globals.css', 'utf8');
if (css.indexOf('@keyframes slideUp') === -1) {
  css += `\n@keyframes slideUp {\n  0% { transform: translateY(100%); }\n  100% { transform: translateY(-50%); }\n}\n`;
  fs.writeFileSync('frontend/app/globals.css', css);
}

fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
