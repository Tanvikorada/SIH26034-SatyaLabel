const fs = require('fs');
let js = fs.readFileSync('backend/services/extraction_service.js', 'utf8');

const s1 = `      allergens_or_warnings: 'allergens_or_warnings',
    };`;

const r1 = `      allergens_or_warnings: 'allergens_or_warnings',
      visual_readability: 'visual_readability',
      is_wholesale_or_multipiece_package: 'is_wholesale_or_multipiece_package'
    };`;

js = js.replace(s1, r1);
fs.writeFileSync('backend/services/extraction_service.js', js);
console.log("Added missing keys");
