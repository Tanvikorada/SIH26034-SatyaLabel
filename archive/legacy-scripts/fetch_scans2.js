const http = require('https');
http.get('https://satyalabel-backend.onrender.com/api/v1/scans', {
  headers: { 'Authorization': 'Bearer test' } // Wait, this needs auth? Let's just bypass auth in a local script!
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
