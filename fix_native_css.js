const fs = require('fs');

let css = fs.readFileSync('frontend/app/globals.css', 'utf8');

const nativeCSS = `
/* ========================================= */
/* PWA NATIVE APP ENFORCEMENTS               */
/* ========================================= */
html, body {
  /* Prevent 'rubber-banding' pull-to-refresh entire page drag */
  overscroll-behavior-y: none;
  /* Disable the grey tap highlight that browsers apply to links/buttons */
  -webkit-tap-highlight-color: transparent;
  /* Prevent long-press from selecting UI text */
  -webkit-user-select: none;
  user-select: none;
  /* Prevent long-press from bringing up "Save Image" or "Copy Link" menus on UI elements */
  -webkit-touch-callout: none;
}

/* Allow text selection ONLY where it makes sense (inputs, logs) */
input, textarea, [contenteditable="true"], .allow-select {
  -webkit-user-select: text;
  user-select: text;
}
`;

css += nativeCSS;

fs.writeFileSync('frontend/app/globals.css', css);
console.log("NATIVE CSS INJECTED");
