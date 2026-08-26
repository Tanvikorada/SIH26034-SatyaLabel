import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_validate = """const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

const S = {
  PASS: 'PASS',
  PNOC: 'POTENTIAL NON-COMPLIANCE',
  REVIEW: 'MANUAL REVIEW',
  NA: 'NOT APPLICABLE',
  NV: 'NOT VERIFIED'
};
const RULE_VERSION = 'v2.1-llm';

async function validateCompliance(fieldsMap, rawText = '', options = {}) {
  // If no Gemini key, fallback to a basic pass/fail or legacy logic
  if (!config.gemini?.apiKey) {
    throw new Error("GEMINI_API_KEY is required for the real AI Rules Engine.");
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  // Use flash model for speed and intelligence
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a strict, expert compliance auditor for the Indian Legal Metrology (Packaged Commodities) Rules, 2011.
Evaluate the following extracted label data for compliance.

EXTRACTED STRUCTURED DATA:
${JSON.stringify(fieldsMap, null, 2)}

RAW OCR TEXT (for context):
${rawText.slice(0, 2000)}

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

  console.log('[RulesEngine] Calling LLM Rules Engine...');
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
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
"""

# Replace everything from function validateCompliance to the end of the file with our new async function
# Wait, we need to export it correctly.
idx = text.find('function validateCompliance')
if idx != -1:
    end_idx = text.find('module.exports = {')
    if end_idx != -1:
        text = text[:idx] + new_validate + '\n' + text[end_idx:]
    else:
        text = text[:idx] + new_validate + '\nmodule.exports = { validateCompliance, RULE_VERSION: "v2.1-llm", STATUS: { PASS: "PASS" } };\n'

with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
