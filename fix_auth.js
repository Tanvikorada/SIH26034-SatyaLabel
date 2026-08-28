const fs = require('fs');
let js = fs.readFileSync('backend/middleware/auth.js', 'utf8');

const s1 = `  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {`;

const r1 = `  const authHeader = req.headers.authorization;
  const queryToken = req.query.token; // Support for EventSource (SSE)
  
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {`;

js = js.replace(s1, r1);
js = js.replace(`const token = authHeader.split(' ')[1];`, ``); // Remove original token assignment

fs.writeFileSync('backend/middleware/auth.js', js);
console.log("Auth middleware updated for SSE");
