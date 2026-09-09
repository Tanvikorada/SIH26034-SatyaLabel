const jwt = require('jsonwebtoken');
const fs = require('fs');
const FormData = require('form-data');

const SECRET = 'sih_hackathon_super_secret_key_2026';
const token = jwt.sign({ id: 1, role: 'admin', email: 'officer@satyalabel.gov.in' }, SECRET, { expiresIn: '1h' });
const API = 'https://satyalabel-backend.onrender.com/api/v1';

async function poll(batchId, name) {
  console.log(`[${name}] Polling batch ${batchId}...`);
  for(let i=0; i<30; i++) {
    const res = await fetch(`${API}/scans/batch/${batchId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      console.log(`[${name}] Polling failed: HTTP ${res.status}`);
      return;
    }
    const json = await res.json();
    const data = json.data || json;
    
    if (data.status === 'completed' || data.status === 'complete') {
      console.log(`[${name}] ✅ SUCCESS! Scan ID:`, data.scans?.[0]?.id);
      return;
    } else if (data.status === 'failed') {
      console.log(`[${name}] ❌ FAILED! Error:`, data.error_message || data.errorMessage);
      return;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log(`[${name}] ⚠️ TIMEOUT!`);
}

async function testPhysicalUpload() {
  console.log("--- Testing Physical Upload ---");
  const tinyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(tinyBase64, 'base64');
  fs.writeFileSync('test.png', buffer);

  const form = new FormData();
  form.append('image', fs.createReadStream('test.png'));
  form.append('product_name', 'QA Test Product');
  form.append('source_type', 'physical_label');

  const res = await fetch(`${API}/scans`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  if (!res.ok) {
    console.log("Physical Upload Request Failed:", await res.text());
    return;
  }
  const json = await res.json();
  await poll(json.data.batch_id, 'Physical Upload');
}

async function testUrlUpload() {
  console.log("--- Testing URL Upload ---");
  const res = await fetch(`${API}/scans/url`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', // safe direct image to avoid antibot for the base test
      product_name: 'QA Test URL',
      source_type: 'ecommerce_listing'
    })
  });

  if (!res.ok) {
    console.log("URL Upload Request Failed:", await res.text());
    return;
  }
  const json = await res.json();
  await poll(json.data.batch_id, 'URL Upload');
}

async function runTests() {
  await testPhysicalUpload();
  await testUrlUpload();
}

runTests();
