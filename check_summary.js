const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
    if (line.includes('summary') || line.includes('Summary')) {
        console.log(i, line);
    }
});
