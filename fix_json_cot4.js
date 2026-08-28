const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const promptSearch = `STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",`;

const promptReplace = `STEP 1: Examine the image for glare, stickers, and overall quality.
STEP 2: Identify how many DISTINCT products are in the image.
STEP 3: For EACH distinct product, extract its details into a JSON object.
STEP 4: Return a SINGLE JSON OBJECT containing a "products" array.

The JSON format MUST exactly match this structure:
{
  "products": [
    {
      "reasoning_log": "Explain your logic first. E.g., 'I see a sticker over the MRP, so I will prioritize it.'",
      "meta_image_quality": "good" | "blurry" | "glare" | "too_far",`;

js = js.split(promptSearch).join(promptReplace);
js = js.split('- Return ONLY the JSON array.` + ').join('- Return ONLY the raw JSON object. Do not wrap it in markdown block quotes.` + ');

const geminiParseSearch = `    const cleaned = responseText.replace(/\`\`\`(?:json)?\\s*/g, '').replace(/\`\`\`\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = { _raw_text: responseText };
      }
    } catch (parseErr) {
      structuredData = { _raw_text: responseText };
    }`;

const robustParse = `
    // Robust parsing: extract outermost braces
    let jsonStr = '';
    const startObj = responseText.indexOf('{');
    const endObj = responseText.lastIndexOf('}');
    
    if (startObj !== -1 && endObj !== -1) {
      jsonStr = responseText.substring(startObj, endObj + 1);
    }
    
    try {
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        structuredData = parsed.products || (Array.isArray(parsed) ? parsed : [parsed]);
      } else {
        structuredData = { _raw_text: responseText };
      }
    } catch (parseErr) {
      console.warn('[OCR] JSON parse failed - using raw text');
      structuredData = { _raw_text: responseText };
    }`;

js = js.split(geminiParseSearch).join(robustParse);

const groqParseSearch = `    const cleaned = responseText.replace(/\`\`\`(?:json)?\\s*/g, '').replace(/\`\`\`\\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      } else {
        structuredData = { _raw_text: responseText };
      }
    } catch (parseErr) {
      console.warn('[OCR] JSON parse failed - using raw text');
      structuredData = { _raw_text: responseText };
    }`;

js = js.split(groqParseSearch).join(robustParse);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Replaced!");
