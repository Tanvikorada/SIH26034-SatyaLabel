const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const targetStr = `  async function validateCompliance(fieldsMap, rawText = '', options = {}) {
    // Use the programmatic rules engine instead of the LLM for perfectly deterministic, instant scoring
    console.log('[RulesEngine] Running deterministic compliance rules...');
    
    const rawResults = [
      checkApplicability(fieldsMap, options),
      checkExemption(fieldsMap, options),
      checkManufacturerName(fieldsMap),
      checkManufacturerAddress(fieldsMap),
      checkCountryOfOrigin(fieldsMap, options),
      checkGenericName(fieldsMap),
      checkNetQuantityPresence(fieldsMap),
      checkUnitConvention(fieldsMap),
      checkMfgDate(fieldsMap),
      checkBestBefore(fieldsMap, options),
      checkMRP(fieldsMap),
      checkConsumerCare(fieldsMap),
      checkMisleadingQuantityWording(fieldsMap),
      checkFontSize(fieldsMap),
      checkPDPPlacement(fieldsMap, options),
      checkLegibility(fieldsMap),
      checkAdvertisementListing(fieldsMap, options),
      checkContradictoryDeclarations(fieldsMap)
    ];`;

const replacement = `  async function validateCompliance(fieldsMap, rawText = '', options = {}) {
    // Use the programmatic rules engine instead of the LLM for perfectly deterministic, instant scoring
    console.log('[RulesEngine] Running deterministic compliance rules...');
    
    const gateApp = checkApplicability(fieldsMap, options);
    const gateExempt = checkExemption(fieldsMap, options);
    const isExempt = (gateApp && gateApp.status === S.NA) || (gateExempt && gateExempt.status === S.NA);
    
    let rawResults = [gateApp, gateExempt].filter(Boolean);

    if (isExempt) {
       const exemptReason = gateExempt?.detail || gateApp?.detail || 'Exempt package';
       rawResults.push(na('Rule 6', 'Mandatory Declarations', 'general', 'Skipped: ' + exemptReason));
    } else {
       rawResults = rawResults.concat([
         checkManufacturerName(fieldsMap),
         checkManufacturerAddress(fieldsMap),
         checkCountryOfOrigin(fieldsMap, options),
         checkGenericName(fieldsMap),
         checkNetQuantityPresence(fieldsMap),
         checkUnitConvention(fieldsMap),
         checkMfgDate(fieldsMap),
         checkBestBefore(fieldsMap, options),
         checkMRP(fieldsMap),
         checkConsumerCare(fieldsMap),
         checkMisleadingQuantityWording(fieldsMap),
         checkFontSize(fieldsMap),
         checkPDPPlacement(fieldsMap, options),
         checkLegibility(fieldsMap),
         checkAdvertisementListing(fieldsMap, options),
         checkContradictoryDeclarations(fieldsMap)
       ].filter(Boolean));
    }`;

if(js.includes(targetStr)) {
  js = js.replace(targetStr, replacement);
  fs.writeFileSync('backend/services/rules_engine.js', js);
  console.log("Replaced");
} else {
  console.log("Not found");
}
