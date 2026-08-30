const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// Viewfinder styling on mobile
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-5 gap-6">/g, '<div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-6 flex-1 md:flex-none h-[calc(100vh-140px)] md:h-auto">');

// Make dropzone full height
code = code.replace(/mello-card p-8 col-span-3 flex flex-col gap-6/g, 'mello-card p-4 md:p-8 col-span-3 flex flex-col gap-4 md:gap-6 h-full md:h-auto border-0 md:border md:shadow-sm bg-transparent md:bg-[var(--color-surface)]');

// Change standard layout
code = code.replace(/className="relative w-full min-h-\[240px\] p-4 border border-dashed border-border\/50 glass hover:border-primary\/50/g, 'className="relative w-full flex-1 md:min-h-[240px] p-4 border-2 border-dashed border-primary/30 md:border-border/50 bg-background/50 md:glass hover:border-primary/50 flex flex-col items-center justify-center rounded-2xl');

// Mobile Sticky Button
code = code.replace(/<button type="submit" className="mello-btn-primary w-full mt-2" disabled=\{loading\}>/, `<button type="submit" className="mello-btn-primary w-full mt-auto md:mt-2 h-[56px] text-[16px] font-bold shadow-[0_10px_30px_rgba(11,31,58,0.3)] active-press md:h-auto md:text-[14px]" disabled={loading}>`);

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("UPLOAD PAGE VIEWFINDER OVERHAUL");
