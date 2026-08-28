const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

js = js.replace("const { optionalAuth } = require('../middleware/auth');", "const { requireAuth, requireAdmin } = require('../middleware/auth');");
js = js.replace("router.get('/:id', optionalAuth, async (req, res) => {", "router.get('/:id', requireAuth, async (req, res) => {");
js = js.replace("router.delete('/:id', optionalAuth, async (req, res) => {", "router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {");
js = js.replace("router.post('/upload', upload.array('images', 5), optionalAuth, async (req, res) => {", "router.post('/upload', upload.array('images', 5), requireAuth, async (req, res) => {");

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Scans routes protected");
