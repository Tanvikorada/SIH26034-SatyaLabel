const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function test() {
  const form = new FormData();
  form.append('images', fs.createReadStream('dummy1.jpg'));
  
  console.log("Uploading...");
  try {
    const res = await fetch('https://satyalabel-backend.onrender.com/api/v1/scans/upload', {
      method: 'POST',
      body: form
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
    
    if (res.status === 200) {
      const data = JSON.parse(text);
      console.log("Batch ID:", data.batch.id);
      
      // poll
      const interval = setInterval(async () => {
        const pRes = await fetch(`https://satyalabel-backend.onrender.com/api/v1/scans/batch/${data.batch.id}`);
        const pText = await pRes.json();
        console.log("Poll Status:", pText.batch.status);
        if (pText.batch.status === 'completed' || pText.batch.status === 'failed') {
          console.log("Final:", JSON.stringify(pText, null, 2));
          clearInterval(interval);
        }
      }, 3000);
    }
  } catch(e) {
    console.log(e);
  }
}
test();
