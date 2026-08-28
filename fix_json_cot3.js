const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. Update the Prompt (it occurs exactly twice in the file, we can use regex to replace)
js = js.replace(/STEP 1: Identify how many DISTINCT products[\s\S]*?"meta_image_quality": "good" \| "blurry" \| "glare" \| "too_far",/g, 
`STEP 1: Examine the image for glare, stickers, and overall quality.
STEP 2: Identify how many DISTINCT products are in the image.
STEP 3: For EACH distinct product, extract its details into a JSON object.
STEP 4: Return a SINGLE JSON OBJECT containing a "products" array.

The JSON format MUST exactly match this structure:
{
  "products": [
    {
      "reasoning_log": "Explain your logic first. E.g., 'I see a sticker over the MRP, so I will prioritize it.'",
      "meta_image_quality": "good" | "blurry" | "glare" | "too_far",`);

js = js.replace(/- Return ONLY the JSON array.` \+ /g, `- Return ONLY the raw JSON object. Do not wrap it in markdown block quotes.\` + `);

// 2. Replace Groq Parsing
const groqMatch = /const cleaned = responseText\.replace\([^)]*\)\.replace\([^)]*\)\.trim\(\);[\s\S]*?\} catch \(parseErr\) \{[\s\S]*?\}/;
js = js.replace(groqMatch, `// Robust parsing: extract outermost braces
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
    }`);

// 3. Replace Gemini Parsing
js = js.replace(groqMatch, `// Robust parsing: extract outermost braces
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
    }`);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("CoT and Parsing fixed.");
