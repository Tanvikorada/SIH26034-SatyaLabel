const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const oldPrompt = `STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",`;

const newPrompt = `STEP 1: Examine the image for glare, stickers, and overall quality.
STEP 2: Identify how many DISTINCT products are in the image.
STEP 3: For EACH distinct product, extract its details into a JSON object.
STEP 4: Return a SINGLE JSON OBJECT containing a "products" array.

The JSON format MUST exactly match this structure:
{
  "products": [
    {
      "reasoning_log": "Explain your logic first. E.g., 'I see a sticker over the MRP, so I will prioritize it. The image is clear.'",
      "meta_image_quality": "good" | "blurry" | "glare" | "too_far",`;

js = js.replace(oldPrompt, newPrompt);
js = js.replace(oldPrompt, newPrompt); // Because it appears twice (Gemini and Groq)

const oldPromptEnd = `- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.\` + (tesseractText ?`;

const newPromptEnd = `- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the raw JSON object. Do not wrap it in markdown block quotes.\` + (tesseractText ?`;

js = js.replace(oldPromptEnd, newPromptEnd);
js = js.replace(oldPromptEnd, newPromptEnd);

// Fix Groq parsing
const oldGroqParse = `    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/\\s*/g, '').replace(/\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = { _raw_text: responseText };
      }`;

const newGroqParse = `    const responseText = completion.choices[0]?.message?.content || '';
    
    // Robust parsing: strip markdown blocks and find outermost {}
    let cleaned = responseText.replace(/\\s*/g, '').replace(/\\s*$/g, '').trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    try {
      const startObj = cleaned.indexOf('{');
      const endObj = cleaned.lastIndexOf('}');
      if (startObj !== -1 && endObj !== -1) {
        const jsonStr = cleaned.substring(startObj, endObj + 1);
        const parsed = JSON.parse(jsonStr);
        structuredData = parsed.products || [parsed];
      } else {
        structuredData = { _raw_text: responseText };
      }`;

// Wait, the regex replace in oldGroqParse was `replace(/```(?:json)?\s*/g, '')`. Let's just do a manual replace using indexOf.
fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("CoT prompt injected");
