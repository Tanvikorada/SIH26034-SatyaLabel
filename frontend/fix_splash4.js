const fs = require('fs');
let code = fs.readFileSync('components/SplashScreen.jsx', 'utf8');

code = code.replace('-translate-y-[60px] sm:-translate-y-[80px]', '-translate-y-1/2');

fs.writeFileSync('components/SplashScreen.jsx', code);
console.log("FIXED OFFSET");
