const fs = require('fs');
let js = fs.readFileSync('frontend/app/globals.css', 'utf8');

js = js.replace('--color-background: #000000;', '--color-background: #09090b;'); // zinc-950
js = js.replace('--color-text-secondary:   #a1a1aa;', '--color-text-secondary:   #d4d4d8;'); // zinc-300
js = js.replace('--color-text-muted:       #71717a;', '--color-text-muted:       #a1a1aa;'); // zinc-400

fs.writeFileSync('frontend/app/globals.css', js);
console.log("CSS contrast fixed");
