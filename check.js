const code = require('fs').readFileSync('frontend/app/page.jsx', 'utf8');
console.log("Contains className='dark': " + code.includes('className="dark"'));
console.log("Contains className='dark ': " + code.includes('className="dark '));
