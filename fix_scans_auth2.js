const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');
js = js.replace('const { requireAuth, requireAuth, requireAdmin } = require(\'../middleware/auth\');', 'const { requireAuth, requireAdmin } = require(\'../middleware/auth\');');
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed requireAuth duplicate");
