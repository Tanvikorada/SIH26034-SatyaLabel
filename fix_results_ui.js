const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// Aggressive typographic rewrite for any "tracking-widest uppercase"
code = code.replace(/text-\[11px\] font-bold tracking-widest uppercase/g, 'text-[10px] font-mono tracking-[0.2em] uppercase');
code = code.replace(/text-\[12px\] text-text-muted font-bold tracking-widest uppercase/g, 'text-[10px] text-text-muted font-mono tracking-[0.2em] uppercase');
code = code.replace(/text-\[13px\] font-medium tracking-wide text-text-primary/g, 'text-[11px] font-mono tracking-widest uppercase text-text-primary');

// Upgrade the Score display
code = code.replace(/<div className={`text-\[48px\] font-medium tracking-tighter leading-none \${scoreColor}`}/g, '<div className={`text-[56px] font-medium tracking-tighter leading-none ${scoreColor} drop-shadow-sm`}');

// Upgrade all mello-card-flat to have hover interactions
code = code.replace(/mello-card-flat/g, 'mello-card-flat hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg');

// Ensure tabs look more premium
code = code.replace(/text-\[14px\] font-medium capitalize transition-colors/g, 'text-[12px] font-mono tracking-widest uppercase transition-colors');

fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
console.log("RESULTS UI UPGRADED");
