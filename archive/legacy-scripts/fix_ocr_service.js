const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// Update runGeminiVision
const targetGemini = `async function runGeminiVision(imagePath, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  try {
    const imageBuffer = require('fs').readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');`;
const replaceGemini = `async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];`;
js = js.replace(targetGemini, replaceGemini);

const targetGeminiPayload = `    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ],`;
const replaceGeminiPayload = `    const parts = [{ text: prompt }];
    for (const p of paths) {
      const buffer = require('fs').readFileSync(p);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: buffer.toString('base64') } });
    }
    const payload = { contents: [{ parts }],`;
js = js.replace(targetGeminiPayload, replaceGeminiPayload);

// Update runGroqVision
const targetGroq = `async function runGroqVision(imagePath, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  try {
    const imageBuffer = require('fs').readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');`;
const replaceGroq = `async function runGroqVision(imagePaths, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];`;
js = js.replace(targetGroq, replaceGroq);

const targetGroqPayload = `      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: \`data:image/jpeg;base64,\${base64Image}\`
                }
              }
            ]
          }
        ],`;
const replaceGroqPayload = `      const content = [{ type: "text", text: prompt }];
      for (const p of paths) {
        const buffer = require('fs').readFileSync(p);
        content.push({ type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${buffer.toString('base64')}\` } });
      }
      
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content }],`;
js = js.replace(targetGroqPayload, replaceGroqPayload);

// Update runOcrPipeline
const targetOcr = `async function runOcrPipeline(imagePath, metadata = {}) {
    let processedPath = null;
    try {
        await validateResolution(imagePath);
        processedPath = await preprocessImage(imagePath);`;
const replaceOcr = `async function runOcrPipeline(imagePaths, metadata = {}) {
    let processedPaths = [];
    try {
        const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
        for (const p of paths) {
          await validateResolution(p);
          processedPaths.push(await preprocessImage(p));
        }`;
js = js.replace(targetOcr, replaceOcr);

// Replace processedPath usages in runOcrPipeline
js = js.replace(/runGroqVision\(processedPath/g, "runGroqVision(processedPaths");
js = js.replace(/runGeminiVision\(processedPath/g, "runGeminiVision(processedPaths");

// Fix cleanup
const targetCleanup = `  } finally {
    if (processedPath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch (_) {}
    }
  }`;
const replaceCleanup = `  } finally {
    for (const p of processedPaths) {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (_) {}
      }
    }
  }`;
js = js.replace(targetCleanup, replaceCleanup);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Updated ocr_service.js for multi-image processing!");
