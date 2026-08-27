const fs = require('fs');
let js = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

// 1. Add return statement at the end of runOcrPipeline
const badEnd = `          } catch (geminiErr) {
            console.warn("[OCR] Gemini fallback failed: " + geminiErr.message);
          }
        }
      } catch (err) {`;

const goodEnd = `          } catch (geminiErr) {
            console.warn("[OCR] Gemini fallback failed: " + geminiErr.message);
          }
        }
        
        return {
          text: ocrResult.text || '',
          engine: "tesseract",
          confidenceAvg: ocrResult.confidence || 0,
          geminiStructuredData: null,
          _fontMetrics: ocrResult._fontMetrics || [],
          _jsonText: null
        };
      } catch (err) {`;

js = js.replace(badEnd, goodEnd);

// 2. Fix the prompts
const newPrompt = `const STRUCTURED_PROMPT = \`You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing an image that may contain ONE OR MORE consumer packaged goods.

STEP 1: Identify how many DISTINCT products are in the image.
STEP 2: For EACH distinct product, extract its details into a JSON object.
STEP 3: Return a JSON ARRAY containing these objects. (Even if there is only 1 product, return an array with 1 object).

For EACH product object, you MUST include these exact keys:
{
  "meta_image_quality": "good" | "blurry" | "glare" | "too_far",
  "meta_obstruction": "none" | "thumb_covering_text" | "partially_cut_off",
  "meta_quality_reason": "Explain if it is blurry or obstructed. If good, put null",
  "manufacturer_name": "string or null",
  "manufacturer_address": "string or null",
  "common_name": "string or null",
  "net_quantity": "string or null",
  "net_quantity_unit": "string or null",
  "mrp": "string or null",
  "mrp_includes_tax_statement": true/false,
  "mfg_date": "string or null",
  "consumer_care_details": "string or null",
  "brand_name": "string or null",
  "best_before": "string or null",
  "batch_lot_number": "string or null",
  "fssai_license": "string or null",
  "country_of_origin": "string or null",
  "ingredients": "string or null",
  "nutrition": "string or null",
  "veg_nonveg": "string or null",
  "allergens_or_warnings": "string or null"
}

CRITICAL RULES FOR HALLUCINATION PREVENTION:
- If a value (like MRP) is blurry, obstructed by a thumb, or cut off, DO NOT GUESS IT. Set it to null.
- It is better to return null than to return a wrong value. You are a strict legal auditor.
- Return ONLY the JSON array.\`;`;

js = js.replace(/const STRUCTURED_PROMPT = `You are extracting mandatory declarations[\s\S]*?\{ "error": "MULTI_PRODUCT_DETECTED" \}[\s\S]*?"allergens_or_warnings": string or null\n  \}`/g, newPrompt);

fs.writeFileSync('backend/services/ocr_service.js', js);
console.log("OCR fixed");
