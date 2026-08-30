const http = require('https');
http.get('https://satyalabel-backend.onrender.com/api/v1/reports/232e92ab-00f2-4fd1-bf1c-f6e78d9f9ad4/download', (res) => {
  console.log("Status:", res.statusCode);
  console.log("Content-Length:", res.headers['content-length']);
});
