const fs = require('fs');
let code = fs.readFileSync('services/extraction_service.js', 'utf8');

const target = `ingredients: g.ingredients || null,
    veg_nonveg: g.veg_nonveg || null,`;

const newText = `ingredients: g.ingredients || null,
    veg_nonveg: g.veg_nonveg || null,
    
    // Extracted during 9 PM - 12 AM session
    ai_summary: g.ai_summary || null,
    ingredient_analysis: g.ingredient_analysis || null,
    packer_name: g.packer_name || null,
    packer_address: g.packer_address || null,
    importer_name: g.importer_name || null,
    importer_address: g.importer_address || null,
    nutritional_info: g.nutritional_info || null,`;

code = code.replace(target, newText);
fs.writeFileSync('services/extraction_service.js', code);
console.log("EXTRACTOR FIXED");
