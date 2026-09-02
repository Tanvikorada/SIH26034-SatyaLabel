const fs = require('fs');

let pageCode = fs.readFileSync('frontend/app/page.jsx', 'utf8');
const regex = /bg-gradient-to-r from-orange-50\/90 via-slate-50\/90 to-emerald-50\/90 dark:from-orange-950\/30 dark:via-slate-900\/30 dark:to-emerald-950\/30/g;
pageCode = pageCode.replace(regex, 'bg-slate-50/90 dark:bg-slate-900/90');
fs.writeFileSync('frontend/app/page.jsx', pageCode);

let navCode = fs.readFileSync('frontend/components/NavBar.jsx', 'utf8');
navCode = navCode.replace(regex, 'bg-slate-50/90 dark:bg-slate-900/90');
fs.writeFileSync('frontend/components/NavBar.jsx', navCode);

console.log("NAVBARS REVERTED TO PROFESSIONAL SLATE");
