const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

// Replace the end of runBatchPipeline to use a finally block for SSE
const target = `    }
    
    // SSE Push Notification
    const clients = batchClients.get(String(batch.id)) || [];
    clients.forEach(clientRes => {
      clientRes.write(\`data: \${JSON.stringify({ status: batch.status })}\\n\\n\`);
      clientRes.end();
    });
    batchClients.delete(String(batch.id));

  } catch (err) {
    console.error('[Pipeline] Fatal error processing batch', batch.id, err);
    require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
    await batch.update({ status: 'failed' }).catch(() => {});
  }
}`;

const replace = `    }
  } catch (err) {
    console.error('[Pipeline] Fatal error processing batch', batch.id, err);
    require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
    await batch.update({ status: 'failed' }).catch(() => {});
  } finally {
    // SSE Push Notification MUST fire even on early returns
    const clients = batchClients.get(String(batch.id)) || [];
    clients.forEach(clientRes => {
      clientRes.write(\`data: \${JSON.stringify({ status: batch.status })}\\n\\n\`);
      clientRes.end();
    });
    batchClients.delete(String(batch.id));
  }
}`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Fixed SSE leak in finally block!");
} else {
  console.log("Target not found!");
}
