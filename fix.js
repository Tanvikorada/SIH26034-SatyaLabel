const fs = require('fs');
let code = fs.readFileSync('backend/routes/scans.js', 'utf8');
code = code.replace(/const fs = require\('fs'\);\n/g, '');
code = "const fs = require('fs');\n" + code;
fs.writeFileSync('backend/routes/scans.js', code);

let code2 = fs.readFileSync('backend/routes/dashboard.js', 'utf8');
code2 = code2.replace(/\\\n      SELECT/g, '\\n      SELECT');
code2 = code2.replace(/    \\, \{ type: QueryTypes\.SELECT \}\);/g, '    \, { type: QueryTypes.SELECT });');
fs.writeFileSync('backend/routes/dashboard.js', code2);

let code3 = fs.readFileSync('backend/routes/public.js', 'utf8');
code3 = code3.replace("const { ok, fail } = require('./util');", "const ok = (res, data, status = 200) => res.status(status).json({ data });\nconst fail = (res, status, code, msg) => res.status(status).json({ error: { code, message: msg } });");
fs.writeFileSync('backend/routes/public.js', code3);
