const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// Replace standard labels with extreme typography labels
code = code.replace(/<label className="text-\[13px\] font-medium text-text-primary">/g, '<label className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary">');
code = code.replace(/<h1 className="text-\[32px\] font-medium tracking-tight leading-\[1.1\] mb-2">Upload Scan<\/h1>/g, '<h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Initialize Scan</h1>');
code = code.replace(/<p className="text-\[15px\] text-text-secondary mb-10">Submit physical or ecommerce labels for AI compliance checking\.<\/p>/g, '<p className="text-[15px] text-text-secondary mb-10 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> OCR Pipeline Active. Awaiting payload.</p>');

// Upgrade the dropzone
code = code.replace(/className="relative w-full min-h-\[240px\] p-4 border border-dashed border-border/g, 'className="relative w-full min-h-[240px] p-4 border border-dashed border-border/50 glass hover:border-primary/50');
code = code.replace(/<span className="text-\[14px\] text-text-secondary font-medium mb-2">Take photos of the front, side, and back of the label\.<\/span>/g, '<span className="text-[11px] font-mono tracking-widest uppercase text-text-secondary mb-2">Capture label perspectives (Front/Back)</span>');

// Upgrade the System Output block to look like a premium terminal
code = code.replace(/<div className="flex-1 font-mono text-\[12px\] leading-relaxed text-text-muted flex flex-col gap-2 overflow-y-auto bg-background rounded-lg p-4 border border-border">/g, `<div className="flex-1 font-mono text-[12px] leading-relaxed text-text-muted flex flex-col gap-2 overflow-y-auto bg-[#0A0A0A] rounded-lg p-4 border border-[#222]">
              <div className="flex gap-1.5 mb-2 border-b border-[#333] pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>`);

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("UPLOAD UI UPGRADED");
