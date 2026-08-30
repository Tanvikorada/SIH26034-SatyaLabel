const fs = require('fs');
let code = fs.readFileSync('backend/services/report_service.js', 'utf8');

// Replace scan.productName with correct field
code = code.replace(/scan\.productName/g, "(scan.product?.product_name || (scan.extracted_fields ? scan.extracted_fields.product_name : null))");

// Replace scan.brandName with correct field
code = code.replace(/scan\.brandName/g, "(scan.product?.brand_name || (scan.extracted_fields ? scan.extracted_fields.brand_name : null))");

// Replace scan.totalViolations
code = code.replace(/scan\.totalViolations/g, "(scan.violations ? scan.violations.filter(v => v.status !== 'PASS').length : 0)");

// Replace scan.criticalViolations
code = code.replace(/scan\.criticalViolations/g, "(scan.violations ? scan.violations.filter(v => v.severity === 'high').length : 0)");

// Replace scan.totalRulesChecked
code = code.replace(/scan\.totalRulesChecked/g, "(scan.violations ? scan.violations.length : 16)");

// Let's also add the Extracted Fields to the PDF, right after Violation Summary!
const statsEndStr = "  y -= 25;";
const fieldsCode = `
  // --- Extracted Fields ---
  page1.drawText('EXTRACTED DATA', {
    x: margin, y,
    size: 12, font: helveticaBold, color: COLORS.textDark,
  });
  y -= 5;
  drawRect(page1, margin, y - 2, contentW, 2, COLORS.saffron);
  y -= 20;
  
  if (scan.extracted_fields) {
    const fields = Object.entries(scan.extracted_fields).filter(([k,v]) => !k.startsWith('_') && v);
    for (const [k, v] of fields) {
      if (y < margin + 40) {
        // Simple page overflow handling for fields (just a safety)
        break; 
      }
      page1.drawText(truncate(k.replace(/_/g, ' ').toUpperCase(), 30) + ':', {
        x: margin, y,
        size: 9, font: helveticaBold, color: COLORS.textDark,
      });
      page1.drawText(truncate(String(v), 80), {
        x: margin + 150, y,
        size: 9, font: helvetica, color: COLORS.textDark,
      });
      y -= 14;
    }
  }
  y -= 15;
`;
// Let's just insert it before VIOLATIONS (detailed list)
code = code.replace(/  page1\.drawText\('VIOLATION DETAILS'/g, fieldsCode + "\n  page1.drawText('VIOLATION DETAILS'");

fs.writeFileSync('backend/services/report_service.js', code);
console.log("PDF DATA FIXED");
