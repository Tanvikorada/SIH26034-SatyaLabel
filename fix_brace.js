const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }
    }

    if (successfulScans > 0) {`;

const replace = `      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }

    if (successfulScans > 0) {`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed the extra brace!");
} else {
  console.log("Could not find the extra brace.");
}
