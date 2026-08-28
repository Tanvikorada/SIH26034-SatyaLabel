const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

const badLines = `  if (geminiData.is_wholesale_or_multipiece_package) {
    finalFields.is_wholesale_or_multipiece_package = geminiData.is_wholesale_or_multipiece_package;
  }
// backend/services/extraction_service.js`;

js = js.replace(badLines, `// backend/services/extraction_service.js`);

// Now inject it correctly into mergeGeminiData
const target = `  for (const [gKey, finalKey] of Object.entries(GEMINI_KEY_MAP)) {
    if (g[gKey] && (!tier1Map[finalKey] || !tier1Map[finalKey].value)) {
      tier1Map[finalKey] = {
        value: String(g[gKey]),
        confidence: 'medium', // Fallback confidence
        source: 'gemini',
      };
    }
  }`;

const replacement = `  for (const [gKey, finalKey] of Object.entries(GEMINI_KEY_MAP)) {
    if (g[gKey] && (!tier1Map[finalKey] || !tier1Map[finalKey].value)) {
      tier1Map[finalKey] = {
        value: String(g[gKey]),
        confidence: 'medium', // Fallback confidence
        source: 'gemini',
      };
    }
  }

  if (g.is_wholesale_or_multipiece_package) {
    tier1Map.is_wholesale_or_multipiece_package = { value: true, confidence: 'medium', source: 'gemini' };
  }`;

if (js.includes(target) && !js.includes('g.is_wholesale_or_multipiece_package')) {
    js = js.replace(target, replacement);
}

fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Extraction service fixed");
