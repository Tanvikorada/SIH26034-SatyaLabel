const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.jsx', 'utf8');

if (!code.includes("export const dynamic = 'force-dynamic';")) {
  code = code.replace('"use client";', '"use client";\n// Force Vercel to never cache this page\nexport const dynamic = \'force-dynamic\';\nexport const revalidate = 0;');
  fs.writeFileSync('frontend/app/page.jsx', code);
  console.log("CACHE BUSTER ADDED");
}
