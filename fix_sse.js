const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

// 1. Add SSE endpoint
const s1 = `router.get('/batch/:id', requireAuth, async (req, res) => {`;
const r1 = `// Global SSE clients map
const batchClients = new Map();

// GET /api/v1/scans/batch/:id/stream - SSE Endpoint
router.get('/batch/:id/stream', requireAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const batchId = String(req.params.id);
  if (!batchClients.has(batchId)) batchClients.set(batchId, []);
  batchClients.get(batchId).push(res);
  
  // Send initial ping to establish connection
  res.write(': ping\\n\\n');

  req.on('close', () => {
    const clients = batchClients.get(batchId) || [];
    batchClients.set(batchId, clients.filter(c => c !== res));
  });
});

router.get('/batch/:id', requireAuth, async (req, res) => {`;

js = js.replace(s1, r1);

// 2. Notify clients in pipeline
const s2 = `    if (successfulScans > 0) {
      await batch.update({ status: 'completed' });
    } else {
      await batch.update({ status: 'failed' });
    }`;
const r2 = `    if (successfulScans > 0) {
      await batch.update({ status: 'completed' });
    } else {
      await batch.update({ status: 'failed' });
    }
    
    // SSE Push Notification
    const clients = batchClients.get(String(batch.id)) || [];
    clients.forEach(clientRes => {
      clientRes.write(\`data: \${JSON.stringify({ status: batch.status })}\\n\\n\`);
      clientRes.end();
    });
    batchClients.delete(String(batch.id));`;

js = js.replace(s2, r2);

// Handle crash SSE
const s3 = `    } catch (err) {
      console.error('[Pipeline] Fatal error processing batch', batch.id, err);
      require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
      await batch.update({ status: 'failed' }).catch(() => {});
    }`;
const r3 = `    } catch (err) {
      console.error('[Pipeline] Fatal error processing batch', batch.id, err);
      require('fs').writeFileSync(require('path').join(__dirname, '../uploads/last_crash.txt'), err.stack || err.message);
      await batch.update({ status: 'failed' }).catch(() => {});
      
      const clients = batchClients.get(String(batch.id)) || [];
      clients.forEach(clientRes => {
        clientRes.write(\`data: \${JSON.stringify({ status: 'failed' })}\\n\\n\`);
        clientRes.end();
      });
      batchClients.delete(String(batch.id));
    }`;
js = js.replace(s3, r3);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("SSE injected");
