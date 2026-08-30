const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

const startIdx = code.indexOf('<motion.div');
let currentIdx = code.indexOf('heroStats.map');

// Find the <motion.div that contains heroStats.map
let motionStart = code.lastIndexOf('<motion.div', currentIdx);
let motionEnd = code.indexOf('</motion.div>', currentIdx) + '</motion.div>'.length;

if (motionStart !== -1 && motionEnd !== -1) {
  code = code.substring(0, motionStart) + code.substring(motionEnd);
  // Also remove the heroStats array definition
  const arrayStart = code.indexOf('const heroStats = [');
  const arrayEnd = code.indexOf('];', arrayStart) + 2;
  if (arrayStart !== -1 && arrayEnd !== -1) {
     code = code.substring(0, arrayStart) + code.substring(arrayEnd);
  }
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("STATS REMOVED");
}
