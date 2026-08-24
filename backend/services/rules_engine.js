// backend/services/rules_engine.js
// ============================================================
// LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011
// Rule Validation Engine — SIH26034 SatyaLabel
// ============================================================
//
// Source: Legal Metrology (Packaged Commodities) Rules, 2011
// as provided in 02_LEGAL_METROLOGY_RULES_ENGINE.md
//
// ⚠️  CLAUSE NUMBER DISCLAIMER (from spec file 02):
//   "Before final submission, cross-check clause numbers against the
//    official gazette PDF at consumeraffairs.gov.in/pages/legal-metrology-act
//    — some sub-rule numbering has been amended (e.g. GSR 629(E), 23.6.2017).
//    Cite what you verify; don't invent clause numbers you haven't confirmed."
//
// ARCHITECTURE PRINCIPLE:
//   PURE MODULE — no I/O, no DB, no HTTP.
//   Input:  fieldsMap { fieldName → fieldValue } + optional options
//   Output: Array of ViolationResult objects (one per rule, pass OR fail)
//
// RETURN SCHEMA (per spec file 02):
// {
//   rule_id:    string   — e.g. "Rule 6(1)(c)"
//   rule_title: string   — human-readable rule name
//   status:     "pass" | "fail" | "estimated"
//   field:      string   — which extracted field this relates to
//   severity:   "high" | "medium" | "low"
//   detail:     string   — specific finding (what was expected vs found)
//   confidence: "high" | "estimated"
//                  "high"      → presence/pattern checks (Rule Set 1 & 3)
//                  "estimated" → font size / PDP checks (Rule Set 2)
// }
// ============================================================

// ─── RESULT FACTORIES ─────────────────────────────────────────────────────────

function pass(rule_id, rule_title, field, confidence = 'high') {
  return { rule_id, rule_title, status: 'pass', field, severity: null, detail: null, confidence };
}

function fail(rule_id, rule_title, field, severity, detail, confidence = 'high') {
  return { rule_id, rule_title, status: 'fail', field, severity, detail, confidence };
}

function estimated(rule_id, rule_title, field, severity, detail) {
  return { rule_id, rule_title, status: 'estimated', field, severity, detail, confidence: 'estimated' };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const isPresent = (val) =>
  val !== null && val !== undefined && String(val).trim().length > 0;

// Recognized standard units per LM(PC) Rules
// Use (?=\b|$|\d) lookahead so '500g' (no space) is matched too
const STANDARD_UNITS = /(?:^|\s|\d)(g|gm|gms|gram|grams|kg|kgs|mg|ml|l|ltr|litre|litres|liters|liter|cm|m|mm|nos?\.?|pieces?|pcs?\.?|tablets?|tabs?|capsules?|caps?|sachets?|units?)(?=\b|$|\s)/i;

// Non-metric / non-standard units — Rule 7 violation
const NON_STANDARD_UNITS = /\b(oz|ounce|ounces|lb|pound|pounds|tola|seer|maund|fluid\s+oz|fl\.?\s*oz)\b/i;

// PIN code pattern (6 digits, optionally preceded by space/dash)
const PIN_CODE = /\b[1-9][0-9]{5}\b/;

// Indian city / state keywords for address heuristic
const ADDRESS_KEYWORDS = /\b(mumbai|delhi|bangalore|bengaluru|chennai|kolkata|hyderabad|pune|ahmedabad|jaipur|lucknow|navi mumbai|gurugram|noida|gurgaon|thane|surat|vadodara|maharashtra|karnataka|tamil\s*nadu|gujarat|rajasthan|uttar\s*pradesh|west\s*bengal|andhra|telangana|haryana|punjab|kerala|india)\b/i;

// Date patterns: "01/2025", "Jan 2025", "January 2025", "2025-01"
const DATE_PATTERNS = [
  /\b(0?[1-9]|1[0-2])[\/\-](20\d{2})\b/,             // MM/YYYY
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+20\d{2}\b/i, // Mon YYYY
  /\b20\d{2}[\/\-](0?[1-9]|1[0-2])\b/,               // YYYY/MM
];

// MRP symbol check
const MRP_SYMBOL = /[₹]|rs\.?/i;
const INCL_TAX = /incl(?:usive)?\.?\s+(?:of\s+)?all\s+tax|incl\.?\s+all\s+taxes?|all\s+taxes?\s+incl|inclusive\s+of\s+taxes?/i;

function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();

  // MM/YYYY
  const m1 = s.match(/^(0?[1-9]|1[0-2])[\/\-](20\d{2})$/);
  if (m1) return { month: parseInt(m1[1]), year: parseInt(m1[2]) };

  // Month YYYY
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const m2 = s.match(/([a-zA-Z]+)\.?\s+(20\d{2})/);
  if (m2) {
    const idx = months.findIndex(m => m2[1].toLowerCase().startsWith(m));
    if (idx !== -1) return { month: idx + 1, year: parseInt(m2[2]) };
  }
  return null;
}

// ─── RULE SET 1 — MANDATORY DECLARATIONS (RULE 6) ────────────────────────────
// confidence: "high" — these are presence/pattern checks, not image analysis

/**
 * Rule 6(1)(a) — Manufacturer / Packer / Importer Name AND Address
 *
 * Per spec: "Field present, non-empty, contains recognizable address-like text
 *            (has a pincode-pattern or city keyword)"
 *
 * ⚠️  Clause note: In many gazette versions, this is Rule 6(1)(a). Verify
 *     against the final submission gazette copy.
 */
function checkRule6_1_a_name(fields) {
  const R = 'Rule 6(1)(a)';
  const T = 'Manufacturer / Packer / Importer Name';

  if (!isPresent(fields.manufacturer_name)) {
    return fail(R, T, 'manufacturer_name', 'high',
      'Name of the manufacturer, packer, or importer is not declared on the label. This is a mandatory declaration under Rule 6(1)(a).');
  }
  return pass(R, T, 'manufacturer_name');
}

function checkRule6_1_a_address(fields) {
  const R = 'Rule 6(1)(a)';
  const T = 'Manufacturer / Packer / Importer Address';

  if (!isPresent(fields.manufacturer_address)) {
    return fail(R, T, 'manufacturer_address', 'high',
      'Complete address of the manufacturer, packer, or importer is absent. A full address is mandatory under Rule 6(1)(a).');
  }

  const addr = String(fields.manufacturer_address);
  const hasPIN = PIN_CODE.test(addr);
  const hasCity = ADDRESS_KEYWORDS.test(addr);

  if (!hasPIN && !hasCity) {
    return fail(R, T, 'manufacturer_address', 'medium',
      `Address "${addr.slice(0, 80)}…" does not contain a recognizable PIN code or city/state name. A complete address is required.`);
  }

  return pass(R, T, 'manufacturer_address');
}

/**
 * Rule 6(1)(b) — Common / Generic Name of the Commodity
 *
 * Per spec: "Field present, non-empty"
 */
function checkRule6_1_b(fields) {
  const R = 'Rule 6(1)(b)';
  const T = 'Name / Description of Commodity';

  if (!isPresent(fields.product_name)) {
    return fail(R, T, 'product_name', 'high',
      'The common or generic name of the commodity is not declared on the label. This is mandatory under Rule 6(1)(b).');
  }
  return pass(R, T, 'product_name');
}

/**
 * Rule 6(1)(c) — Net Quantity in Standard Unit
 *
 * Per spec: "Field present AND matches a valid unit pattern
 *            (g, kg, ml, l, cm, no. of pieces, etc.)"
 */
function checkRule6_1_c_presence(fields) {
  const R = 'Rule 6(1)(c)';
  const T = 'Net Quantity Declaration';

  if (!isPresent(fields.net_quantity)) {
    return fail(R, T, 'net_quantity', 'high',
      'No net quantity declaration detected on the label. Every packaged commodity must declare its net weight, volume, or count under Rule 6(1)(c).');
  }
  return pass(R, T, 'net_quantity');
}

function checkRule6_1_c_unit(fields) {
  const R = 'Rule 6(1)(c)';
  const T = 'Net Quantity — Valid Standard Unit';

  if (!isPresent(fields.net_quantity)) return pass(R, T, 'net_quantity'); // Already caught above

  const qty = String(fields.net_quantity);

  // Check non-standard units first (explicit violation)
  if (NON_STANDARD_UNITS.test(qty)) {
    const match = qty.match(NON_STANDARD_UNITS);
    return fail(R, T, 'net_quantity', 'high',
      `Net quantity uses non-standard unit "${match?.[0]}". Only standard SI units (g, kg, ml, L, m, cm, pieces) are permitted under Rule 6(1)(c) and Rule 7.`);
  }

  // Must have a numeric value
  if (!/\d/.test(qty)) {
    return fail(R, T, 'net_quantity', 'high',
      `Net quantity "${qty}" does not contain a numeric value. A quantity like "500g" or "1 kg" is required.`);
  }

  // Must have a recognized unit
  if (!STANDARD_UNITS.test(qty)) {
    return fail(R, T, 'net_quantity', 'medium',
      `Net quantity "${qty}" does not contain a recognized standard unit. Valid units include: g, kg, ml, L, cm, m, nos., pieces.`);
  }

  // Vague marketing terms in place of quantity
  if (/\b(family\s*size|jumbo|large|small|medium|regular|super|economy\s*pack)\b/i.test(qty)) {
    return fail(R, T, 'net_quantity', 'medium',
      `Net quantity "${qty}" uses vague/non-numeric terms. Only a precise numeric value with a standard unit is acceptable.`);
  }

  return pass(R, T, 'net_quantity');
}

/**
 * Rule 6(1)(f) — Month and Year of Manufacture / Packing / Import
 *
 * Per spec: "Field present AND matches a valid date pattern (MM/YYYY or Month YYYY)"
 *
 * ⚠️  Clause note: This sub-rule designation (f) for mfg date is per the
 *     spec file 02. The 2011 gazette uses (d) for mfg date. Cross-check
 *     before final submission.
 */
function checkRule6_1_f_mfgdate(fields) {
  const R = 'Rule 6(1)(f)';
  const T = 'Month and Year of Manufacture / Packing';

  if (!isPresent(fields.mfg_date)) {
    return fail(R, T, 'mfg_date', 'high',
      'Month and year of manufacture/packing/import is not declared. This is mandatory under Rule 6(1)(f).');
  }

  const str = String(fields.mfg_date).trim();
  const parsedOk = DATE_PATTERNS.some(p => p.test(str));

  if (!parsedOk) {
    return fail(R, T, 'mfg_date', 'medium',
      `Manufacturing date "${str}" does not match a valid format. Required format: MM/YYYY (e.g. 03/2025) or Month YYYY (e.g. Mar 2025).`);
  }

  // Must not be in the future
  const parsed = parseDate(str);
  if (parsed) {
    const now = new Date();
    if (parsed.year > now.getFullYear() + 1) {
      return fail(R, T, 'mfg_date', 'medium',
        `Manufacturing date year "${parsed.year}" is implausibly far in the future — possible OCR misread or mislabeling.`);
    }
  }

  return pass(R, T, 'mfg_date');
}

/**
 * Rule 6(1)(f) — Retail Sale Price (MRP) inclusive of all taxes
 *
 * Per spec: "Field present AND contains '₹' or 'Rs.' AND contains the phrase
 *            'inclusive of all taxes' (or equivalent)"
 *
 * ⚠️  Clause note: This sub-rule designation (f) for MRP is per spec file 02.
 *     The 2011 gazette typically lists MRP as a separate sub-rule. Cross-check.
 */
function checkRule6_1_f_mrp(fields) {
  const R = 'Rule 6(1)(f)';
  const T = 'Maximum Retail Price (MRP) Declaration';

  if (!isPresent(fields.mrp)) {
    return fail(R, T, 'mrp', 'high',
      'MRP (Maximum Retail Price) is not declared on the label. Every package must display MRP inclusive of all taxes under Rule 6(1)(f).');
  }

  const mrpStr = String(fields.mrp);
  const rawText = fields._rawText || '';

  if (!MRP_SYMBOL.test(mrpStr) && !MRP_SYMBOL.test(rawText.slice(0, 200))) {
    return fail(R, T, 'mrp', 'medium',
      `MRP value "${mrpStr}" does not include the required "₹" or "Rs." symbol. Both are valid per DoCA FAQ.`);
  }

  // Check "inclusive of all taxes" — search in nearby raw text context
  // This is a best-effort check (OCR may miss small text)
  const inRawText = INCL_TAX.test(rawText);
  const inMrpField = INCL_TAX.test(mrpStr);

  if (!inRawText && !inMrpField) {
    return fail(R, T, 'mrp', 'low',
      `The phrase "inclusive of all taxes" (or equivalent) was not detected near the MRP declaration. Rule 6(1)(f) requires MRP to be stated as all-tax-inclusive. Note: OCR may have missed small-print text — verify manually.`);
  }

  return pass(R, T, 'mrp');
}

/**
 * Rule 6(1)(g) — Consumer Care Details
 *
 * Per spec: "Field present, non-empty"
 *
 * ⚠️  Clause note: (g) per spec 02; verify gazette sub-rule for consumer care.
 */
function checkRule6_1_g(fields) {
  const R = 'Rule 6(1)(g)';
  const T = 'Consumer Care Details (Helpline / Email)';

  if (!isPresent(fields.customer_care)) {
    return fail(R, T, 'customer_care', 'medium',
      'Consumer care contact details (helpline phone number or email address) are not present on the label. Mandatory under Rule 6(1)(g).');
  }
  return pass(R, T, 'customer_care');
}

/**
 * Rule 6(10) — E-Commerce Listing Requirements
 *
 * Per spec: Only apply if source_type == "ecommerce_listing"
 * For e-commerce: all mandatory declarations EXCEPT month/year of manufacture
 * must appear on the digital listing.
 */
function checkRule6_10_ecommerce(fields, options = {}) {
  const R = 'Rule 6(10)';
  const T = 'E-Commerce Listing — Mandatory Declarations';

  if (options.source_type !== 'ecommerce_listing') {
    return pass(R, T, 'source_type'); // Not applicable
  }

  const required = ['manufacturer_name', 'manufacturer_address', 'product_name', 'net_quantity', 'mrp', 'customer_care'];
  const missing = required.filter(f => !isPresent(fields[f]));

  if (missing.length > 0) {
    return fail(R, T, 'ecommerce_listing', 'high',
      `E-commerce listing is missing the following mandatory declarations (Rule 6(10)): ${missing.join(', ')}. For digital listings, all mandatory fields except month/year of manufacture must be visible.`);
  }

  return pass(R, T, 'ecommerce_listing');
}

// ─── RULE SET 2 — FONT SIZE / LEGIBILITY (RULE 7) ────────────────────────────
// confidence: "estimated" — image analysis, cannot be precise without scale ref

/**
 * Rule 7(3) — Minimum Letter Height 1mm (2mm if embossed)
 *
 * Per spec: Estimate using (bbox_pixel_height ÷ image_DPI) × 25.4
 * Since phone DPI is unknown, flag as "estimated — low confidence"
 * unless calibration reference is available.
 *
 * Returns "estimated" status rather than hard pass/fail.
 */
function checkRule7_3_letterHeight(fields) {
  const R = 'Rule 7(3)';
  const T = 'Minimum Letter Height (1mm minimum)';

  // If we have pixel-based font size data from OCR bounding boxes
  if (fields._fontHeightPixels !== undefined && fields._imageDPI !== undefined) {
    const heightMM = (fields._fontHeightPixels / fields._imageDPI) * 25.4;
    const minRequired = fields._isEmbossed ? 2.0 : 1.0;

    if (heightMM < minRequired) {
      return estimated(R, T, 'font_size',
        'medium',
        `Estimated letter height ≈ ${heightMM.toFixed(2)}mm (min required: ${minRequired}mm). ` +
        `Estimated from pixel bounding box (${fields._fontHeightPixels}px) at assumed ${fields._imageDPI} DPI — ` +
        `true DPI of phone camera is unknown. Treat as indicative finding; physical measurement required.`);
    }
    return pass(R, T, 'font_size', 'estimated');
  }

  // No size data available — report as estimated with no definitive conclusion
  return estimated(R, T, 'font_size', 'low',
    'Font height could not be estimated from this image (no bounding box data / DPI reference available). ' +
    'Physical verification with a ruler against the printed label is required to confirm Rule 7(3) compliance.');
}

/**
 * Rule 7 — Numeral Height Table (based on net quantity slab)
 *
 * Per spec: lookup table: net quantity range → required minimum numeral height
 *
 * Numeral height requirements:
 *   ≤ 50g/ml     → 1mm
 *   50–200g/ml   → 2mm
 *   200g/ml–1kg/L → 4mm
 *   > 1kg/L      → 6mm
 */
const NUMERAL_HEIGHT_TABLE = [
  { maxG: 50,   maxML: 50,   minMM: 1.0 },
  { maxG: 200,  maxML: 200,  minMM: 2.0 },
  { maxG: 1000, maxML: 1000, minMM: 4.0 },
  { maxG: Infinity, maxML: Infinity, minMM: 6.0 },
];

function getRequiredNumeralHeight(netQtyNormalized) {
  if (!netQtyNormalized) return null;
  const { value, unit } = netQtyNormalized;
  if (!value || !unit) return null;

  // Convert to grams or ml for comparison
  let grams = null;
  if (['g','gm','gms','gram','grams'].includes(unit.toLowerCase())) grams = value;
  else if (['kg','kgs'].includes(unit.toLowerCase())) grams = value * 1000;
  else if (['mg'].includes(unit.toLowerCase())) grams = value / 1000;

  let ml = null;
  if (['ml','milliliter','millilitre'].includes(unit.toLowerCase())) ml = value;
  else if (['l','ltr','litre','litres','liters','liter'].includes(unit.toLowerCase())) ml = value * 1000;

  const ref = grams || ml;
  if (!ref) return null;

  return NUMERAL_HEIGHT_TABLE.find(row => ref <= row.maxG)?.minMM || 6.0;
}

function checkRule7_numeralHeight(fields) {
  const R = 'Rule 7';
  const T = 'Numeral Height for MRP / Net Quantity Declarations';

  const required = getRequiredNumeralHeight(fields._netQtyNormalized);
  if (!required) {
    return estimated(R, T, 'net_quantity', 'low',
      'Cannot determine required numeral height — net quantity was not extracted in a parseable format.');
  }

  if (fields._numeralHeightPixels !== undefined && fields._imageDPI !== undefined) {
    const actualMM = (fields._numeralHeightPixels / fields._imageDPI) * 25.4;
    if (actualMM < required) {
      return estimated(R, T, 'font_size', 'medium',
        `Numeral height for this package slab (${fields._netQtyNormalized?.raw || ''}) must be ≥ ${required}mm. ` +
        `Estimated actual height ≈ ${actualMM.toFixed(2)}mm (estimated, not definitive — physical check required).`);
    }
    return pass(R, T, 'font_size', 'estimated');
  }

  return estimated(R, T, 'font_size', 'low',
    `For a package of this size (${fields._netQtyNormalized?.raw || 'unknown'}), minimum numeral height = ${required}mm. ` +
    `Numeral height could not be measured from this image — physical verification required.`);
}

/**
 * Rule 7 — Principal Display Panel (PDP) Placement
 *
 * Per spec: This is out of scope for pixel-precision from a photo alone.
 * Implement as a manual toggle — officer confirms during review.
 * Never auto-fail from image alone.
 */
function checkRule7_pdp(fields) {
  const R = 'Rule 7 (PDP)';
  const T = 'Principal Display Panel — Declaration Placement';

  // If officer explicitly confirmed PDP compliance (manual review toggle)
  if (fields._pdpConfirmed === true) return pass(R, T, 'layout', 'estimated');
  if (fields._pdpConfirmed === false) {
    return estimated(R, T, 'layout', 'medium',
      'Officer review indicates mandatory declarations may NOT be on the principal display panel. ' +
      'Rectangular packs require declarations on one full side; cylindrical/other shapes require 40% of surface area. ' +
      'This requires physical inspection — cannot be determined from a single photo.');
  }

  // No toggle set — return as requiring manual review
  return estimated(R, T, 'layout', 'low',
    'Principal Display Panel (PDP) compliance has not been manually confirmed. ' +
    'Please use the "PDP Verified" toggle on the review screen after physically inspecting the label placement.');
}

// ─── RULE SET 3 — FORMAT & PLACEMENT SANITY CHECKS ───────────────────────────
// confidence: "high" — these are pattern/format checks

/**
 * MRP Symbol Validity
 * MRP must use "₹" or "Rs." — both are valid per DoCA FAQ
 */
function checkMrpSymbol(fields) {
  const R = 'Rule 6(1)(f) — Format';
  const T = 'MRP Symbol Validity (₹ or Rs.)';

  if (!isPresent(fields.mrp)) return pass(R, T, 'mrp'); // Caught by presence check

  const mrp = String(fields.mrp);
  if (!MRP_SYMBOL.test(mrp)) {
    return fail(R, T, 'mrp', 'medium',
      `MRP value "${mrp}" is missing the required currency symbol. Must use "₹" or "Rs." — both are valid per Department of Consumer Affairs FAQ.`);
  }
  return pass(R, T, 'mrp');
}

/**
 * Net Quantity Unit Validity
 * Unit must be a recognized standard unit — flag non-standard/ambiguous
 */
function checkNetQtyUnit(fields) {
  const R = 'Rule 6(1)(c) — Format';
  const T = 'Net Quantity Unit Validity';

  if (!isPresent(fields.net_quantity)) return pass(R, T, 'net_quantity');

  const qty = String(fields.net_quantity);
  if (NON_STANDARD_UNITS.test(qty)) {
    const match = qty.match(NON_STANDARD_UNITS);
    return fail(R, T, 'net_quantity', 'high',
      `Non-standard unit detected: "${match?.[0]}". Only SI/metric units (g, kg, ml, L, m, cm, pieces) are recognized under LM(PC) Rules.`);
  }
  return pass(R, T, 'net_quantity');
}

/**
 * Date Format Validity
 * Manufacture/pack date must be real and parseable, not in the future
 */
function checkDateValidity(fields) {
  const R = 'Rule 6(1)(f) — Format';
  const T = 'Date Format and Validity';

  if (!isPresent(fields.mfg_date)) return pass(R, T, 'mfg_date');

  const str = String(fields.mfg_date).trim();
  const parsedOk = DATE_PATTERNS.some(p => p.test(str));
  if (!parsedOk) {
    return fail(R, T, 'mfg_date', 'medium',
      `Date "${str}" is not in a recognizable format. Required: MM/YYYY or Mon YYYY (e.g. 03/2025 or Mar 2025).`);
  }

  const parsed = parseDate(str);
  if (parsed) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (parsed.year > currentYear ||
        (parsed.year === currentYear && parsed.month > currentMonth)) {
      return fail(R, T, 'mfg_date', 'high',
        `Manufacturing date "${str}" is in the future (${parsed.month}/${parsed.year}). A product cannot have a future manufacture date — possible OCR misread or mislabeling.`);
    }
  }

  return pass(R, T, 'mfg_date');
}

/**
 * Contradictory Declarations
 * Two different MRP values or two different net quantities on same label →
 * "Contradictory declaration — manual review required"
 */
function checkContradictoryDeclarations(fields) {
  const R = 'Rule 6 — Contradictory Declarations';
  const T = 'Duplicate or Contradictory Declarations';

  const violations = [];

  if (fields._mrpValues && Array.isArray(fields._mrpValues) && fields._mrpValues.length > 1) {
    const unique = [...new Set(fields._mrpValues.map(String))];
    if (unique.length > 1) {
      violations.push(
        fail(R, T, 'mrp', 'high',
          `Multiple different MRP values detected: ${unique.join(', ')}. A package can only declare one MRP. This is a contradictory declaration — manual review required.`)
      );
    }
  }

  if (fields._netQtyValues && Array.isArray(fields._netQtyValues) && fields._netQtyValues.length > 1) {
    const unique = [...new Set(fields._netQtyValues.map(String))];
    if (unique.length > 1) {
      violations.push(
        fail(R, T, 'net_quantity', 'high',
          `Multiple different net quantity values detected: ${unique.join(', ')}. A package can only declare one net quantity. This is a contradictory declaration — manual review required.`)
      );
    }
  }

  // Return null if no contradictions (caller handles array)
  return violations.length > 0 ? violations : null;
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────

/**
 * Run all rules and return results for EVERY rule (pass AND fail).
 * This is the primary export used by routes/scans.js and unit tests.
 *
 * @param {object} fieldsMap   - { fieldName → fieldValue } from extraction_service
 * @param {string} rawText     - Full raw OCR text (for context-sensitive checks)
 * @param {object} options     - { source_type, _fontHeightPixels, _imageDPI, etc. }
 * @returns {{ results: Array, violations: Array, stats: object }}
 */
function validateCompliance(fieldsMap, rawText = '', options = {}) {
  const fields = { ...fieldsMap, _rawText: rawText, ...options };

  // All single-result check functions
  const singleChecks = [
    // Rule Set 1
    checkRule6_1_a_name,
    checkRule6_1_a_address,
    checkRule6_1_b,
    checkRule6_1_c_presence,
    checkRule6_1_c_unit,
    checkRule6_1_f_mfgdate,
    checkRule6_1_f_mrp,
    checkRule6_1_g,
    (f, o) => checkRule6_10_ecommerce(f, o),
    // Rule Set 2 (estimated)
    checkRule7_3_letterHeight,
    checkRule7_numeralHeight,
    checkRule7_pdp,
    // Rule Set 3
    checkMrpSymbol,
    checkNetQtyUnit,
    checkDateValidity,
  ];

  const results = [];

  for (const fn of singleChecks) {
    try {
      const r = fn(fields, options);
      if (r) results.push(r);
    } catch (err) {
      console.error(`[RulesEngine] Error in ${fn.name}:`, err.message);
    }
  }

  // Contradictory declarations — returns array or null
  try {
    const contradictions = checkContradictoryDeclarations(fields);
    if (contradictions) results.push(...contradictions);
  } catch (err) {
    console.error('[RulesEngine] Error in checkContradictoryDeclarations:', err.message);
  }

  // Separate violations (fail/estimated) from passes
  const violations = results.filter(r => r.status === 'fail' || r.status === 'estimated');
  const hardFails = results.filter(r => r.status === 'fail');
  const passes = results.filter(r => r.status === 'pass');

  // Stats
  const totalRulesChecked = results.length;
  const totalViolations = violations.length;
  const highViolations = hardFails.filter(v => v.severity === 'high').length;
  const mediumViolations = hardFails.filter(v => v.severity === 'medium').length;
  const lowViolations = hardFails.filter(v => v.severity === 'low').length;
  const estimatedCount = violations.filter(v => v.confidence === 'estimated').length;
  // Score: count passes + estimated-only issues as partial credit
  const passAndEstimated = results.filter(r => r.status === 'pass' || r.status === 'estimated').length;
  const complianceScore = Math.round((passes.length / totalRulesChecked) * 100);

  // overallCompliance is determined ONLY by hard 'fail' violations (not 'estimated')
  // Per spec 03: 'compliant' | 'needs_review' | 'non_compliant'
  let overallCompliance;
  if (highViolations > 0) overallCompliance = 'non_compliant';
  else if (hardFails.length > 0) overallCompliance = 'non_compliant'; // medium/low hard fails
  else if (estimatedCount > 0) overallCompliance = 'needs_review';   // only estimated issues
  else overallCompliance = 'compliant';

  return {
    results,          // All results including passes (for audit trail)
    violations,       // Only failures + estimated issues
    stats: {
      totalRulesChecked,
      totalViolations,
      criticalViolations: highViolations,  // DB field named criticalViolations
      highViolations,
      mediumViolations,
      lowViolations,
      estimatedCount,
      rulesPassed: passes.length,
      complianceScore,
      overallCompliance,   // spec 03 field name
      overallStatus: overallCompliance, // backward-compat alias
    },
  };
}

module.exports = {
  validateCompliance,
  // Export individual checkers for unit testing
  checkRule6_1_a_name,
  checkRule6_1_a_address,
  checkRule6_1_b,
  checkRule6_1_c_presence,
  checkRule6_1_c_unit,
  checkRule6_1_f_mfgdate,
  checkRule6_1_f_mrp,
  checkRule6_1_g,
  checkRule6_10_ecommerce,
  checkRule7_3_letterHeight,
  checkRule7_numeralHeight,
  checkRule7_pdp,
  checkMrpSymbol,
  checkNetQtyUnit,
  checkDateValidity,
  checkContradictoryDeclarations,
  getRequiredNumeralHeight,
  NUMERAL_HEIGHT_TABLE,
};
