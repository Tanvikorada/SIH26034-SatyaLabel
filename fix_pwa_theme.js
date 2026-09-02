const fs = require('fs');

// 1. Update layout.jsx viewport
let layout = fs.readFileSync('frontend/app/layout.jsx', 'utf8');
layout = layout.replace(
  /\{ media: '\(prefers-color-scheme: light\)', color: '#ffffff' \}/g, 
  "{ media: '(prefers-color-scheme: light)', color: '#1E3A8A' }"
);
fs.writeFileSync('frontend/app/layout.jsx', layout);

// 2. Update NavBar.jsx to handle iOS Safe Area Top
let nav = fs.readFileSync('frontend/components/NavBar.jsx', 'utf8');
nav = nav.replace(
  /nav className="w-full h-\[64px\] flex items-center/g, 
  'nav className="w-full h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center'
);
fs.writeFileSync('frontend/components/NavBar.jsx', nav);

console.log("PWA THEME FIXED");
