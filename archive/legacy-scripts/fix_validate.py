import re

with open('backend/services/rules_engine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

new_validate = '''async function validateCompliance(fieldsMap, rawText = '', options = {}) {
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
  ];

  const flatResults = rawResults.flat().filter(r => r !== null);
  
  // Format results to match expected schema
  const mappedResults = flatResults.map(r => ({
    rule_id: r.rule_id,
    rule_title: r.rule_title,
    status: r.status,
    field: r.field,
    severity: r.severity || 'low',
    detail: r.detail || (r.status === 'PASS' ? 'Compliant with rule requirements based on extracted data.' : 'Status needs manual verification.'),
    confidence: r.confidence || 'high'
  }));

  const violations = mappedResults.filter(r => r.status === STATUS.PNOC || r.status === STATUS.REVIEW);
  
  const passes = mappedResults.filter(r => r.status === STATUS.PASS);
  const naResults = mappedResults.filter(r => r.status === STATUS.NA);
  const highViolations = mappedResults.filter(r => r.severity === 'high' && r.status === STATUS.PNOC).length;
  const reviewCount = mappedResults.filter(r => r.status === STATUS.REVIEW).length;
  const totalRulesChecked = mappedResults.length;
  
  const complianceScore = totalRulesChecked > 0 ? Math.round((passes.length / (totalRulesChecked - naResults.length || 1)) * 100) : 0;
  
  let overallCompliance = STATUS.PASS;
  if (highViolations > 0 || mappedResults.some(r => r.status === STATUS.PNOC)) overallCompliance = STATUS.PNOC;
  else if (reviewCount > 0) overallCompliance = STATUS.REVIEW;
  
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
}'''

# Replace validateCompliance function
# Find where it starts and ends
start_idx = engine.find('async function validateCompliance(fieldsMap, rawText = \'\', options = {}) {')
end_idx = engine.find('module.exports = {', start_idx)

if start_idx != -1 and end_idx != -1:
    engine = engine[:start_idx] + new_validate + '\n\n' + engine[end_idx:]
    with open('backend/services/rules_engine.js', 'w', encoding='utf-8') as f:
        f.write(engine)
