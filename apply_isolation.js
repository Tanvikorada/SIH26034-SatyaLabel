const fs = require('fs');
let js = fs.readFileSync('backend/routes/dashboard.js', 'utf8');

js = js.replace("WHERE status = 'complete'", "WHERE status = 'complete'\n      ${req.user && req.user.role !== 'admin' ? ` AND uploaded_by = '${req.user.id}'` : ''}");

// The recentScans block
const oldScans = `const recentScans = await Scan.findAll({
      where: { status: 'complete' },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });`;
const newScans = `const recentScans = await Scan.findAll({
      where: req.user && req.user.role !== 'admin' ? { status: 'complete', uploadedBy: req.user.id } : { status: 'complete' },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });`;

js = js.replace(oldScans, newScans);

fs.writeFileSync('backend/routes/dashboard.js', js);
console.log("Isolation applied successfully");
