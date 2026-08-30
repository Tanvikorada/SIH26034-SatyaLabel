const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const s1 = `      const reportPath = await generateReport({
        scan: scan.toJSON(),
        productName,
        brandName,
        results: violationsToSave,
        overallCompliance: stats.overallCompliance
      });`;

const r1 = `      const scanData = scan.toJSON();
      scanData.productName = productName;
      scanData.brandName = brandName;
      scanData.violations = violationsToSave;
      scanData.overallStatus = stats.overallCompliance;
      const reportPath = await generateReport(scanData);`;

js = js.replace(s1, r1);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("generateReport argument fixed");
