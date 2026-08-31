const fs = require('fs');
let code = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

// Fix 1: Chart Margin
const oldMargin = 'margin={{ top: 10, right: 10, left: isMobile ? -60 : -20, bottom: isMobile ? 10 : 20 }}';
const newMargin = 'margin={{ top: 10, right: 10, left: isMobile ? -30 : -20, bottom: isMobile ? 25 : 20 }}';
code = code.replace(oldMargin, newMargin);

// Fix 2: Chart Tooltip dy on mobile
code = code.replace('dy={isMobile ? 8 : 12}', 'dy={isMobile ? 12 : 12}');

// Fix 3: Tooltip text overlap on mobile (if any)
code = code.replace(/text-\[11px\] sm:text-sm font-medium leading-tight/g, 'text-[11px] sm:text-xs font-medium leading-tight');

// Fix 4: Reduce gap on mobile KPI cards
code = code.replace('grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8', 'grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8');

fs.writeFileSync('app/dashboard/page.jsx', code);
console.log("DASHBOARD FIXED");
