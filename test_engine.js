const {
  checkApplicability, checkExemption, checkManufacturerName, checkManufacturerAddress,
  checkCountryOfOrigin, checkGenericName, checkNetQuantityPresence, checkUnitConvention,
  checkMfgDate, checkBestBefore, checkMRP, checkConsumerCare, checkMisleadingQuantityWording,
  checkFontSize, checkPDPPlacement, checkLegibility, checkAdvertisementListing, checkContradictoryDeclarations,
  STATUS
} = require('./backend/services/rules_engine.js');

const fields = {
  manufacturer_name: "Test Co",
  manufacturer_address: "123 Test St",
  country_of_origin: "India",
  common_name: "Chips",
  net_quantity: "50",
  net_quantity_unit: "g",
  mrp: "50",
  mrp_includes_tax_statement: true,
  mfg_date: "01/2026",
  consumer_care_details: "test@test.com"
};

const results = [
  checkApplicability(fields, {}),
  checkExemption(fields, {}),
  checkManufacturerName(fields),
  checkManufacturerAddress(fields),
  checkCountryOfOrigin(fields, {}),
  checkGenericName(fields),
  checkNetQuantityPresence(fields),
  checkUnitConvention(fields),
  checkMfgDate(fields),
  checkMRP(fields),
  checkConsumerCare(fields),
  checkMisleadingQuantityWording(fields)
].flat();

console.log(JSON.stringify(results, null, 2));
