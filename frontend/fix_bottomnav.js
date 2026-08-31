const fs = require('fs');
let code = fs.readFileSync('components/BottomNav.jsx', 'utf8');

code = code.replace('bg-white border-t border-slate-200', 'bg-[var(--color-surface)] border-t border-[var(--color-border)]');
code = code.replace(/text-slate-400/g, 'text-[var(--color-text-muted)]');
code = code.replace(/border-4 border-white/g, 'border-4 border-[var(--color-background)]');

fs.writeFileSync('components/BottomNav.jsx', code);
console.log("BOTTOM NAV UPDATED FOR DARK MODE");
