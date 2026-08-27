const http = require('https');

function poll() {
  let count = 0;
  const interval = setInterval(() => {
    http.get('https://satyalabel-backend.onrender.com/api/v1/dashboard/stats', (res) => {
      console.log('Poll:', res.statusCode);
    }).on('error', (e) => console.log('Poll Error:', e.message));
    if (++count >= 15) clearInterval(interval);
  }, 1000);
}

poll();

setTimeout(() => {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const data = '--' + boundary + '\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n{"source_type":"physical_label","forceEngine":"gemini"}\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="image"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\ndummy\r\n--' + boundary + '--\r\n';
  
  const options = {
    hostname: 'satyalabel-backend.onrender.com',
    path: '/api/v1/scans',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(data)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('POST:', res.statusCode);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('POST Body:', body);
      try {
        const id = JSON.parse(body).data.scan_id;
        setTimeout(() => {
          http.get('https://satyalabel-backend.onrender.com/api/v1/scans/' + id, (r2) => {
            console.log('Scan:', r2.statusCode);
            let b2 = '';
            r2.on('data', d => b2 += d);
            r2.on('end', () => console.log('Scan Body:', b2));
          });
        }, 3000);
      } catch (e) {}
    });
  });
  
  req.on('error', (e) => console.log('POST Error:', e.message));
  req.write(data);
  req.end();
}, 2000);
