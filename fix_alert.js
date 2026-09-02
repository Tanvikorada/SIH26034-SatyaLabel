const fs = require('fs');
let code = fs.readFileSync('frontend/app/history/page.jsx', 'utf8');

if (!code.includes("import { toast } from 'sonner';")) {
  code = code.replace(/import \{ useRouter \} from 'next\/navigation';/, "import { useRouter } from 'next/navigation';\nimport { toast } from 'sonner';");
}

code = code.replace(/alert\('No data to export'\)/g, "toast.error('No data to export')");
fs.writeFileSync('frontend/app/history/page.jsx', code);
console.log("ALERT FIXED");
