const fs = require('fs');

// 1. Fix globals.css to force Tailwind v4 to use class-based dark mode
let css = fs.readFileSync('frontend/app/globals.css', 'utf8');
if (!css.includes('@variant dark')) {
  css += '\n\n/* Force Tailwind v4 to use class-based dark mode for next-themes */\n@custom-variant dark (&:where(.dark, .dark *));\n';
  fs.writeFileSync('frontend/app/globals.css', css);
  console.log("TAILWIND v4 DARK MODE CLASS VARIANT ADDED");
}

// Wait, the official syntax in Tailwind v4 is `@variant dark (&:is(.dark *));` or `@custom-variant`.
