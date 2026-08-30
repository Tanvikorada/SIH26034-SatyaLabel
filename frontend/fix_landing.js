const fs = require('fs');
let code = fs.readFileSync('app/page.jsx', 'utf8');

const tagStart = code.indexOf('{/* Floating Verification Tag */}');
if (tagStart > -1) {
  const tagEnd = code.indexOf('</div>', tagStart) + 6;
  code = code.substring(0, tagStart) + code.substring(tagEnd);
}

// Ensure the button is Navy Blue. It might use standard Tailwind classes.
// Let's just find "Start Scanning" and update its classes.
const startScanIdx = code.indexOf('Start Scanning');
if (startScanIdx > -1) {
    // Replace the generic dark color with Navy blue
    code = code.replace(/bg-slate-900/g, 'bg-[#1E3A8A]');
    code = code.replace(/hover:bg-slate-800/g, 'hover:bg-[#16335C]');
    
    // In case it was using a different color
    code = code.replace(/bg-\[#0B1F3A\]/g, 'bg-[#1E3A8A]');
    code = code.replace(/hover:bg-\[#16335C\]/g, 'hover:bg-[#16335C]'); // wait, #16335c is good.
}

fs.writeFileSync('app/page.jsx', code);
console.log('LANDING PAGE FIXED');
