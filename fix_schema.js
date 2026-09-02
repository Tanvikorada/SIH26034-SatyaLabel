const fs = require('fs');
let code = fs.readFileSync('backend/services/ocr_service.js', 'utf8');

const newFields = `
  packer_name: z.string().nullable().optional(),
  packer_address: z.string().nullable().optional(),
  importer_name: z.string().nullable().optional(),
  importer_address: z.string().nullable().optional(),
  country_of_origin: z.string().nullable().optional(),`;

code = code.replace(/manufacturer_address: z\.string\(\)\.nullable\(\)\.optional\(\),/g, 'manufacturer_address: z.string().nullable().optional(),' + newFields);

fs.writeFileSync('backend/services/ocr_service.js', code);
console.log("SCHEMA FIXED");
