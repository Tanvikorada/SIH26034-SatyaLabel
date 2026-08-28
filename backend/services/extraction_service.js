
// backend/services/extraction_service.js
// ============================================================
// Structured Field Extraction — Spec 04 Implementation
// Step 3: Raw OCR text → JSON fields
//
// TWO-TIER APPROACH (spec 04):
//   Tier 1 — Regex/pattern extraction (fast, free, always runs first)
//   Tier 2 — Gemini Vision fallback (only when Tier 1 confidence is low)
//
// Per-field CONFIDENCE TAGGING (spec 04 Step 4):
//   "high"   — matched by clear regex pattern
//   "medium" — extracted from Gemini structured data (LLM fallback)
//   "low"    — partial / ambiguous match
//
// OUTPUT: fieldsMap { fieldName → { value, confidence } }
// Passed directly into rules engine validateCompliance().
//
// SIH26034 — Legal Metrology Compliance Checker
// ============================================================

// ─── TEXT NORMALIZER ─────────────────────────────────────────────────────────

function normalizeText(text) {
  return (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── TIER 1 REGEX PATTERNS (spec 04 §Step 3 Tier 1) ─────────────────────────
// Tuned for Indian packaged commodity labels — all patterns are case-insensitive

const P = {
  // ── MRP (spec 04: exact patterns) ─────────────────────────────────────────
  // "MRP Rs. 120", "MRP: ₹45.00", "M.R.P ₹ 120"
  mrpLabelled: /(?:m\.?r\.?p\.?|max(?:imum)?\s+retail\s+price)\s*[:\s]*(?:rs\.?\s*|₹\s*)?(\d[\d,]*(?:\.\d{1,2})?)/gi,
  // Bare ₹ or Rs. (fallback for when MRP label is missing in OCR)
  mrpBare: /(?:₹|rs\.?)\s*(\d[\d,]*(?:\.\d{1,2})?)/gi,
  // "inclusive of all taxes" phrase
  inclTax: /incl(?:usive)?\.?\s*(?:of\s*)?all\s*tax(?:es)?|all\s*tax(?:es)?\s*incl/gi,

  // ── Net Quantity (spec 04: \d+\s?(g|kg|ml|l|mg)\b) ────────────────────────
  netQtyStrict: /(\d[\d.,]*\s*(?:kg|g|gm|gms|gram|grams|mg|ml|l|ltr|litre|litres|liters|liter|nos?\.?|pieces?|pcs?\.?|tabs?|tablets?|caps?|capsules?|sachets?|units?))\b/gi,
  // With "NET WT./QTY" label
  netQtyLabelled: /net\s*(?:wt|weight|qty|quantity|content|vol|volume)?\.?\s*:?\s*(\d[\d.,]*\s*(?:kg|g|gm|ml|l|ltr|litre|litres))/gi,

  // ── Manufacturing Date (spec 04: \d{1,2}[/-]\d{4} or [A-Za-z]+\s\d{4}) ──
  mfgDateLabelled: /(?:mfg\.?|manufactured?|mfrd?\.?|packing|packed)\s*(?:date|dt\.?)?\s*:?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4}|\d{1,2}[\/\-]\d{2,4})/gi,
  mfgDateBare: /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*20\d{2}|\d{1,2}[\/\-]20\d{2})\b/gi,

  // ── Best Before ───────────────────────────────────────────────────────────
  bestBefore: /(?:best\s*before|use\s*by|expiry|exp\.?|bb\.?\s*date?|shelf\s*life)\s*:?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4}|\d{1,2}[\/\-]\d{2,4}|\d+\s*(?:months?|days?|years?))/gi,

  // ── Consumer Care (spec 04: look for keywords near phone/email) ───────────
  carePhone: /(?:consumer\s*(?:helpline|care|service)|customer\s*(?:care|service|support)|toll\s*free|helpline|contact)\s*(?:no\.?|number|:)?\s*([+0-9][\d\s\-()]{7,18})/gi,
  careEmail: /(?:consumer\s*(?:helpline|care)|customer\s*care|email\s*:?\s*)?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi,
  careBarePhone: /(?<!\d)([+91\s]*[6-9]\d{9})\b/g, // Indian mobile numbers

  // ── Manufacturer block ────────────────────────────────────────────────────
  mfrBlock: /(?:manufactured?\s*(?:by|&\s*packed\s*by)?|mfrd?\.\s*by|packed\s*by|imported?\s*by|marketed\s*by)\s*:?\s*([\s\S]{5,300}?)(?=\n\n|\n(?:mfg|best|mrp|net|batch|fssai|consumer|toll|email|www\.|$))/gi,

  // ── FSSAI (14-digit) ──────────────────────────────────────────────────────
  fssaiLabelled: /(?:fssai|lic(?:ense)?\s*no\.?|food\s*lic\.?)\s*[:\s]*(\d{14})\b/gi,
  fssaiBare: /\b(\d{14})\b/g,

  // ── Batch number ──────────────────────────────────────────────────────────
  batchNo: /(?:batch\s*(?:no\.?|number|code)?|lot\s*(?:no\.?|number)?|b\.?\s*no\.?)\s*:?\s*([A-Z0-9\-\/]+)/gi,

  // ── Country of origin ─────────────────────────────────────────────────────
  countryOrigin: /(?:country\s*of\s*origin|made\s*in|product\s*of|imported\s*from)\s*:?\s*([A-Za-z\s]{3,30}?)(?:\n|,|\.)/gi,

  // ── Ingredients ───────────────────────────────────────────────────────────
  ingredients: /(?:ingredients?|composition)\s*:?\s*([\s\S]{10,600}?)(?=\n\nnutritional|allergen|manufactured|packed|net|mrp|batch|$)/gi,

  // ── Veg / Non-veg ────────────────────────────────────────────────────────
  vegNonVeg: /\b(non-?veg(?:etarian)?|veg(?:etarian)?)\b/gi,
};

// ─── REGEX EXTRACTORS (each returns { value, confidence }) ────────────────────

function extractMRP(text) {
  // Try labelled MRP first (high confidence)
  const re1 = new RegExp(P.mrpLabelled.source, 'gi');
  const m1 = re1.exec(text);
  if (m1) {
    const num = m1[1].trim();
    // Check if "inclusive of all taxes" is near MRP in text
    const inclTaxPresent = P.inclTax.test(text);
    const symbol = /₹/.test(text.substring(Math.max(0, m1.index - 10), m1.index + 20)) ? '₹' : 'Rs.';
    const val = `${symbol} ${num}${inclTaxPresent ? ' inclusive of all taxes' : ''}`;
    return { value: val, confidence: 'high' };
  }

  // Bare ₹/Rs. (medium confidence — may pick up non-MRP prices)
  const re2 = new RegExp(P.mrpBare.source, 'gi');
  const m2 = re2.exec(text);
  if (m2) {
    return { value: `Rs. ${m2[1].trim()}`, confidence: 'low' };
  }

  return { value: null, confidence: null };
}

function extractNetQuantity(text) {
  // Labelled "NET WT: 500g" — high confidence
  const re1 = new RegExp(P.netQtyLabelled.source, 'gi');
  const m1 = re1.exec(text);
  if (m1) return { value: m1[1].trim(), confidence: 'high' };

  // Bare quantity pattern — medium (may match non-qty numbers)
  const re2 = new RegExp(P.netQtyStrict.source, 'gi');
  const matches = [];
  let m;
  while ((m = re2.exec(text)) !== null) matches.push(m[1].trim());
  if (matches.length > 0) return { value: matches[0], confidence: 'medium' };

  return { value: null, confidence: null };
}

function extractMfgDate(text) {
  const re1 = new RegExp(P.mfgDateLabelled.source, 'gi');
  const m1 = re1.exec(text);
  if (m1) return { value: m1[1].trim(), confidence: 'high' };

  // Bare date near start of text (common on Indian labels)
  return { value: null, confidence: null };
}

function extractBestBefore(text) {
  const re = new RegExp(P.bestBefore.source, 'gi');
  const m = re.exec(text);
  return m ? { value: m[1].trim(), confidence: 'high' } : { value: null, confidence: null };
}

function extractCustomerCare(text) {
  const parts = [];
  let confidence = null;

  const rePhone = new RegExp(P.carePhone.source, 'gi');
  const m1 = rePhone.exec(text);
  if (m1) {
    parts.push(m1[1].trim());
    confidence = 'high';
  }

  const reEmail = new RegExp(P.careEmail.source, 'gi');
  const m2 = reEmail.exec(text);
  if (m2 && m2[1] && m2[1].includes('@')) {
    parts.push(m2[1].trim());
    confidence = confidence || 'high';
  }

  // Fallback: bare Indian mobile number
  if (parts.length === 0) {
    const reMobile = new RegExp(P.careBarePhone.source, 'g');
    const m3 = reMobile.exec(text);
    if (m3) {
      parts.push(m3[1].trim());
      confidence = 'low'; // could be any number
    }
  }

  return parts.length > 0
    ? { value: parts.join(' / '), confidence }
    : { value: null, confidence: null };
}

function extractManufacturerBlock(text) {
  const re = new RegExp(P.mfrBlock.source, 'gi');
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null && matches.length < 3) {
    matches.push(m[1].trim());
  }
  if (matches.length === 0) return { name: null, address: null, nameConf: null, addrConf: null };

  const fullBlock = matches[0];
  const lines = fullBlock.split('\n').map(l => l.trim()).filter(Boolean);

  return {
    name: lines[0] || null,
    address: lines.length > 1 ? lines.slice(1).join(', ') : null,
    nameConf: 'high',
    addrConf: lines.length > 1 ? 'high' : 'low',
  };
}

function extractFSSAI(text) {
  const re1 = new RegExp(P.fssaiLabelled.source, 'gi');
  const m1 = re1.exec(text);
  if (m1) return { value: m1[1].trim(), confidence: 'high' };

  const re2 = new RegExp(P.fssaiBare.source, 'g');
  const m2 = re2.exec(text);
  if (m2) return { value: m2[1].trim(), confidence: 'medium' };

  return { value: null, confidence: null };
}

function extractBatchNumber(text) {
  const re = new RegExp(P.batchNo.source, 'gi');
  const m = re.exec(text);
  return m ? { value: m[1].trim(), confidence: 'high' } : { value: null, confidence: null };
}

function extractCountryOfOrigin(text) {
  const re = new RegExp(P.countryOrigin.source, 'gi');
  const m = re.exec(text);
  return m ? { value: m[1].trim(), confidence: 'high' } : { value: null, confidence: null };
}

function extractIngredients(text) {
  const re = new RegExp(P.ingredients.source, 'gi');
  const m = re.exec(text);
  return m ? { value: m[1].trim(), confidence: 'high' } : { value: null, confidence: null };
}

function extractVegNonVeg(text) {
  const re = new RegExp(P.vegNonVeg.source, 'gi');
  const m = re.exec(text);
  if (!m) return { value: null, confidence: null };
  const val = m[1].toLowerCase().startsWith('non') ? 'non-veg' : 'veg';
  return { value: val, confidence: 'high' };
}

// ─── QUANTITY NORMALIZER ──────────────────────────────────────────────────────
// Used by rules engine for numeral height lookup table

const UNIT_MAP = {
  kg: 'kg', kgs: 'kg',
  g: 'g', gm: 'g', gms: 'g', gram: 'g', grams: 'g',
  mg: 'mg',
  l: 'L', ltr: 'L', litre: 'L', litres: 'L', liters: 'L', liter: 'L',
  ml: 'ml',
};

function normalizeQuantity(raw) {
  if (!raw) return null;
  const m = raw.match(/([\d.,]+)\s*([a-zA-Z]+)/);
  if (!m) return null;
  const value = parseFloat(m[1].replace(',', '.'));
  const unit = UNIT_MAP[m[2].toLowerCase()] || m[2].toLowerCase();
  return { value, unit, raw };
}

// ─── TIER 1 CONFIDENCE ASSESSMENT ────────────────────────────────────────────
// Decide if Tier 2 (Gemini) is needed based on how many high-confidence
// mandatory fields were extracted.

const MANDATORY_FIELDS = [
  'manufacturer_name', 'manufacturer_address',
  'product_name', 'net_quantity',
  'mrp', 'mfg_date', 'customer_care',
];

function assessTier1Confidence(tier1Map) {
  const found = MANDATORY_FIELDS.filter(f => tier1Map[f]?.value !== null);
  const highConf = MANDATORY_FIELDS.filter(f => tier1Map[f]?.confidence === 'high');

  return {
    fieldsCovered: found.length,
    fieldsTotal: MANDATORY_FIELDS.length,
    highConfFields: highConf.length,
    // Need Gemini if fewer than 3 mandatory fields found OR fewer than 2 high-conf
    needsTier2: found.length < 3 || highConf.length < 2,
  };
}

// ─── TIER 2: MERGE GEMINI DATA ────────────────────────────────────────────────
// Merge Gemini structured data into field map where Tier 1 failed.
// Gemini data gets confidence = 'medium'.

function mergeGeminiData(tier1Map, geminiData) {
  if (!geminiData) return tier1Map;
  const g = geminiData;

  // Gemini key → our field name mapping
  const GEMINI_KEY_MAP = {
    common_name: 'product_name',
    manufacturer_name: 'manufacturer_name',
    manufacturer_address: 'manufacturer_address',
    net_quantity: 'net_quantity',
    mrp: 'mrp',
    mfg_date: 'mfg_date',
    consumer_care_details: 'customer_care',
    // extra fields (from our extended prompt)
    brand_name: 'brand_name',
    best_before: 'best_before',
    batch_lot_number: 'batch_lot_number',
    fssai_license: 'fssai_license',
    country_of_origin: 'country_of_origin',
    ingredients: 'ingredients',
    veg_nonveg: 'veg_nonveg',
    nutrition: 'nutrition',
    allergens_or_warnings: 'allergens_or_warnings',
  };

  const merged = { ...tier1Map };

  for (const [geminiKey, ourKey] of Object.entries(GEMINI_KEY_MAP)) {
    const geminiVal = g[geminiKey];
    const existing = merged[ourKey];

    // Only use Gemini value if Tier 1 didn't find this field
    if ((existing?.value === null || existing?.value === undefined) && geminiVal !== null && geminiVal !== undefined) {
      merged[ourKey] = {
        value: String(geminiVal),
        confidence: 'medium', // LLM extraction = medium confidence
      };
    }
  }

  // Special: mrp_includes_tax_statement from Gemini
  if (g.mrp_includes_tax_statement && merged.mrp?.value) {
    const current = merged.mrp.value;
    if (!current.toLowerCase().includes('inclusive')) {
      merged.mrp = {
        value: `${current} inclusive of all taxes`,
        confidence: merged.mrp.confidence,
      };
    }
  }

  return merged;
}

// ─── MAIN: TWO-TIER EXTRACTION ────────────────────────────────────────────────

/**
 * Extract all mandatory fields from raw OCR text.
 *
 * Returns fieldsMap: { fieldName → fieldValue } for rules engine.
 * Also attaches confidence metadata via fieldsMap._confidence.
 *
 * Two-tier approach (spec 04):
 *   1. Run all regex extractors → get Tier 1 results with confidence tags
 *   2. Assess coverage — if too few fields found, use Gemini structured data
 *   3. Merge: prefer Tier 1 high-confidence values, fill gaps with Gemini
 *
 * @param {string} rawText      - Raw OCR text
 * @param {object|null} geminiStructuredData - From Gemini Vision (when used as fallback)
 * @param {object} [ocrFontMetrics] - From Tesseract bounding boxes for Rule 7
 * @returns {object} fieldsMap  - { fieldName → fieldValue, _confidence, _netQtyNormalized, ... }
 */
function extractFields(rawText, geminiStructuredData = null, ocrFontMetrics = null) {
  const text = normalizeText(rawText || '');
  const g = geminiStructuredData || null;

  // ── Tier 1: Regex extraction ──────────────────────────────────────────────
  const mfr = extractManufacturerBlock(text);

  const tier1 = {
    product_name:           { value: g?.common_name || g?.product_name || null, confidence: g ? 'medium' : null },
    brand_name:             { value: g?.brand_name || null, confidence: g ? 'medium' : null },
    net_quantity:           extractNetQuantity(text),
    mrp:                    extractMRP(text),
    mfg_date:               extractMfgDate(text),
    best_before:            extractBestBefore(text),
    manufacturer_name:      { value: mfr.name, confidence: mfr.nameConf },
    manufacturer_address:   { value: mfr.address, confidence: mfr.addrConf },
    customer_care:          extractCustomerCare(text),
    batch_lot_number:       extractBatchNumber(text),
    fssai_license:          extractFSSAI(text),
    country_of_origin:      extractCountryOfOrigin(text),
    ingredients:            extractIngredients(text),
    veg_nonveg:             extractVegNonVeg(text),
  };

  // ── Tier 1 confidence assessment ──────────────────────────────────────────
  const assessment = assessTier1Confidence(tier1);
  console.log(`[Extraction] Tier 1: ${assessment.fieldsCovered}/${assessment.fieldsTotal} fields, ${assessment.highConfFields} high-confidence`);

  // ── Tier 2: Merge Gemini data (if available) ──────────────────────────────
  // Always merge when Gemini data is present — it fills gaps.
  const finalMap = mergeGeminiData(tier1, g);

  // ── Build flat fieldsMap for rules engine ─────────────────────────────────
  // Rules engine expects: { fieldName → fieldValue }
  // We attach confidence as _confidence and font metrics as _fontMetrics
  const fieldsMap = {};
  const confidenceMap = {};

  for (const [key, entry] of Object.entries(finalMap)) {
    fieldsMap[key] = entry?.value ?? null;
    if (entry?.confidence) confidenceMap[key] = entry.confidence;
  }

  // ── Attach metadata for rules engine Rule Set 2 ───────────────────────────
  if (ocrFontMetrics) {
    fieldsMap._fontHeightPixels = ocrFontMetrics.minFontHeightPx;
    fieldsMap._avgFontHeightPx = ocrFontMetrics.avgFontHeightPx;
    // imageDPI is unknown for phone photos — we use a conservative 96 DPI assumption
    fieldsMap._imageDPI = 96;
  }

  // Net quantity normalized (for Rule 7 numeral height lookup)
  fieldsMap._netQtyNormalized = normalizeQuantity(fieldsMap.net_quantity);

  // Attach confidence map for UI display ("possible violation — verify manually")
  fieldsMap._confidence = confidenceMap;

  // Attach all detected MRP values (for contradictory declarations check)
  const allMrps = [];
  const mrpRe = new RegExp(P.mrpLabelled.source, 'gi');
  const mrpRe2 = new RegExp(P.mrpBare.source, 'gi');
  let mm;
  while ((mm = mrpRe.exec(text)) !== null) allMrps.push(mm[1]);
  if (allMrps.length === 0) {
    while ((mm = mrpRe2.exec(text)) !== null) allMrps.push(mm[1]);
  }
  fieldsMap._mrpValues = [...new Set(allMrps)];

  // Attach raw text for rules engine context checks (MRP "inclusive of all taxes")
  fieldsMap._rawText = text;

  console.log(`[Extraction] Final fields: ${Object.keys(fieldsMap).filter(k => !k.startsWith('_') && fieldsMap[k] !== null).join(', ')}`);

  return fieldsMap;
}

// ─── LEGACY COMPAT: array form (used by seed script + older code) ─────────────

/**
 * @deprecated Use extractFields() which returns a map directly.
 * Kept for backward compatibility with older routes.
 */
function extractFieldsArray(rawText, geminiData = null) {
  const map = extractFields(rawText, geminiData);
  return Object.entries(map)
    .filter(([k]) => !k.startsWith('_'))
    .map(([fieldName, fieldValue]) => ({
      fieldName,
      fieldValue: fieldValue !== null ? String(fieldValue) : null,
      isPresent: fieldValue !== null && fieldValue !== '',
      confidence: map._confidence?.[fieldName] || null,
      isEstimated: false,
    }));
}

/**
 * Convert legacy array form to map (for routes using the old API).
 * @deprecated - extractFields() now returns map directly.
 */
function fieldsToMap(fieldsArray) {
  if (!Array.isArray(fieldsArray)) return fieldsArray; // already a map
  return fieldsArray.reduce((acc, f) => {
    acc[f.fieldName] = f.fieldValue;
    return acc;
  }, {});
}

module.exports = {
  extractFields,
  extractFieldsArray,
  fieldsToMap,
  normalizeQuantity,
  assessTier1Confidence,
};
