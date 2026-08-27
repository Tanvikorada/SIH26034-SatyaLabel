const http = require('http');

setTimeout(() => {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const data = '--' + boundary + '\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n{"source_type":"physical_label","forceEngine":"gemini"}\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="image"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\ndummy\r\n--' + boundary + '--\r\n';
  
  const options = {
    hostname: 'localhost',
    port: 5000,
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
    res.on('end', () => console.log('POST Body:', body));
  });
  
  req.on('error', (e) => console.log('POST Error:', e.message));
  req.write(data);
  req.end();
}, 1000);
