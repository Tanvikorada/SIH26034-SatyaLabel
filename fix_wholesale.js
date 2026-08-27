const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const sIdx = js.indexOf('function checkApplicability(fields, options) {');
const eIdx = js.indexOf('}', sIdx) + 1;

const newFn = `function checkApplicability(fields, options) {
    const R = 'Rule 3';
    const T = 'Applicability of the Chapter';

    // MULTI-PIECE / WHOLESALE BYPASS (Rule 29)
    if (fields.is_wholesale_or_multipiece_package === true || fields.is_wholesale_or_multipiece_package === 'true') {
      return review('Rule 29', 'Wholesale / Multi-piece Package', 'general', 'low',
        'Wholesale or multi-piece package detected. Standard retail declarations under Rule 6 may not fully apply. Manual verification against Rule 29 is required.');
    }

    if (options.is_retail === false) {
      return na(R, T, 'applicability', 
      'User indicated this is not a retail package. Chapter II provisions may not apply.');
    }

    return null;
  }`;

js = js.substring(0, sIdx) + newFn + js.substring(eIdx);

// Also need to add is_wholesale_or_multipiece_package to extractFields so it passes through
fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Wholesale logic added to Rules Engine");
