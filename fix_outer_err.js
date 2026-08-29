const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetOuter = `    } catch (err) {
      console.error('[Pipeline] Fatal error processing batch', batch.id, err);
      require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
      await batch.update({ status: 'failed' }).catch(() => {});
    }`;

const replaceOuter = `    } catch (err) {
      console.error('[Pipeline] Fatal error processing batch', batch.id, err);
      try { require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message); } catch(e){}
      await batch.update({ status: 'failed', errorMessage: 'Fatal Error: ' + err.message }).catch(() => {});
    }`;

if (js.includes(targetOuter)) {
  js = js.replace(targetOuter, replaceOuter);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed outer err catch!");
} else {
  console.log("Could not find outer err target!");
}
