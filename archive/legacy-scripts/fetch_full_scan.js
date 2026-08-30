const http = require('https');
http.get('https://satyalabel-backend.onrender.com/api/v1/scans/232e92ab-00f2-4fd1-bf1c-f6e78d9f9ad4', {
  headers: { 'Authorization': 'Bearer asd' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
