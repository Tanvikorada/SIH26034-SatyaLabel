require('dotenv').config({ path: 'backend/.env' });
const fs = require('fs');

async function run() {
  const modelName = 'gemini-1.5-flash';
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('No API key found in backend/.env');
    return;
  }
  
  // Create a dummy 10x10 png image for testing
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const payload = {
    contents: [{
      parts: [
        { text: 'Extract text' },
        { inlineData: { mimeType: 'image/png', data: dummyBase64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.1
    }
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log('HTTP Error:', res.status, errText);
  } else {
    const data = await res.json();
    console.log('Success:', JSON.stringify(data).substring(0, 200));
  }
}

run();
