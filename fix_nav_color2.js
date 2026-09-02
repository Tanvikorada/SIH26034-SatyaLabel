const fs = require('fs');
let pageCode = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const regex = /<nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0"\s*style=\{\{ background: 'color-mix\(in srgb, var\(--color-background\) 88%, transparent\)', backdropFilter: 'blur\(16px\)', borderBottom: '1px solid var\(--color-border\)' \}\}>/g;

pageCode = pageCode.replace(regex, '<nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0 bg-gradient-to-r from-orange-50/90 via-slate-50/90 to-emerald-50/90 dark:from-orange-950/30 dark:via-slate-900/30 dark:to-emerald-950/30 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-500">');

fs.writeFileSync('frontend/app/page.jsx', pageCode);
console.log("LANDING DONE");
