const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const target = `  function formatScanFull(scan) {
    return {
      id: scan.id,
      status: scan.status,
      // image_url: relative path usable by frontend to display thumbnail
      image_url: scan.imagePath ? \`/uploads/\${path.basename(scan.imagePath)}\` : null,`;

const replace = `  function formatScanFull(scan) {
    let imgUrl = null;
    if (scan.imagePath) {
      try {
        const parsed = JSON.parse(scan.imagePath);
        imgUrl = parsed; // Send the array of URLs
      } catch (e) {
        if (scan.imagePath.startsWith('http')) {
          imgUrl = [scan.imagePath];
        } else {
          imgUrl = [\`/uploads/\${require('path').basename(scan.imagePath)}\`];
        }
      }
    }
    
    return {
      id: scan.id,
      status: scan.status,
      // image_url: actual Supabase URL array or local path
      image_url: imgUrl,`;

js = js.replace(target, replace);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("FORMAT SCAN FIXED");
