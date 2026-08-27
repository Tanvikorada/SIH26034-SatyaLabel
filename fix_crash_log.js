const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const catchBlock = `  } catch (err) {
    console.error('[Pipeline] Fatal error processing batch', batch.id, err);
    await batch.update({ status: 'failed' }).catch(() => {});
  }`;

const newCatchBlock = `  } catch (err) {
    console.error('[Pipeline] Fatal error processing batch', batch.id, err);
    require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
    await batch.update({ status: 'failed' }).catch(() => {});
  }`;

js = js.replace(catchBlock, newCatchBlock);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("Added crash logger");
