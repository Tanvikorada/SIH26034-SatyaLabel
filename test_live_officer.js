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
  res.on('end', () => {
    const token = JSON.parse(data).token;
    console.log("Officer token:", token);
    
    // Now fetch stats
    const req2 = http.request({
      hostname: 'satyalabel-backend.onrender.com',
      port: 443,
      path: '/api/v1/dashboard/stats',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', d => data2 += d);
      res2.on('end', () => console.log(data2.substring(0, 500) + '...'));
    });
    req2.end();
  });
});

req.write(JSON.stringify({ email: "officer@satyalabel.gov.in", password: "demo1234" }));
req.end();
