const http = require('https');
http.get('https://satyalabel-backend.onrender.com/api/v1/scans/debug-db', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
