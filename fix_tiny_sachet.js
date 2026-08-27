const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

// 1. Update checkExemption to parse tiny sachets
const oldExempt = `function checkExemption(fields, options) {
    const R = 'Rule 26';`;

const newExempt = `function checkExemption(fields, options) {
    const R = 'Rule 26';
    const T = 'Exemption — Certain Package Categories';

    // TINY SACHET EXEMPTION: <= 10g or <= 10ml
    if (fields.net_quantity) {
      const q = String(fields.net_quantity).toLowerCase().replace(/\\s+/g, '');
      const match = q.match(/([0-9.]+)\\s*(g|gm|gram|grams|ml|milliliter|millilitre|milliliters)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val <= 10) {
           return na(R, T, 'net_quantity', 'Package is <= 10g or 10ml. Exempt from declarations under Rule 26.');
        }
      }
    }
`;

js = js.replace(oldExempt, newExempt);

// 2. Update validateCompliance to short-circuit if exempt
const oldVal = `  async function validateCompliance(fieldsMap, rawText = '', options = {}) {
    // Use the programmatic rules engine instead of the LLM for perfectly deterministic, instant scoring
    console.log('[RulesEngine] Running deterministic compliance rules...');
    
    const rawResults = [
      checkApplicability(fieldsMap, options),
      checkExemption(fieldsMap, options),
      checkManufacturerName(fieldsMap),`;

const newVal = `  async function validateCompliance(fieldsMap, rawText = '', options = {}) {
    // Use the programmatic rules engine instead of the LLM for perfectly deterministic, instant scoring
    console.log('[RulesEngine] Running deterministic compliance rules...');
    
    // Check gatekeepers first
    const gateApp = checkApplicability(fieldsMap, options);
    const gateExempt = checkExemption(fieldsMap, options);
    
    const isExempt = (gateApp && gateApp.status === S.NA) || (gateExempt && gateExempt.status === S.NA);

    let rawResults = [gateApp, gateExempt].filter(Boolean);
    
    if (isExempt) {
       // If exempt, other rules don't apply. Skip them or mark them NA.
       const exemptReason = gateExempt?.detail || gateApp?.detail || 'Exempt package';
       rawResults.push(
         na('Rule 6', 'Mandatory Declarations', 'general', 'Skipped: ' + exemptReason)
       );
    } else {
       rawResults = rawResults.concat([
         checkManufacturerName(fieldsMap),`;

const oldValEnd = `      checkLegibility(fieldsMap),
      checkEcommerceListing(fieldsMap, options)
    ].filter(Boolean);`;

const newValEnd = `      checkLegibility(fieldsMap),
      checkEcommerceListing(fieldsMap, options)
       ].filter(Boolean));
    }`;

js = js.replace(oldVal, newVal);
js = js.replace(oldValEnd, newValEnd);

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Tiny Sachet Fix applied");
