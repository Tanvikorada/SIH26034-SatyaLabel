const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');

code = code.replace(/className="progress-fill"/g, 'className="progress-fill animate-fill-bar"');
code = code.replace(/<div className="text-\[12px\] font-medium uppercase tracking-wider text-text-muted mb-2">/g, '<div className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-2">');

fs.writeFileSync('frontend/app/dashboard/page.jsx', code);
console.log("DASHBOARD UPDATED");
