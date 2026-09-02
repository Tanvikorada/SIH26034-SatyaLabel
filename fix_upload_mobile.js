const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// The file input doesn't have capture="environment". We can just add it, or add accept="image/*" capture="environment".
// Wait, if we use capture="environment", it ONLY opens the camera. Let's leave it as accept="image/*" which prompts iOS/Android to ask "Camera or Photo Library", which is best.
// But we should change the TEXT of the dropzone on mobile to "Tap to Open Camera".
// And change the desktop text to "Click or drag image to upload".
// We can use hidden sm:block and block sm:hidden for the text.

const desktopText = `<div className="hidden sm:block text-[15px] font-medium text-text-primary mb-1">Click or drag image to upload</div>
                  <div className="hidden sm:block text-[12px] text-text-muted">High-resolution packaging scans only</div>`;
                  
const mobileText = `<div className="block sm:hidden text-[18px] font-bold text-text-primary mb-1">Tap to Open Camera</div>
                  <div className="block sm:hidden text-[13px] text-text-muted">Scan product label for analysis</div>`;

// Find where the text is.
// I'll just regex replace the "Click or drag image" line.
code = code.replace(
  /<div className="text-\[15px\] font-medium text-text-primary mb-1">Click or drag image to upload<\/div>/g,
  desktopText + '\n                  ' + mobileText
);

// We need to make the dashed border look like a massive button on mobile.
code = code.replace(
  /border-2 border-dashed border-border hover:border-primary/g,
  'border-2 border-dashed sm:border-dashed border-border sm:hover:border-primary border-solid sm:border-dashed bg-slate-50 hover:bg-slate-100 sm:bg-transparent shadow-sm sm:shadow-none'
);

fs.writeFileSync('frontend/app/upload/page.jsx', code);
console.log("UPLOAD MOBILE FIXED");
