const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const startIdx = js.indexOf('async function runScanPipeline');
const endIdx = js.indexOf('//  GET /api/v1/scans '); 
if (endIdx === -1) {
  const endIdx2 = js.indexOf('// ─── GET /api/v1/scans');
  console.log("endIdx2", endIdx2);
}

// I will just use regex to replace everything from `async function runScanPipeline` to `//  GET /api/v1/scans` (handling various emojis).
