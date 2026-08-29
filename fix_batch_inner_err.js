const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target1 = `      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
      }

    if (successfulScans > 0) {
      await batch.update({ status: 'completed' });
    } else {
      await batch.update({ status: 'failed' });
    }`;

const replace1 = `      } catch (innerErr) {
        global.lastInnerErr = innerErr.stack || innerErr.message;
        console.error('[Pipeline] Error processing individual product inside batch', batch.id, innerErr);
        require('fs').writeFileSync('inner_err.log', innerErr.stack || innerErr.message);
        await batch.update({ status: 'failed', errorMessage: 'Internal error during analysis: ' + innerErr.message });
      }

    if (successfulScans > 0) {
      await batch.update({ status: 'completed' });
    } else if (batch.status !== 'failed') {
      await batch.update({ status: 'failed', errorMessage: 'Processing failed.' });
    }`;

if (js.includes(target1)) {
  js = js.replace(target1, replace1);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Updated inner catch block!");
} else {
  console.log("Target not found!");
}
