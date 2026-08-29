const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. runGeminiVision
const regexGemini = /async function runGeminiVision\(imagePath, attempt = 1, modelName = 'gemini-1\.5-flash-latest', tesseractText = ''\) \{[\s\S]*?const base64Image = imageBuffer\.toString\('base64'\);/g;
const replaceGemini = `async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-1.5-flash-latest', tesseractText = '') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];`;
if (regexGemini.test(js)) js = js.replace(regexGemini, replaceGemini);

const regexGeminiPayload = /const payload = \{\s*contents: \[\s*\{\s*parts: \[\s*\{\s*text: prompt\s*\},\s*\{\s*inlineData: \{\s*mimeType: 'image\/jpeg',\s*data: base64Image\s*\}\s*\}\s*\]\s*\}\s*\]/g;
const replaceGeminiPayload = `const parts = [{ text: prompt }];
    for (const p of paths) {
      const buffer = require('fs').readFileSync(p);
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: buffer.toString('base64') } });
    }
    const payload = { contents: [{ parts }]`;
if (regexGeminiPayload.test(js)) js = js.replace(regexGeminiPayload, replaceGeminiPayload);


// 2. runGroqVision
const regexGroq = /async function runGroqVision\(imagePath, attempt = 1, modelName = 'qwen\/qwen3\.8-27b', tesseractText = ''\) \{[\s\S]*?const base64Image = imageBuffer\.toString\('base64'\);/g;
const replaceGroq = `async function runGroqVision(imagePaths, attempt = 1, modelName = 'qwen/qwen3.8-27b', tesseractText = '') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];`;
if (regexGroq.test(js)) js = js.replace(regexGroq, replaceGroq);

const regexGroqPayload = /const completion = await groq\.chat\.completions\.create\(\{[\s\S]*?messages: \[\s*\{\s*role: "user",\s*content: \[\s*\{\s*type: "text",\s*text: prompt\s*\},\s*\{\s*type: "image_url",\s*image_url: \{\s*url: `data:image\/jpeg;base64,\$\{base64Image\}`\s*\}\s*\}\s*\]\s*\}\s*\]/g;
const replaceGroqPayload = `const content = [{ type: "text", text: prompt }];
      for (const p of paths) {
        const buffer = require('fs').readFileSync(p);
        content.push({ type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${buffer.toString('base64')}\` } });
      }
      
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content }]`;
if (regexGroqPayload.test(js)) js = js.replace(regexGroqPayload, replaceGroqPayload);

// 3. runOcrPipeline finally block
const regexCleanup = /\} finally \{\s*if \(processedPath && fs\.existsSync\(processedPath\)\) \{\s*try \{ fs\.unlinkSync\(processedPath\); \} catch \(_\) \{\}\s*\}\s*\}/g;
const replaceCleanup = `} finally {
    for (const p of processedPaths) {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (_) {}
      }
    }
  }`;
if (regexCleanup.test(js)) js = js.replace(regexCleanup, replaceCleanup);

// Replace runGeminiVision and runGroqVision recursive calls
js = js.replace(/runGeminiVision\(imagePath/g, "runGeminiVision(imagePaths");
js = js.replace(/runGroqVision\(imagePath/g, "runGroqVision(imagePaths");

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Fixed OCR service definitions via regex!");
