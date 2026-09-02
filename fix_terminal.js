const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// Replace the dark terminal background with a light enterprise background
code = code.replace(/bg-\[#0A0A0A\] rounded-lg p-4 border border-\[#222\]/g, 'bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-inner');

// Remove the macOS dots completely
const dotsRegex = /<div className="flex gap-1\.5 mb-2 border-b border-\[#333\] pb-2">[\s\S]*?<\/div>\s*<\/div>/g;
code = code.replace(dotsRegex, '');

// Also the text color inside might be white?
// Let's check text-text-primary inside the logs. It's using theme variables, so it will automatically be dark text on light background in Light mode!
// But just in case, we can ensure it's text-slate-700.
code = code.replace(/<span key=\{i\} className="text-text-primary/g, '<span key={i} className="text-slate-700 font-medium');

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("TERMINAL FIXED");
