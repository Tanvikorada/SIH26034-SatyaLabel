const http = require('https');

const req = http.request({
  hostname: 'satyalabel-backend.onrender.com',
  port: 443,
  path: '/api/v1/dashboard/stats',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMyNzYwZGZmLTZiZGEtNDNlNS1hYmZiLTQ1OGE3Mzk3MzRiOSIsImVtYWlsIjoiYWRtaW5Ac2F0eWFsYWJlbC5nb3YuaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODc5Mzc2NTUsImV4cCI6MTc4ODAyNDA1NX0.FE1xUrm0Uhcxic1fdyBAmU0BluOY9W7BwzIXTWncAkU'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data.substring(0, 500) + '...'));
});

req.end();
