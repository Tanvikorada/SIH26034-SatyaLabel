const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `      } catch (innerErr) {
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
      }`;

const r1 = `      } catch (innerErr) {
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }`;

js = js.replace(s1, r1);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Injected error logger");
