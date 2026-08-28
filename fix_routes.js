const fs = require('fs');
let js = fs.readFileSync('backend/server.js', 'utf8');

const s1 = `app.use(\`\${API}/dashboard\`, dashboardRouter);
app.use(\`\${API}/rules\`,     rulesRouter);`;

const r1 = `const { requireAuth } = require('./middleware/auth');
app.use(\`\${API}/dashboard\`, requireAuth, dashboardRouter);
app.use(\`\${API}/rules\`,     rulesRouter);`;

js = js.split(s1).join(r1);
fs.writeFileSync('backend/server.js', js);
console.log("Dashboard route protected");
