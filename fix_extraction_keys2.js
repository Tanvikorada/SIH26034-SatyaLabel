const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

js = js.replace("allergens_or_warnings: 'allergens_or_warnings',", "allergens_or_warnings: 'allergens_or_warnings',\n      visual_readability: 'visual_readability',\n      is_wholesale_or_multipiece_package: 'is_wholesale_or_multipiece_package',");

fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Replaced");
