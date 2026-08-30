const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const startStr = `{loading || batch?.status === 'processing' ? (`;
const endStr = `) : batch?.status === 'failed' ? (`;

const startIdx = fe.indexOf(startStr);
const endIdx = fe.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newLoadingState = `<div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full max-w-5xl mx-auto">
            
            <div className="w-full">
              {/* Premium Header */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 relative">
                   <div className="absolute inset-0 rounded-full border border-accent/20 border-t-accent animate-spin" style={{ animationDuration: '3s' }}></div>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h1 className="text-[28px] font-medium tracking-tight text-text-primary mb-3">AI Compliance Engine</h1>
                <p className="text-[15px] text-text-secondary max-w-lg mx-auto leading-relaxed">
                  Executing rigorous multi-modal analysis against the Legal Metrology database. Please wait while the official report is compiled.
                </p>
              </div>

              {/* The Engine UI */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left: Phase Stepper */}
                <div className="col-span-1 md:col-span-5 flex flex-col justify-center space-y-8 pl-4 md:pl-12">
                  <div className="relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-border/40 rounded-full"></div>
                    <div className="absolute left-[11px] top-4 h-[70%] w-[2px] bg-gradient-to-b from-accent to-transparent rounded-full animate-pulse"></div>

                    <div className="space-y-8 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="w-[24px] h-[24px] rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] mt-0.5">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Secure Initialization</h4>
                          <p className="text-[13px] text-text-secondary">Image payload secured in cloud vault</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5">
                        <div className="w-[24px] h-[24px] rounded-full bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(99,91,255,0.4)] mt-0.5 ring-4 ring-accent/20">
                           <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Optical Extraction</h4>
                          <p className="text-[13px] text-accent">Extracting typographic declarations</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 opacity-40">
                        <div className="w-[24px] h-[24px] rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Rules Engine</h4>
                          <p className="text-[13px] text-text-secondary">Validating against legislative acts</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 opacity-40">
                        <div className="w-[24px] h-[24px] rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                        </div>
                        <div>
                          <h4 className="text-[15px] font-medium text-text-primary mb-1">Finalizing</h4>
                          <p className="text-[13px] text-text-secondary">Generating PDF and sync</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: The Live Insight Card */}
                <div className="col-span-1 md:col-span-7">
                  <div className="glass rounded-[20px] p-8 md:p-10 border border-border h-full flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-border">
                       <div className="h-full bg-accent w-1/3 animate-[slideRight_3s_ease-in-out_infinite_alternate]"></div>
                    </div>
                    
                    <div className="mb-2 text-[11px] font-mono tracking-widest text-text-muted uppercase">Live Analysis Log</div>
                    
                    <div className="h-[120px] relative overflow-hidden mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)">
                       <div className="absolute bottom-4 left-0 w-full flex flex-col gap-4 animate-[slideUp_15s_linear_forwards]">
                          <div className="text-[15px] text-text-muted">Targeting bounding boxes on package geometry...</div>
                          <div className="text-[15px] text-text-muted">Isolating Manufacturer Address block...</div>
                          <div className="text-[15px] text-text-primary font-medium">Extracting textual data layer...</div>
                          <div className="text-[15px] text-text-primary font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Evaluating Rule 6 compliance parameters...</div>
                          <div className="text-[15px] text-text-muted">Verifying MRP formatting and tax inclusiveness...</div>
                          <div className="text-[15px] text-text-muted">Initiating biochemical composition check...</div>
                          <div className="text-[15px] text-text-primary font-medium flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> Cross-referencing E-number toxicity database...</div>
                          <div className="text-[15px] text-text-muted">Aggregating 33 rule outcomes...</div>
                          <div className="text-[15px] text-green-500 font-medium">Finalizing compliance payload...</div>
                       </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>\n          `;
          
  fe = fe.substring(0, startIdx + startStr.length) + '\n' + newLoadingState + fe.substring(endIdx);
  fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
  console.log("PREMIUM LOADER REPLACED");
} else {
  console.log("NOT FOUND");
}
