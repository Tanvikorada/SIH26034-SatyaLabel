const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `      if (successfulScans > 0) {
        await batch.update({ status: 'completed' });
      } else {
        await batch.update({ status: 'failed' });
      }`;

const r1 = `      if (successfulScans > 0) {
        await batch.update({ status: 'completed' });
      } else {
        await batch.update({ status: 'failed', errorMessage: global.lastInnerErr || 'Unknown error' });
      }`;

const s2 = `      } catch (innerErr) {
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);`;

const r2 = `      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);`;

js = js.replace(s1, r1);
js = js.replace(s2, r2);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Injected error into DB");
