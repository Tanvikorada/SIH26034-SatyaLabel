const fs = require('fs');
const https = require('https');
https.get('https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600', (res) => {
  const file = fs.createWriteStream('real_chips.jpg');
  res.pipe(file);
});
