// backend/services/report_service.js
// PDF Compliance Report Generator — SIH26034
// Uses pdf-lib for zero-cost, offline PDF creation

const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const COLORS = {
  saffron:     rgb(1.0, 0.6, 0.0),      // India saffron #FF9900
  green:       rgb(0.07, 0.53, 0.03),   // India green #138808
  darkBlue:    rgb(0.06, 0.09, 0.16),   // Dark slate #0F1728
  white:       rgb(1, 1, 1),
  lightGray:   rgb(0.95, 0.95, 0.95),
  midGray:     rgb(0.6, 0.6, 0.6),
  red:         rgb(0.85, 0.12, 0.08),   // Critical violation
  orange:      rgb(0.95, 0.45, 0.0),    // Major violation
  yellow:      rgb(0.85, 0.70, 0.0),    // Minor violation
  textDark:    rgb(0.1, 0.1, 0.1),
};

/**
 * Sanitize text for WinAnsi encoding (StandardFonts.Helvetica)
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\u2248/g, '~')       // approx
    .replace(/\u20B9/g, 'Rs.')     // rupee
    .replace(/[\u201C\u201D]/g, '"') // smart quotes
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/\u2014/g, '-')       // em dash
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); // Keep standard printable ASCII & Latin-1
}

/**
 * Truncate text to max length with ellipsis
 */
function truncate(str, max = 80) {
  const s = sanitize(String(str || ''));
  return s.length > max ? s.slice(0, max - 3) + '...' : s;
}

/**
 * Draw a colored rectangle
 */
function drawRect(page, x, y, w, h, color) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

/**
 * Generate PDF compliance report for a scan.
 *
 * @param {object} scan        - Scan record (with violations and extractedFields)
 * @param {string} outputDir   - Directory to save the PDF
 * @returns {string}           - Path to generated PDF
 */
async function generateReport(scan, outputDir = './reports') {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Override drawText to automatically sanitize all strings for WinAnsi
  const overrideDrawText = (page) => {
    const originalDrawText = page.drawText.bind(page);
    page.drawText = (text, options) => {
      originalDrawText(sanitize(String(text)), options);
    };
    return page;
  };

  const pageW = 595; // A4 width in points
  const pageH = 842; // A4 height in points
  const margin = 50;
  const contentW = pageW - margin * 2;

  // ── PAGE 1: Header + Overview ──────────────────────────────────────────────
  const page1 = overrideDrawText(pdfDoc.addPage([pageW, pageH]));

  // Header bar
  drawRect(page1, 0, pageH - 80, pageW, 80, COLORS.darkBlue);

  // Ministry branding
    page1.drawText('GOVERNMENT OF INDIA', {
      x: margin, y: pageH - 25,
      size: 14, font: helveticaBold, color: COLORS.white,
    });
    page1.drawText('Ministry of Consumer Affairs, Food & Public Distribution', {
      x: margin, y: pageH - 40,
      size: 10, font: helvetica, color: COLORS.saffron,
    });
    page1.drawText('Department of Consumer Affairs - Legal Metrology Division', {
      x: margin, y: pageH - 55,
      size: 9, font: helvetica, color: COLORS.lightGray,
    });
  
    // App branding
    page1.drawText('SatyaLabel System (SIH26034)', {
      x: pageW - 190, y: pageH - 35,
      size: 12, font: helveticaBold, color: COLORS.white,
    });
    page1.drawText('Official AI Inspection Node', {
      x: pageW - 150, y: pageH - 50,
      size: 9, font: helvetica, color: COLORS.saffron,
    });
  
    // Title
    page1.drawText('NOTICE UNDER LEGAL METROLOGY ACT, 2009', {
      x: margin, y: pageH - 110,
      size: 16, font: helveticaBold, color: COLORS.textDark,
    });
    
    // Add a fake barcode/reference number
    page1.drawText(`REF: LMD-AI-${String(scan.id).substring(0,8).toUpperCase()}-${new Date().getFullYear()}`, {
      x: margin, y: pageH - 125,
      size: 10, font: helveticaBold, color: COLORS.midGray,
    });

    const isCompliant = scan.overallStatus === 'compliant';
    const isNonCompliant = scan.overallStatus === 'non_compliant';

    // Draw an official-looking rubber stamp at an angle
    const stampText = isCompliant ? 'VERIFIED PASSED' : 'VIOLATION DETECTED';
    const stampColor = isCompliant ? COLORS.green : COLORS.red;
    
    // Draw outer box for stamp
    page1.drawRectangle({
      x: pageW - 220, y: pageH - 160,
      width: 170, height: 40,
      borderColor: stampColor,
      borderWidth: 3,
      rotate: degrees(15),
      opacity: 0.6
    });
    
    // Draw text inside stamp
    page1.drawText(stampText, {
      x: pageW - 210, y: pageH - 148,
      size: 16, font: helveticaBold, color: stampColor,
      rotate: degrees(15),
      opacity: 0.6
    });
    
    // Draw small date on stamp
    page1.drawText(`DATE: ${new Date().toISOString().split('T')[0]}`, {
      x: pageW - 190, y: pageH - 165,
      size: 8, font: helvetica, color: stampColor,
      rotate: degrees(15),
      opacity: 0.6
    });

  // Scan metadata
  let y = pageH - 145;
  const metaItems = [
    ['Report ID', scan.id],
    ['Generated', new Date().toLocaleString('en-IN')],
    ['Product Name', truncate((scan.product?.product_name || (scan.extracted_fields ? scan.extracted_fields.product_name : null)) || 'Unknown', 60)],
    ['Brand', truncate((scan.product?.brand_name || (scan.extracted_fields ? scan.extracted_fields.brand_name : null)) || 'Unknown', 60)],
    ['OCR Engine', scan.ocrEngineUsed || 'tesseract'],
    ['Compliance Score', `${scan.complianceScore || 0}%`],
    ['Original File', truncate(scan.originalFilename || scan.imagePath, 60)],
  ];

  drawRect(page1, margin, y - (metaItems.length * 18) - 10, contentW, metaItems.length * 18 + 20, COLORS.lightGray);
  y -= 5;

  for (const [label, value] of metaItems) {
    page1.drawText(`${label}:`, {
      x: margin + 10, y,
      size: 9, font: helveticaBold, color: COLORS.textDark,
    });
    page1.drawText(String(value || '—'), {
      x: margin + 130, y,
      size: 9, font: helvetica, color: COLORS.textDark,
    });
    y -= 18;
  }

  y -= 25;

  // ── Violation Summary Stats ───────────────────────────────────────────────
  page1.drawText('VIOLATION SUMMARY', {
    x: margin, y,
    size: 12, font: helveticaBold, color: COLORS.textDark,
  });
  y -= 5;
  drawRect(page1, margin, y - 2, contentW, 2, COLORS.saffron);
  y -= 20;

  const statsData = [
    ['Total Rules Checked', (scan.violations ? scan.violations.length : 16) || 16, COLORS.darkBlue],
    ['Rules Passed', ((scan.violations ? scan.violations.length : 16) || 16) - ((scan.violations ? scan.violations.filter(v => v.status !== 'PASS').length : 0) || 0), COLORS.green],
    ['Critical Violations', (scan.violations ? scan.violations.filter(v => v.severity === 'high').length : 0) || 0, COLORS.red],
    ['Major Violations', ((scan.violations ? scan.violations.filter(v => v.status !== 'PASS').length : 0) || 0) - ((scan.violations ? scan.violations.filter(v => v.severity === 'high').length : 0) || 0), COLORS.orange],
    ['Minor / Estimated', scan.estimatedViolations || 0, COLORS.yellow],
  ];

  const statBoxW = (contentW - 20) / statsData.length;
  for (let i = 0; i < statsData.length; i++) {
    const [label, val, color] = statsData[i];
    const bx = margin + i * (statBoxW + 5);

    drawRect(page1, bx, y - 50, statBoxW, 60, color);
    page1.drawText(String(val), {
      x: bx + statBoxW / 2 - 10, y: y - 20,
      size: 20, font: helveticaBold, color: COLORS.white,
    });
    const words = label.split(' ');
    page1.drawText(words[0], {
      x: bx + 5, y: y - 38,
      size: 7, font: helvetica, color: COLORS.white,
    });
    if (words[1]) {
      page1.drawText(words.slice(1).join(' '), {
        x: bx + 5, y: y - 48,
        size: 7, font: helvetica, color: COLORS.white,
      });
    }
  }

  y -= 80;

  // ── Extracted Fields Table ────────────────────────────────────────────────
  page1.drawText('EXTRACTED FIELDS', {
    x: margin, y,
    size: 12, font: helveticaBold, color: COLORS.textDark,
  });
  y -= 5;
  drawRect(page1, margin, y - 2, contentW, 2, COLORS.saffron);
  y -= 20;

  // Table header
  drawRect(page1, margin, y - 2, contentW, 16, COLORS.darkBlue);
  page1.drawText('Field', { x: margin + 5, y: y + 2, size: 8, font: helveticaBold, color: COLORS.white });
  page1.drawText('Extracted Value', { x: margin + 150, y: y + 2, size: 8, font: helveticaBold, color: COLORS.white });
  page1.drawText('Status', { x: margin + 420, y: y + 2, size: 8, font: helveticaBold, color: COLORS.white });
  y -= 18;

  const fieldLabels = {
    product_name: 'Product Name',
    brand_name: 'Brand Name',
    net_quantity: 'Net Quantity',
    mrp: 'MRP',
    mfg_date: 'Mfg. Date',
    best_before: 'Best Before',
    manufacturer_name: 'Manufacturer Name',
    manufacturer_address: 'Mfr. Address',
    customer_care: 'Customer Care',
    batch_lot_number: 'Batch/Lot No.',
    fssai_license: 'FSSAI License No.',
    country_of_origin: 'Country of Origin',
  };

  const extractedObj = scan.extractedFields || {};
  const fields = Array.isArray(extractedObj) 
    ? extractedObj 
    : Object.keys(extractedObj).filter(k => !k.startsWith('_')).map(k => ({
        fieldName: k,
        fieldValue: extractedObj[k],
        isPresent: !!extractedObj[k]
      }));

  let rowBg = false;

  for (const field of fields) {
    if (!fieldLabels[field.fieldName]) continue;
    if (y < 80) break; // Overflow protection

    if (rowBg) drawRect(page1, margin, y - 3, contentW, 14, COLORS.lightGray);
    rowBg = !rowBg;

    const statusText = field.isPresent ? ' Found' : ' Missing';
    const statusColor = field.isPresent ? COLORS.green : COLORS.red;

    page1.drawText(fieldLabels[field.fieldName], {
      x: margin + 5, y,
      size: 7.5, font: helveticaBold, color: COLORS.textDark,
    });
    
    // Ensure string
    const valText = typeof field.fieldValue === 'object' ? JSON.stringify(field.fieldValue) : String(field.fieldValue || '');
    page1.drawText(truncate(valText, 45), {
      x: margin + 150, y,
      size: 7.5, font: helvetica, color: COLORS.textDark,
    });
    page1.drawText(statusText, {
      x: margin + 420, y,
      size: 7.5, font: helveticaBold, color: statusColor,
    });
    if (field.isEstimated) {
      page1.drawText('[Estimated]', {
        x: margin + 470, y,
        size: 6, font: helvetica, color: COLORS.orange,
      });
    }
    y -= 14;
  }

  y -= 10;

  // ── VIOLATIONS TABLE (may overflow to page 2) ─────────────────────────────
  const violations = scan.violations || [];

  const addViolationsPage = async () => {
    const page = overrideDrawText(pdfDoc.addPage([pageW, pageH]));
    let vy = pageH - 60;

    // Page header
    drawRect(page, 0, pageH - 40, pageW, 40, COLORS.darkBlue);
    page.drawText('VIOLATION DETAILS', {
      x: margin, y: pageH - 28,
      size: 14, font: helveticaBold, color: COLORS.white,
    });
    page.drawText(`Scan ID: ${scan.id}`, {
      x: pageW - 280, y: pageH - 28,
      size: 8, font: helvetica, color: COLORS.midGray,
    });

    for (let i = 0; i < violations.length; i++) {
      const v = violations[i];
      if (vy < 120) {
        // Would overflow  add another page (simplified: stop at 50 violations)
        break;
      }
      
      const ruleNumStr = String(v.ruleNumber || v.rule_id || v.ruleId || 'Unknown Rule');
      const ruleDescStr = String(v.ruleDescription || v.rule_title || v.ruleTitle || '');
      const detailStr = String(v.violationDetail || v.detail || v.detail_text || '');
      const sevStr = String(v.severity || 'high');
      const isEst = v.isEstimated || v.confidence === 'low' || v.confidence === 'medium';
      const estNote = v.estimationNote || 'Physical verification required';

      const sevColor = sevStr.toLowerCase() === 'high' || sevStr.toLowerCase() === 'critical' ? COLORS.red :
                       sevStr.toLowerCase() === 'medium' || sevStr.toLowerCase() === 'major'    ? COLORS.orange : COLORS.yellow;

      // Violation card background
      drawRect(page, margin, vy - 65, contentW, 72, COLORS.lightGray);
      drawRect(page, margin, vy - 65, 4, 72, sevColor); // Left accent bar

      // Rule number badge
      drawRect(page, margin + 12, vy - 10, 120, 18, sevColor);
      page.drawText(ruleNumStr, {
        x: margin + 15, y: vy - 5,
        size: 9, font: helveticaBold, color: COLORS.white,
      });

      // Severity label
      page.drawText(sevStr.toUpperCase(), {
        x: margin + 145, y: vy - 5,
        size: 8, font: helveticaBold, color: sevColor,
      });

      if (isEst) {
        page.drawText('[ESTIMATED]', {
          x: margin + 210, y: vy - 5,
          size: 7, font: helveticaBold, color: COLORS.orange,
        });
      }

      // Rule description
      page.drawText(truncate(ruleDescStr, 85), {
        x: margin + 12, y: vy - 25,
        size: 7.5, font: helvetica, color: COLORS.midGray,
      });

      // Violation finding
      page.drawText(truncate(detailStr, 90), {
        x: margin + 12, y: vy - 40,
        size: 8, font: helveticaBold, color: COLORS.textDark,
      });

      if (isEst) {
        page.drawText(`Note: ${truncate(estNote, 85)}`, {
          x: margin + 12, y: vy - 56,
          size: 6.5, font: helvetica, color: COLORS.orange,
        });
      }

      vy -= 82;
    }

    // Footer
    drawRect(page, 0, 0, pageW, 35, COLORS.lightGray);
    page.drawText(
      'This report is generated by SatyaLabel (SIH26034). Findings are based on OCR analysis and must be verified against the physical product for enforcement action.',
      { x: margin, y: 20, size: 6.5, font: helvetica, color: COLORS.midGray }
    );
    page.drawText(`Generated: ${new Date().toISOString()}`, {
      x: pageW - 200, y: 20, size: 6.5, font: helvetica, color: COLORS.midGray,
    });
  };

  // Add violations page
  if (violations.length > 0) {
    await addViolationsPage();
  }

  // ── Footer on page 1 ──────────────────────────────────────────────────────
  drawRect(page1, 0, 0, pageW, 35, COLORS.lightGray);
  page1.drawText(
    'This report is generated by SatyaLabel (SIH26034). For enforcement use only — verify findings against the physical product.',
    { x: margin, y: 20, size: 6.5, font: helvetica, color: COLORS.midGray }
  );

  // ── Save PDF ──────────────────────────────────────────────────────────────
  const filename = `compliance_report_${scan.id}_${Date.now()}.pdf`;
  const filePath = path.join(outputDir, filename);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  console.log(`[Report] PDF generated: ${filePath}`);
  return filePath;
}

module.exports = { generateReport };
