const fs = require('fs');
const path = require('path');
const config = require('./backend/config');
config.gemini = {
  enabled: true,
  apiKey: process.env.GEMINI_API_KEY
};

const { runOcrPipeline } = require('./backend/services/ocr_service');

async function test() {
  try {
    // create a dummy image
    const imagePath = path.join(__dirname, 'test.jpg');
    // Just copy an existing image or create a solid color one
    // We'll just run it. Wait, we need an image.
  } catch(e) {
    console.error(e);
  }
}
test();
