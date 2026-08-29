const http = require('https');
http.get('https://satyalabel-backend.onrender.com/api/v1/scans/batch/7603e82d-8cb3-4b6d-ac77-178a162a6582', {
  headers: { 'Authorization': 'Bearer asd' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
