const fs = require('fs');
let code = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
    if (line.includes('border-dashed') || line.includes('type="file"')) {
        console.log(i, line);
    }
});
