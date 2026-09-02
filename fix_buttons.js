const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// Replace the dropzone container styles to remove dashed borders on mobile
code = code.replace(
  /className="relative w-full flex-1 md:min-h-\[240px\] p-4 border-2 border-dashed border-primary\/30 md:border-border\/50 bg-background\/50 md:glass hover:border-primary\/50 flex flex-col items-center justify-center rounded-2xl rounded-xl flex flex-col items-center justify-center bg-surface group hover:border-mist transition-colors"/g,
  'className="relative w-full flex-1 min-h-[200px] border-none sm:border-2 sm:border-dashed sm:border-slate-300 sm:hover:border-primary bg-transparent sm:bg-slate-50 flex flex-col items-center justify-center rounded-2xl transition-colors"'
);

// Replace the label "Capture label perspectives"
code = code.replace(
  /<span className="text-\[11px\] font-mono tracking-widest uppercase text-text-secondary mb-2">Capture label perspectives \(Front\/Back\)<\/span>/g,
  '<span className="text-sm font-semibold text-slate-500 mb-4 text-center px-4">Capture product label clearly. Make sure all text is readable.</span>'
);

// Replace the two buttons
const oldButtons = `<div className="flex gap-4 w-full justify-center px-4">
                       
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Take Photo</span>
                         <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Gallery</span>
                         <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                     </div>`;

const newButtons = `<div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-0 sm:px-4">
                       
                       <div className="relative overflow-hidden bg-[#1E3A8A] text-white rounded-xl p-4 flex items-center justify-center gap-3 active:scale-95 transition-transform cursor-pointer w-full sm:w-[200px] shadow-lg shadow-blue-900/20">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         <span className="text-[16px] font-semibold tracking-wide">Take Photo</span>
                         <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                       <div className="relative overflow-hidden bg-white text-slate-700 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-3 active:scale-95 transition-transform cursor-pointer w-full sm:w-[200px] shadow-sm hover:bg-slate-50">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         <span className="text-[16px] font-semibold tracking-wide">Photo Library</span>
                         <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                     </div>`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("BUTTONS FIXED");
