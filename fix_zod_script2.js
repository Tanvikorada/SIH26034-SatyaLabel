const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const replaceGroq = `    try {
      const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;`;

// Using regex to replace the entire try-catch block for JSON matching
js = js.replace(/    try \{\s*const jsonMatch = cleaned\.match\(\/\[\\\[\\\{\]\[\\s\\S\]\*\[\\\]\\\}\]\/\);\s*if \(jsonMatch\) \{\s*structuredData = JSON\.parse\(jsonMatch\[0\]\);\s*\} else \{\s*structuredData = \{ _raw_text: responseText \};\s*\}\s*\} catch \(parseErr\) \{\s*console\.warn\('\[OCR\] JSON parse failed - using raw text'\);\s*structuredData = \{ _raw_text: responseText \};\s*\}\s*rawText = structuredData\._raw_text \|\| responseText;/g, replaceGroq);

const replaceGemini = `      try {
        const jsonMatch = cleaned.match(/[\\[\\{][\\s\\S]*[\\]\\}]/);
        const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
        const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
        structuredData = AIResponseSchema.parse(toValidate);
      } catch (parseErr) {
        console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
        throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
      }
      
      rawText = structuredData._raw_text || responseText;`;

js = js.replace(/      try \{\s*const jsonMatch = cleaned\.match\(\/\[\\\[\\\{\]\[\\s\\S\]\*\[\\\]\\\}\]\/\);\s*if \(jsonMatch\) \{\s*structuredData = JSON\.parse\(jsonMatch\[0\]\);\s*\} else \{\s*structuredData = \{ _raw_text: responseText \};\s*\}\s*\} catch \(e\) \{\s*console\.warn\('\[OCR\] JSON parse failed, returning raw text\.', e\.message\);\s*structuredData = \{ _raw_text: responseText, _parse_error: e\.message \};\s*\}\s*rawText = structuredData\._raw_text \|\| responseText;/g, replaceGemini);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("Replaced:", js.includes("AI hallucinated bad JSON schema"));
