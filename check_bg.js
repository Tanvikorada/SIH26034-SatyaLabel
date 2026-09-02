const fs = require('fs');
let code = fs.readFileSync('frontend/app/dashboard/page.jsx', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
    if (line.includes('min-h-screen')) {
        console.log(i, line);
    }
});
