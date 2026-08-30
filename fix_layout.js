const fs = require('fs');
let code = fs.readFileSync('frontend/app/layout.jsx', 'utf8');

if (!code.includes('import BottomNav')) {
  code = code.replace(/import \{ Inter \} from 'next\/font\/google';/, "import { Inter } from 'next/font/google';\nimport BottomNav from '@/components/BottomNav';");
  code = code.replace(/\{children\}\n\s*<\/div>/, "{children}\n        <BottomNav />\n      </div>");
  fs.writeFileSync('frontend/app/layout.jsx', code);
  console.log("LAYOUT UPDATED");
} else {
  console.log("BottomNav already imported");
}
