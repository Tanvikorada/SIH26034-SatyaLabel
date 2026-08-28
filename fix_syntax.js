const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

js = js.replace('  }.`);\n  }', '  }\n');
js = js.replace('  }.`);\r\n  }', '  }\n');
js = js.replace('  }.`);', '  }');

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Syntax error fixed");
