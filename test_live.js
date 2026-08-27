const http = require('https');

function startTest() {
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
  
  console.log('Sending POST to LIVE server...');
  const req = http.request(options, (res) => {
    console.log('POST Status:', res.statusCode);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('POST Body:', body);
      try {
        const id = JSON.parse(body).data.scan_id;
        console.log('Got scan ID:', id);
        
        const pollInterval = setInterval(() => {
          http.get('https://satyalabel-backend.onrender.com/api/v1/scans/' + id, (r2) => {
            console.log('Scan Status:', r2.statusCode);
            let b2 = '';
            r2.on('data', d => b2 += d);
            r2.on('end', () => {
               console.log('Scan Body:', b2.substring(0, 150));
               try {
                 const status = JSON.parse(b2).data.status;
                 if (status !== 'processing') {
                   console.log('PIPELINE FINISHED SUCCESSFULLY! Final Status:', status);
                   clearInterval(pollInterval);
                   process.exit(0);
                 }
               } catch(e) {}
            });
          }).on('error', (e) => console.log('GET error:', e.message));
        }, 3000);
      } catch (e) {
        console.log('Failed to parse POST body', e.message);
      }
    });
  });
  
  req.on('error', (e) => console.log('POST Error:', e.message));
  req.write(data);
  req.end();
}

startTest();
