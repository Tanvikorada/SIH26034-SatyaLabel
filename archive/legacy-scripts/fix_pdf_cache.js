const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetStr = `      // Return existing report if file still present
      const existingReport = scan.reports?.[0];
      if (existingReport && fs.existsSync(existingReport.filePath)) {
        return ok(res, {
          report_id:  existingReport.id,
          file_url:   \`/api/v1/reports/\${existingReport.id}/download\`,
          created_at: existingReport.created_at,
        });
      }`;

const replaceStr = `      // Return existing report if file still present
      const existingReport = scan.reports?.[0];
      // CACHE DISABLED FOR HACKATHON - ALWAYS REGENERATE WITH LATEST TEMPLATE
      // if (existingReport && fs.existsSync(existingReport.filePath)) { ... }`;

js = js.replace(targetStr, replaceStr);
fs.writeFileSync('backend/routes/scans.js', js);
console.log("CACHE DISABLED");
