const fs = require('fs');
let code = fs.readFileSync('app/upload/page.jsx', 'utf8');

if (!code.includes('PremiumLoader')) {
  // Import it at the top
  code = code.replace("import { NavBar } from '@/components/NavBar';", "import { NavBar } from '@/components/NavBar';\nimport PremiumLoader from '@/components/PremiumLoader';");
  
  // Render it inside the main return block based on 'loading'
  // Find: <div className="min-h-screen bg-background text-text-primary">
  const renderTarget = '<div className="min-h-screen bg-background text-text-primary">';
  const renderReplacement = '<div className="min-h-screen bg-background text-text-primary">\n      {loading && <PremiumLoader />}';
  
  code = code.replace(renderTarget, renderReplacement);
  
  fs.writeFileSync('app/upload/page.jsx', code);
  console.log("UPLOAD PAGE FIXED");
}
