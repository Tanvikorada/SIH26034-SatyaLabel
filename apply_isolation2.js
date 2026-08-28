const fs = require('fs');
let js = fs.readFileSync('backend/routes/dashboard.js', 'utf8');

js = js.split("WHERE status = 'complete'\n          AND created_at >= NOW()").join("WHERE status = 'complete'\n          ${req.user && req.user.role !== 'admin' ? ` AND uploaded_by = '${req.user.id}'` : ''}\n          AND created_at >= NOW()");

js = js.split("WHERE s.status = 'complete'\n      GROUP BY p.id").join("WHERE s.status = 'complete'\n      ${req.user && req.user.role !== 'admin' ? ` AND s.uploaded_by = '${req.user.id}'` : ''}\n      GROUP BY p.id");

fs.writeFileSync('backend/routes/dashboard.js', js);
console.log("Isolation applied to remaining queries");
