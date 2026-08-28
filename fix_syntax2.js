const fs = require('fs');
let js = fs.readFileSync('backend/services/rules_engine.js', 'utf8');

const s1 = `    if (options.is_retail === false) {
      return na(R, T, 'applicability', 
      'User indicated this is not a retail package. Chapter II provisions may not apply.');
    }

    return null;
  }


  // If officer confirmed applicability, proceed (return null = no issue, continue checks)`;

const r1 = `    if (options.is_retail === false) {
      return na(R, T, 'applicability', 
      'User indicated this is not a retail package. Chapter II provisions may not apply.');
    }

  // If officer confirmed applicability, proceed (return null = no issue, continue checks)`;

js = js.replace(s1, r1);

fs.writeFileSync('backend/services/rules_engine.js', js);
console.log("Syntax error 2 fixed");
