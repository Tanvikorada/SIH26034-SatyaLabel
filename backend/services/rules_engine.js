// backend/services/rules_engine.js
// ============================================================
// LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011
// Compliance Rule Engine — SIH26034 SatyaLabel
// ============================================================
//
// Source: Legal Metrology (Packaged Commodities) Rules, 2011
//         as structured in Legal_Metrology_PS_Compliance_Blueprint (2).docx
//
// ARCHITECTURE:
//   PURE MODULE — no I/O, no DB, no HTTP.
//   Input:  fieldsMap { fieldName → fieldValue } + optional options
//   Output: { results, violations, stats, ruleVersion }
//
// STATUS SYSTEM (5-status — blueprint §8):
//   PASS                   — evidence sufficient, requirement met
//   POTENTIAL NON-COMPLIANCE — automated evidence indicates requirement not satisfied
//   MANUAL REVIEW          — evidence or legal context insufficient for auto-conclusion
//   NOT APPLICABLE         — applicability/exemption engine says rule does not apply
//   NOT VERIFIED           — required input, image quality or scale is missing
//
// PIPELINE ORDER (blueprint §1):
//   1. Applicability gate (Rule 3)
//   2. Exemption check (Rule 26)
//   3. Declaration checks (Rules 6, 10, 11, 12, 13)
//   4. Presentation checks (Rules 7, 8, 9)
//   5. Advertisement/Listing check (Rule 31)
//
// CRITICAL DESIGN WARNINGS (blueprint §12):
//   - Never treat OCR failure as proof that a declaration is legally absent.
//   - Never convert pixels to mm without a scale/calibration source.
//   - Never apply one unit rule to every commodity (Fourth Schedule has exceptions).
//   - Keep original images, OCR boxes, confidence and evidence crops.
//   - Use POTENTIAL NON-COMPLIANCE and MANUAL REVIEW not binary pass/fail.
//   - Store rule version + effective date with every result.
// ============================================================

// ─── RULE VERSION METADATA (blueprint §2 Rule 1 & §14) ───────────────────────
const RULE_VERSION = {
  instrument:      'Legal Metrology (Packaged Commodities) Rules, 2011',
  source_document: 'Legal_Metrology_PS_Compliance_Blueprint__2_.docx',
  version_id:      'LM-PC-2011-v1.0',
  effective_from:  '2011-04-01',
  effective_to:    null,          // null = currently in force
  checked_at:      new Date().toISOString(),
};

// ─── STATUS CONSTANTS ─────────────────────────────────────────────────────────
const S = {
  PASS:    'PASS',
  PNOC:    'POTENTIAL NON-COMPLIANCE',  // blueprint abbrev
  REVIEW:  'MANUAL REVIEW',
  NA:      'NOT APPLICABLE',
  NV:      'NOT VERIFIED',
};

// ─── RESULT FACTORIES ─────────────────────────────────────────────────────────

function makeResult(rule_id, rule_title, field, status, severity = null, detail = null, confidence = 'high') {
  return {
    rule_id,
    rule_title,
    field,
    status,
    severity,     // 'high' | 'medium' | 'low' | null
    detail,
    confidence,   // 'high' (presence/pattern) | 'estimated' (image-based)
    
  };
}

const pass   = (id, title, field, conf = 'high') =>
  makeResult(id, title, field, S.PASS, null, null, conf);

const pnoc   = (id, title, field, severity, detail, conf = 'high') =>
  makeResult(id, title, field, S.PNOC, severity, detail, conf);

const review = (id, title, field, severity, detail, conf = 'estimated') =>
  makeResult(id, title, field, S.REVIEW, severity, detail, conf);

const na     = (id, title, field, detail = 'Rule not applicable to this package.') =>
  makeResult(id, title, field, S.NA, null, detail, 'high');

const nv     = (id, title, field, detail) =>
  makeResult(id, title, field, S.NV, null, detail, 'estimated');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const isPresent = (val) =>
  val !== null && val !== undefined && String(val).trim().length > 0;

// Standard SI units per LM(PC) Rules 2011 + Rule 13
const STANDARD_UNITS = /(?:^|\s|\d)(g|gm|gms|gram|grams|kg|kgs|mg|ml|l|ltr|litre|litres|liters|liter|cm|m|mm|nos?\.?|pieces?|pcs?\.?|tablets?|tabs?|capsules?|caps?|sachets?|units?|pairs?|sets?|sheets?)(?=\b|$|\s)/i;

// Non-metric / non-standard units — Rule 13 violation
const NON_STANDARD_UNITS = /\b(oz|ounce|ounces|lb|lbs|pound|pounds|tola|seer|maund|fluid\s+oz|fl\.?\s*oz)\b/i;

// Rule 12 — prohibited misleading quantity qualifiers
const MISLEADING_QUALIFIERS = /\b(minimum|not\s+less\s+than|average|about|approximately|approx\.?|at\s+least|upto|up\s+to)\b/i;

// MRP symbol check
const MRP_SYMBOL = /[₹]|rs\.?/i;
const INCL_TAX   = /incl(?:usive)?\.?\s+(?:of\s+)?all\s+tax|incl\.?\s+all\s+taxes?|all\s+taxes?\s+incl|inclusive\s+of\s+taxes?/i;

// PIN code pattern (6 digits)
const PIN_CODE = /\b[1-9][0-9]{5}\b/;

// Indian city / state keywords for address heuristic
const ADDRESS_KEYWORDS = /\b(mumbai|delhi|bangalore|bengaluru|chennai|kolkata|hyderabad|pune|ahmedabad|jaipur|lucknow|navi\s*mumbai|gurugram|noida|gurgaon|thane|surat|vadodara|maharashtra|karnataka|tamil\s*nadu|gujarat|rajasthan|uttar\s*pradesh|west\s*bengal|andhra|telangana|haryana|punjab|kerala|india)\b/i;

// Date patterns: MM/YYYY, Month YYYY, YYYY-MM
const DATE_PATTERNS = [
  /\b(0?[1-9]|1[0-2])[\/\-](20\d{2})\b/,
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+20\d{2}\b/i,
  /\b20\d{2}[\/\-](0?[1-9]|1[0-2])\b/,
];

function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  const m1 = s.match(/^(0?[1-9]|1[0-2])[\/\-](20\d{2})$/);
  if (m1) return { month: parseInt(m1[1]), year: parseInt(m1[2]) };
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const m2 = s.match(/([a-zA-Z]+)\.?\s+(20\d{2})/);
  if (m2) {
    const idx = months.findIndex(m => m2[1].toLowerCase().startsWith(m));
    if (idx !== -1) return { month: idx + 1, year: parseInt(m2[2]) };
  }
  return null;
}

// ─── RULE 3 — APPLICABILITY GATE ─────────────────────────────────────────────
// blueprint §2 Rule 3 (P1 — Gatekeeper)
// Returns: NA result if package is clearly out of scope; null otherwise (continue)
//
// Cannot be definitively determined from an image alone — key principle.
// If officer has confirmed applicability, use that; otherwise flag for review.

function checkApplicability(fields, options) {
  const R = 'Rule 3';
  const T = 'Applicability of the Chapter';

  // Officer explicitly flagged as not applicable (industrial/institutional/exempt)
  if (options.is_not_applicable === true) {
    return na(R, T, 'applicability',
      `Officer confirmed: this package is not subject to Chapter II retail-package provisions. Reason: ${options.not_applicable_reason || 'Not specified'}.`);
  }

  // If officer confirmed applicability, proceed (return null = no issue, continue checks)
  if (options.applicability_confirmed === true) return null;

  // Image alone cannot prove applicability — return MANUAL REVIEW
  return review(R, T, 'applicability', 'low',
    'Applicability of Chapter II retail-package provisions could not be confirmed from image alone. ' +
    'Verify that this is a retail package (not wholesale, industrial or institutional) before applying mandatory-declaration checks.');
}

// ─── RULE 26 — EXEMPTION CHECK ───────────────────────────────────────────────
// blueprint §2 Rule 26 (P1 — Gatekeeper)
// Certain small packages and listed categories are exempt.
//
// Exemption matrix (Rule 26 as specified in the Rules):
//   - Fast food (immediate consumption)
//   - Drug formulations covered under Drugs & Cosmetics Act
//   - Agricultural produce (not processed)
//   - Packages under 10g / 10ml in some categories
//   - Other categories specified in amendments
//
// Returns: NA result if exempt; null if not exempt / inconclusive

function checkExemption(fields, options) {
  const R = 'Rule 26';
  const T = 'Exemption — Certain Package Categories';

  // Officer explicitly confirmed exemption
  if (options.is_exempt === true) {
    return na(R, T, 'exemption',
      `Officer confirmed exemption under Rule 26. Category: ${options.exempt_category || 'Not specified'}. ` +
      `Rule version: ${RULE_VERSION.version_id}.`);
  }

  // Heuristic: check if product category suggests exemption
  const category = String(fields.category || options.category || '').toLowerCase();
  const productName = String(fields.product_name || '').toLowerCase();

  // Fast food / street food / immediate consumption heuristic
  if (/fast\s*food|street\s*food|ready\s*to\s*eat.*counter|take\s*away/.test(productName)) {
    return review(R, T, 'exemption', 'low',
      'Product may be exempt under Rule 26 (fast food/immediate consumption). ' +
      'Officer should confirm exemption status before applying full checklist.');
  }

  // Drug / pharma — potentially under Drugs & Cosmetics Act not LM(PC)
  if (/drug|pharma|medicine|tablet|capsule|syrup|injection/.test(category) ||
      isPresent(fields.drug_license)) {
    return review(R, T, 'exemption', 'low',
      'Product may be a drug formulation under the Drugs & Cosmetics Act and may be exempt from some LM(PC) provisions. ' +
      'Officer should verify applicable law before citing LM(PC) violations.');
  }

  // Cannot confirm exemption from image — return null (proceed with checks)
  return null;
}

// ─── RULE 6 — MANDATORY DECLARATIONS ─────────────────────────────────────────
// blueprint §2 Rule 6, Check IDs C01–C08 (P1 — Critical)
// Every package must carry all mandatory declarations.

// C01 — Manufacturer / Packer / Importer Name (Rule 6 / Rule 10)
function checkManufacturerName(fields) {
  const R = 'Rule 6 / Rule 10';
  const T = 'Name of Manufacturer / Packer / Importer';
  const f = 'manufacturer_name';

  // Prefer manufacturer; fall back to packer or importer
  const val = fields.manufacturer_name || fields.packer_name || fields.importer_name;

  if (!isPresent(val)) {
    return pnoc(R, T, f, 'high',
      'Name of the manufacturer, packer, or importer is not declared on the label. ' +
      'This is a mandatory declaration under Rule 6 read with Rule 10.');
  }
  return pass(R, T, f);
}

// C01 (address part) — Manufacturer / Packer / Importer Address (Rule 6 / Rule 10)
function checkManufacturerAddress(fields) {
  const R = 'Rule 6 / Rule 10';
  const T = 'Address of Manufacturer / Packer / Importer';
  const f = 'manufacturer_address';

  const val = fields.manufacturer_address || fields.packer_address || fields.importer_address;

  if (!isPresent(val)) {
    return pnoc(R, T, f, 'high',
      'Complete address of the manufacturer, packer, or importer is absent. ' +
      'A complete address is mandatory under Rule 6 read with Rule 10.');
  }

  const addr = String(val);
  const hasPIN  = PIN_CODE.test(addr);
  const hasCity = ADDRESS_KEYWORDS.test(addr);

  if (!hasPIN && !hasCity) {
    return pnoc(R, T, f, 'medium',
      `Address "${addr.slice(0, 80)}…" does not contain a recognizable PIN code or city/state name. ` +
      'A complete address is required under Rule 10. ' +
      'Note: If a shorter registered address is approved under Rule 28, this may be NOT APPLICABLE — officer should verify.');
  }
  return pass(R, T, f);
}

// C02 — Country of Origin (Rule 6 applicable version, imported products)
function checkCountryOfOrigin(fields, options) {
  const R = 'Rule 6';
  const T = 'Country of Origin (Imported Products)';
  const f = 'country_of_origin';

  // Only mandatory for imported products
  const isImported = options.is_imported === true ||
                     isPresent(fields.importer_name) ||
                     /import/i.test(String(fields.manufacturer_name || ''));

  if (!isImported) {
    return na(R, T, f, 'Country of origin declaration applies only to imported products. This package does not appear to be imported.');
  }

  if (!isPresent(fields.country_of_origin)) {
    return pnoc(R, T, f, 'high',
      'Country of origin is not declared on this imported product label. ' +
      'This is mandatory for imported products under Rule 6.');
  }
  return pass(R, T, f);
}

// C03 — Common / Generic Name (Rule 6)
function checkGenericName(fields) {
  const R = 'Rule 6(b)';
  const T = 'Common / Generic Name of Commodity';
  const f = 'product_name';

  if (!isPresent(fields.product_name)) {
    return pnoc(R, T, f, 'high',
      'The common or generic name of the commodity is not declared on the label. ' +
      'This is mandatory under Rule 6. Note: a brand name alone is not sufficient — a common/generic name is required.');
  }
  return pass(R, T, f);
}

// C04 — Net Quantity / Number (Rules 6 / 11)
function checkNetQuantityPresence(fields) {
  const R = 'Rule 6 / Rule 11';
  const T = 'Net Quantity Declaration';
  const f = 'net_quantity';

  if (!isPresent(fields.net_quantity)) {
    return pnoc(R, T, f, 'high',
      'No net quantity declaration detected on the label. ' +
      'Every packaged commodity must declare its net weight, volume, or count under Rules 6 and 11.');
  }
  return pass(R, T, f);
}

// C05 — Unit Convention (Rule 13 + Fourth Schedule exceptions)
function checkUnitConvention(fields) {
  const R = 'Rule 13';
  const T = 'Statement of Units — Standard SI Units Required';
  const f = 'net_quantity';

  if (!isPresent(fields.net_quantity)) return pass(R, T, f); // Caught by presence check

  const qty = String(fields.net_quantity);

  // Explicit non-standard unit
  if (NON_STANDARD_UNITS.test(qty)) {
    const match = qty.match(NON_STANDARD_UNITS);
    return pnoc(R, T, f, 'high',
      `Net quantity uses non-standard unit "${match?.[0]}". ` +
      'Only SI/metric units (g, kg, ml, L, m, cm, pieces, nos.) are permitted under Rule 13. ' +
      'Note: Rule 13 has commodity-specific exceptions in the Fourth Schedule — officer should check if an exception applies.');
  }

  // No numeric value
  if (!/\d/.test(qty)) {
    return pnoc(R, T, f, 'high',
      `Net quantity "${qty}" does not contain a numeric value. A quantity like "500g" or "1 kg" is required under Rule 11.`);
  }

  // No recognized unit
  if (!STANDARD_UNITS.test(qty)) {
    return pnoc(R, T, f, 'medium',
      `Net quantity "${qty}" does not contain a recognized standard unit. ` +
      'Valid units include: g, kg, ml, L, cm, m, nos., pieces. ' +
      'Check the Fourth Schedule for commodity-specific exceptions before citing a violation.');
  }

  return pass(R, T, f);
}

// C06 — Month and Year of Manufacture / Pre-packing / Import (Rule 6)
function checkMfgDate(fields) {
  const R = 'Rule 6';
  const T = 'Month and Year of Manufacture / Pre-packing / Import';
  const f = 'mfg_date';

  if (!isPresent(fields.mfg_date)) {
    // Low OCR confidence or missing — don't claim it's definitively absent
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f,
        'Month/year of manufacture was not detected, but OCR confidence is low. ' +
        'Cannot confirm absence of this declaration from a low-quality image — physical inspection required.');
    }
    return pnoc(R, T, f, 'high',
      'Month and year of manufacture/packing/import is not declared. ' +
      'This is mandatory under Rule 6. Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025).');
  }

  const str = String(fields.mfg_date).trim();
  const validFormat = DATE_PATTERNS.some(p => p.test(str));

  if (!validFormat) {
    return pnoc(R, T, f, 'medium',
      `Manufacturing date "${str}" does not match a valid format. ` +
      'Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025) per Rule 6.');
  }

  const parsed = parseDate(str);
  if (parsed) {
    const now = new Date();
    if (parsed.year > now.getFullYear() + 1) {
      return pnoc(R, T, f, 'medium',
        `Manufacturing date year "${parsed.year}" is implausibly far in the future. ` +
        'Possible OCR misread or mislabeling — verify physically.');
    }
  }

  return pass(R, T, f);
}

// C14 — Best Before / Use By / Expiry Date (Rule 6 / Rule 2)
// Blueprint C14: perishable and limited-shelf-life packages must declare
// a best-before or use-by date. Not mandatory for all packages — engine
// returns NOT APPLICABLE if the product category is clearly non-perishable.
function checkBestBefore(fields, options) {
  const R  = 'Rule 6 / Rule 2';
  const T  = 'Best Before / Use By Date';
  const f  = 'best_before';

  const category    = String(fields.category    || options.category    || '').toLowerCase();
  const productName = String(fields.product_name || '').toLowerCase();

  // Clearly non-perishable categories — rule is NOT APPLICABLE
  const nonPerishable = /electronics?|apparel|clothing|textile|hardware|stationery|tool|toy|cosmetic(?!.*food)/i;
  if (nonPerishable.test(category) || nonPerishable.test(productName)) {
    return na(R, T, f, 'Best before / use by date is not required for non-perishable goods in this category.');
  }

  // Food / beverage / pharma / FMCG — best before IS required
  const perishable = /food|beverage|drink|snack|biscuit|chip|juice|milk|dairy|bread|bakery|meat|fish|egg|medicine|drug|pharma|cream|lotion|shampoo|soap|toothpaste|ayurvedic|herbal/i;
  const isLikelyPerishable = perishable.test(category) || perishable.test(productName);

  if (!isPresent(fields.best_before)) {
    // Low OCR confidence → NOT VERIFIED, not PNOC
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f,
        'Best before / use by date was not detected, but OCR confidence is low. ' +
        'Cannot confirm absence of this declaration from a low-quality image — physical inspection required.');
    }
    if (isLikelyPerishable) {
      return pnoc(R, T, f, 'high',
        'Best before / use by date is not declared. ' +
        'This is mandatory for perishable goods under Rule 6 read with Rule 2. ' +
        'Required format: Best Before MM/YYYY or Use By Month YYYY.');
    }
    // Unknown category — cannot auto-conclude, flag for review
    return review(R, T, f, 'low',
      'Best before / use by date was not detected. ' +
      'If this product is perishable or has a shelf life, this declaration is mandatory under Rule 6. ' +
      'Officer should verify whether best-before is required for this product category.');
  }

  // Validate format if present
  const str = String(fields.best_before).trim();
  const validFormat = DATE_PATTERNS.some(p => p.test(str)) ||
    /best\s*before|use\s*by|exp(?:iry)?|bb\s*date/i.test(str);

  if (!validFormat) {
    return review(R, T, f, 'low',
      `Best before / use by value "${str}" was detected but could not be validated against a standard format. ` +
      'Expected format: MM/YYYY or Month YYYY. Officer should verify this field physically.');
  }

  // Check that best_before is not in the past by more than 5 years (OCR misread)
  const parsed = parseDate(str);
  if (parsed) {
    const now  = new Date();
    const diffYears = now.getFullYear() - parsed.year;
    if (diffYears > 5) {
      return pnoc(R, T, f, 'medium',
        `Best before date year "${parsed.year}" is more than 5 years in the past. ` +
        'Possible expired product or OCR misread — verify physically.');
    }
  }

  return pass(R, T, f);
}

// C07 — MRP / Retail Sale Price inclusive of all taxes (Rule 6 / Rule 2)
function checkMRP(fields) {
  const R = 'Rule 6 / Rule 2';
  const T = 'Maximum Retail Price (MRP) — Inclusive of All Taxes';
  const f = 'mrp';

  const rawText = String(fields._rawText || '');

  if (!isPresent(fields.mrp)) {
    const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;
    if (ocrConf !== undefined && ocrConf < 70) {
      return nv(R, T, f,
        'MRP was not detected, but OCR confidence is low. ' +
        'Cannot confirm absence from a low-quality image — physical inspection required.');
    }
    return pnoc(R, T, f, 'high',
      'MRP (Maximum Retail Price inclusive of all taxes) is not declared on the label. ' +
      'This is mandatory under Rule 6 read with Rule 2.');
  }

  const mrpStr = String(fields.mrp);

  // Check ₹ / Rs. symbol
  if (!MRP_SYMBOL.test(mrpStr) && !MRP_SYMBOL.test(rawText.slice(0, 500))) {
    return pnoc(R, T, f, 'medium',
      `MRP value "${mrpStr}" does not include the required "₹" or "Rs." currency symbol.`);
  }

  // Check "inclusive of all taxes" phrase
  const inField   = INCL_TAX.test(mrpStr);
  const inContext = INCL_TAX.test(rawText);
  if (!inField && !inContext) {
    return review(R, T, f, 'low',
      'The phrase "inclusive of all taxes" was not detected near the MRP declaration. ' +
      'Rule 6 / Rule 2 requires MRP to be stated as all-tax-inclusive. ' +
      'OCR may have missed small-print text — verify manually before citing this as a violation.');
  }

  return pass(R, T, f);
}

// C08 — Consumer Care Details (Rule 6)
function checkConsumerCare(fields) {
  const R = 'Rule 6';
  const T = 'Consumer Care Contact Details';
  const f = 'customer_care';

  if (!isPresent(fields.customer_care)) {
    return pnoc(R, T, f, 'medium',
      'Consumer care contact details (helpline phone number or email address) are not declared on the label. ' +
      'This is mandatory under Rule 6.');
  }

  // Basic format check: phone or email
  const val = String(fields.customer_care);
  const hasPhone = /[\d\s\-\+]{7,}/.test(val);
  const hasEmail = /@/.test(val);
  if (!hasPhone && !hasEmail) {
    return pnoc(R, T, f, 'low',
      `Consumer care value "${val.slice(0, 60)}" does not appear to contain a valid phone number or email address. ` +
      'A functional contact is required.');
  }

  return pass(R, T, f);
}

// ─── RULE 12 — MISLEADING QUANTITY WORDING ───────────────────────────────────
// blueprint §2 Rule 12 (P1 — High); Check C12
// Quantity wording must not create a misleading or exaggerated impression.

function checkMisleadingQuantityWording(fields) {
  const R = 'Rule 12';
  const T = 'Manner of Declaration of Quantity — No Misleading Wording';
  const f = 'net_quantity';

  if (!isPresent(fields.net_quantity)) return pass(R, T, f);

  const qty = String(fields.net_quantity);

  if (MISLEADING_QUALIFIERS.test(qty)) {
    const match = qty.match(MISLEADING_QUALIFIERS);
    return pnoc(R, T, f, 'high',
      `Net quantity "${qty}" contains the qualifier "${match?.[0]}" which is prohibited under Rule 12. ` +
      'Quantity declarations must not use words like "minimum", "not less than", "average", "about", "approximately" etc. ' +
      'An exact quantity must be stated.');
  }

  // Vague marketing terms in place of a numeric quantity
  if (/\b(family\s*size|jumbo|large|small|medium|regular|super|economy\s*pack)\b/i.test(qty)) {
    return pnoc(R, T, f, 'high',
      `Net quantity "${qty}" uses vague/non-numeric terms instead of a precise numeric quantity. ` +
      'Rule 12 requires an exact quantity with a standard unit.');
  }

  return pass(R, T, f);
}

// ─── RULE 7 — PRINCIPAL DISPLAY PANEL & FONT SIZE ────────────────────────────
// blueprint §2 Rule 7, CV checks C10, C11 (P1 — Critical)
// CRITICAL: Pixels ≠ mm without calibration source. Return NOT VERIFIED if no scale.

// Numeral height slab table (Rule 7 — blueprint §2)
const NUMERAL_HEIGHT_MM = [
  { maxRef: 50,       minMM: 1.0 },
  { maxRef: 200,      minMM: 2.0 },
  { maxRef: 1000,     minMM: 4.0 },
  { maxRef: Infinity, minMM: 6.0 },
];

function getQtyRefValue(netQtyNorm) {
  if (!netQtyNorm) return null;
  const { value, unit } = netQtyNorm;
  if (!value || !unit) return null;
  const u = unit.toLowerCase();
  if (['g','gm','gms','gram','grams'].includes(u))     return value;
  if (['kg','kgs'].includes(u))                         return value * 1000;
  if (['mg'].includes(u))                               return value / 1000;
  if (['ml','milliliter','millilitre'].includes(u))     return value;
  if (['l','ltr','litre','litres','liters'].includes(u)) return value * 1000;
  return null;
}

function checkFontSize(fields) {
  const R = 'Rule 7';
  const T = 'Minimum Letter / Numeral Height on Principal Display Panel';
  const f = 'font_size';

  // If no calibration data available — CRITICAL: never invent mm from pixels
  if (fields._fontHeightPixels === undefined || fields._imageDPI === undefined) {
    return nv(R, T, f,
      'Font height cannot be measured in millimetres without a calibration reference or known image DPI. ' +
      'A photograph does not automatically contain a physical scale. ' +
      'Physical measurement with a ruler against the printed label is required to confirm Rule 7 compliance.');
  }

  const heightMM = (fields._fontHeightPixels / fields._imageDPI) * 25.4;
  const isEmbossed = fields._isEmbossed === true;
  const minRequired = isEmbossed ? 2.0 : 1.0;

  if (heightMM < minRequired) {
    return review(R, T, f, 'medium',
      `Estimated letter height ≈ ${heightMM.toFixed(2)}mm (minimum required: ${minRequired}mm). ` +
      `Estimated from pixel bounding box (${fields._fontHeightPixels}px at ${fields._imageDPI} DPI). ` +
      'This is an approximation — physical measurement required before enforcement action.');
  }

  // Check numeral height against net quantity slab
  const ref = getQtyRefValue(fields._netQtyNormalized);
  if (ref !== null && fields._numeralHeightPixels !== undefined) {
    const actualMM  = (fields._numeralHeightPixels / fields._imageDPI) * 25.4;
    const row       = NUMERAL_HEIGHT_MM.find(r => ref <= r.maxRef);
    const minNumMM  = row?.minMM ?? 6.0;
    if (actualMM < minNumMM) {
      return review(R, T, f, 'medium',
        `Numeral height for this package size (${fields._netQtyNormalized?.raw || ''}) must be ≥ ${minNumMM}mm. ` +
        `Estimated actual height ≈ ${actualMM.toFixed(2)}mm — physical verification required before enforcement.`);
    }
  }

  return pass(R, T, f, 'estimated');
}

// ─── RULE 8 — DECLARATION PLACEMENT (PDP) ────────────────────────────────────
// blueprint §2 Rule 8, CV check C11 (P1 — Critical)
// Cannot be conclusively determined from a single photo — always require manual review.

function checkPDPPlacement(fields, options) {
  const R = 'Rule 8';
  const T = 'Declarations — Placement on Principal Display Panel';
  const f = 'layout';

  if (options.pdp_confirmed === true) {
    return pass(R, T, f, 'estimated');
  }
  if (options.pdp_confirmed === false) {
    return review(R, T, f, 'medium',
      'Officer review indicates mandatory declarations may not be on the principal display panel. ' +
      'Rectangular packages require declarations on one full side; cylindrical/other shapes require 40% of surface area. ' +
      'Physical inspection is required.');
  }

  // Not yet reviewed — flag for manual review
  return review(R, T, f, 'low',
    'Principal Display Panel (PDP) placement has not been verified. ' +
    'A single photograph cannot confirm that all declarations appear on the correct panel face. ' +
    'Officer should physically inspect the label placement.');
}

// ─── RULE 9 — LEGIBILITY / CONTRAST / READABILITY ────────────────────────────
// blueprint §2 Rule 9, CV checks C09 (P1 — Critical)
// Declarations must be legible, prominent, and visible.

function checkLegibility(fields) {
  const R = 'Rule 9';
  const T = 'Legibility, Prominence and Readability of Declarations';
  const f = 'legibility';

  const ocrConf = fields._ocr_confidence ?? fields._ocrConfidence;

  if (ocrConf === undefined) {
    return nv(R, T, f,
      'OCR confidence data not available. Cannot assess legibility / contrast without text detection metrics.');
  }

  if (ocrConf < 50) {
    return review(R, T, f, 'medium',
      `OCR average confidence is very low (${ocrConf.toFixed(1)}%). ` +
      'This may indicate poor print contrast, smudging, or image quality issues. ' +
      'Rule 9 requires declarations to be legible and prominent. Physical inspection is required — ' +
      'low OCR confidence alone does not prove the label is illegible.');
  }

  if (ocrConf < 70) {
    return review(R, T, f, 'low',
      `OCR average confidence is below threshold (${ocrConf.toFixed(1)}%). ` +
      'Some declarations may have readability issues. Verify with physical inspection.');
  }

  // Check for explicit blur/contrast flags from image processing
  if (fields._isBlurry === true) {
    return review(R, T, f, 'medium',
      'Image analysis flagged the label image as blurry or low contrast. ' +
      'Rule 9 requires declarations to be visible and legible. Physical verification required.');
  }

  return pass(R, T, f, 'estimated');
}

// ─── RULE 31 — ADVERTISEMENT / LISTING MODE ──────────────────────────────────
// blueprint §2 Rule 31 (P1 — Critical for listing mode)
// An advertisement mentioning retail sale price must include net quantity/number.
// Net-quantity font size in advertisement must equal the retail sale price font size.

function checkAdvertisementListing(fields, options) {
  const R = 'Rule 31';
  const T = 'Advertisement / Product Listing — Net Quantity Same Size as MRP';

  // Only applies to e-commerce listings or advertisements
  if (options.source_type !== 'ecommerce_listing' && options.source_type !== 'advertisement') {
    return na(R, T, 'listing',
      'Rule 31 applies only to advertisements and product listings that mention retail sale price. ' +
      'This scan is a physical label — Rule 31 is not applicable.');
  }

  const results = [];

  // MRP must be present in listing
  if (!isPresent(fields.mrp)) {
    results.push(pnoc(R, T + ' — MRP Presence', 'mrp', 'high',
      'Retail sale price (MRP) is not present in this product listing. ' +
      'If MRP is mentioned in an advertisement, it must include the net quantity.'));
  }

  // Net quantity must be present when MRP is mentioned
  if (isPresent(fields.mrp) && !isPresent(fields.net_quantity)) {
    results.push(pnoc(R, T + ' — Net Qty Required', 'net_quantity', 'high',
      'Advertisement/listing mentions MRP but net quantity/number is not present. ' +
      'Rule 31 requires that any advertisement mentioning retail sale price must also state net quantity.'));
  }

  // Font size comparison — only possible with CV calibration data
  if (isPresent(fields.mrp) && isPresent(fields.net_quantity)) {
    if (fields._mrpFontHeightPx !== undefined && fields._qtyFontHeightPx !== undefined) {
      const diff = Math.abs(fields._mrpFontHeightPx - fields._qtyFontHeightPx);
      const tolerance = fields._mrpFontHeightPx * 0.15; // 15% tolerance
      if (diff > tolerance) {
        results.push(review(R, T + ' — Font Size Match', 'font_size', 'medium',
          `Net quantity font height (${fields._qtyFontHeightPx}px) differs from MRP font height (${fields._mrpFontHeightPx}px) by more than 15%. ` +
          'Rule 31 requires the net quantity to be in the same font size as the retail sale price in advertisements. ' +
          'Screenshots may be resized — treat as screening check; verify from source image.',
          'estimated'));
      } else {
        results.push(pass(R, T + ' — Font Size Match', 'font_size', 'estimated'));
      }
    } else {
      results.push(nv(R, T + ' — Font Size Match', 'font_size',
        'Font size comparison (Rule 31) requires CV bounding-box data, which is not available for this image. ' +
        'A screenshot may have been resized — officer should verify from the original listing source.'));
    }
  }

  return results.length > 0 ? results : [pass(R, T, 'listing')];
}

// ─── CONTRADICTORY DECLARATIONS CHECK ────────────────────────────────────────
// Two different MRP values or quantities on the same label = legal contradiction

function checkContradictoryDeclarations(fields) {
  const R = 'Rule 6';
  const T = 'Contradictory Declarations';
  const results = [];

  if (Array.isArray(fields._mrpValues) && fields._mrpValues.length > 1) {
    const unique = [...new Set(fields._mrpValues.map(String))];
    if (unique.length > 1) {
      results.push(pnoc(R, T + ' — Multiple MRP Values', 'mrp', 'high',
        `Multiple different MRP values detected on the same label: ${unique.join(', ')}. ` +
        'A package can declare only one MRP. This contradicts Rule 6 and is a definite non-compliance.'));
    }
  }

  if (Array.isArray(fields._netQtyValues) && fields._netQtyValues.length > 1) {
    const unique = [...new Set(fields._netQtyValues.map(String))];
    if (unique.length > 1) {
      results.push(pnoc(R, T + ' — Multiple Net Quantity Values', 'net_quantity', 'high',
        `Multiple different net quantity values detected on the same label: ${unique.join(', ')}. ` +
        'A package can declare only one net quantity. This contradicts Rule 6.'));
    }
  }

  return results.length > 0 ? results : null;
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const config = require('../config');

async function validateCompliance(fieldsMap, rawText = '', options = {}) {
  const prompt = `You are a strict, expert compliance auditor for the Indian Legal Metrology (Packaged Commodities) Rules, 2011.
Evaluate the following extracted label data for compliance.

EXTRACTED STRUCTURED DATA:
${JSON.stringify(fieldsMap, null, 2)}

RAW OCR TEXT (for context):
${(rawText || '').slice(0, 2000)}

RULES TO EVALUATE:
1. Rule 6(1)(a) - Name of Commodity: Must declare generic/common name.
2. Rule 6(1)(b) & Rule 10 - Manufacturer/Packer/Importer Name & Address: Must have complete name and address.
3. Rule 6(1)(c) & Rule 11 - Net Quantity: Must declare numeric quantity with standard metric units (e.g. g, kg, ml, L). Cannot use vague terms like "approx".
4. Rule 6(1)(d) - Month & Year of Manufacture: Must be present (MM/YYYY or similar).
5. Rule 6(1)(e) - MRP: Must declare Maximum Retail Price explicitly including phrase "inclusive of all taxes" (or similar).
6. Rule 6(1)(h) - Consumer Care Details: Must declare phone number or email for complaints.
7. Rule 26 - Exemptions: If net weight <= 10g or 10ml, or if it's agricultural produce in packages > 50kg, some rules don't apply (return NOT APPLICABLE).

Return ONLY a valid JSON object with a "results" array. Each object in the array must have:
- rule_id: String (e.g. "Rule 6(1)(a)")
- rule_title: String
- status: Must be exactly one of ["PASS", "POTENTIAL NON-COMPLIANCE", "MANUAL REVIEW", "NOT APPLICABLE"]
- field: String (the primary field associated, e.g. "net_quantity")
- severity: String ("high", "medium", "low")
- detail: String (Specific reasoning based on the extracted data. Why did it pass or fail? Cite the data.)
- confidence: String ("high" or "medium")

DO NOT return markdown code blocks, just raw JSON.`;

  let responseText = '';

  if (config.groq?.enabled && options.forceEngine !== 'gemini') {
    console.log('[RulesEngine] Calling Groq LLM (llama-3.3-70b-versatile)...');
    const groq = new Groq({ apiKey: config.groq.apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    }, { timeout: 30000 });
    responseText = completion.choices[0]?.message?.content || '';
  } else if (config.gemini?.enabled) {
    console.log('[RulesEngine] Using Gemini LLM (gemini-3.6-flash)...');
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } else {
    throw new Error("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured.");
  }
  
  const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();
  let aiResults = [];
  try {
    const parsed = JSON.parse(cleaned);
    aiResults = parsed.results || [];
  } catch (err) {
    console.error('[RulesEngine] Failed to parse LLM output:', err);
    throw new Error('LLM Rules Engine returned invalid JSON.');
  }

  // Map AI results to internal format
  const mappedResults = aiResults.map(r => ({
    rule_id: r.rule_id || 'Unknown',
    rule_title: r.rule_title || 'Unknown Rule',
    status: Object.values(S).includes(r.status) ? r.status : S.REVIEW,
    field: r.field || 'unknown',
    severity: (r.severity || 'medium').toLowerCase(),
    detail: r.detail || 'No detail provided.',
    confidence: r.confidence || 'medium'
  }));

  const violations = mappedResults.filter(r => r.status === S.PNOC || r.status === S.REVIEW);
  const passes = mappedResults.filter(r => r.status === S.PASS);
  const naResults = mappedResults.filter(r => r.status === S.NA);
  
  const highViolations = mappedResults.filter(r => r.status === S.PNOC && r.severity === 'high').length;
  const reviewCount = mappedResults.filter(r => r.status === S.REVIEW).length;
  const totalRulesChecked = mappedResults.length;
  
  const complianceScore = totalRulesChecked > 0 ? Math.round((passes.length / (totalRulesChecked - naResults.length || 1)) * 100) : 0;
  
  let overallCompliance = S.PASS;
  if (highViolations > 0 || mappedResults.some(r => r.status === S.PNOC)) overallCompliance = S.PNOC;
  else if (reviewCount > 0) overallCompliance = S.REVIEW;
  
  return {
    results: mappedResults,
    violations,
    ruleVersion: RULE_VERSION,
    stats: {
      totalRulesChecked,
      totalViolations: violations.length,
      highViolations,
      reviewCount,
      notVerifiedCount: 0,
      complianceScore,
      overallCompliance
    }
  };
}

module.exports = {
  validateCompliance,
  RULE_VERSION,
  STATUS: S,
  // Export individual checkers for unit testing
  checkApplicability,
  checkExemption,
  checkManufacturerName,
  checkManufacturerAddress,
  checkCountryOfOrigin,
  checkGenericName,
  checkNetQuantityPresence,
  checkUnitConvention,
  checkMfgDate,
  checkMRP,
  checkConsumerCare,
  checkMisleadingQuantityWording,
  checkFontSize,
  checkPDPPlacement,
  checkLegibility,
  checkAdvertisementListing,
  checkContradictoryDeclarations,
};
