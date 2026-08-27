const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const sIdx = js.indexOf('    const rawResults = [');
const eIdx = js.indexOf('    ];', sIdx) + 6;

const replacement = `    const gateApp = checkApplicability(fieldsMap, options);
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

js = js.substring(0, sIdx) + replacement + js.substring(eIdx);
fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Replaced via index");
