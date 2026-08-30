const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetStr = `  function formatScanFull(scan) {
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
      image_url: JSON.stringify(imgUrl),`;

const idx = js.indexOf("image_url: scan.imagePath ?");
if (idx !== -1) {
  const start = js.lastIndexOf("function formatScanFull(scan) {", idx);
  const end = js.indexOf("source_type: scan.sourceType,", idx);
  
  if (start !== -1 && end !== -1) {
    js = js.substring(0, start) + replace + "\n      " + js.substring(end);
    fs.writeFileSync('backend/routes/scans.js', js);
    console.log("FORMAT SCAN FIXED");
  } else {
    console.log("START OR END NOT FOUND");
  }
} else {
  console.log("IDX NOT FOUND");
}
