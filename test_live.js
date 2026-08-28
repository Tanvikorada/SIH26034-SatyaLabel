const http = require('https');

const req = http.request({
  hostname: 'satyalabel-backend.onrender.com',
  port: 443,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});

req.write(JSON.stringify({ email: "admin@satyalabel.gov.in", password: "admin1234" }));
req.end();
