const fs = require('fs');

let js = fs.readFileSync('backend/services/report_service.js', 'utf8');

const target = `    // Ministry branding
    page1.drawText('Ministry of Consumer Affairs, Food & Public Distribution', {
      x: margin, y: pageH - 30,
      size: 9, font: helvetica, color: COLORS.midGray,
    });
    page1.drawText('Department of Consumer Affairs - Legal Metrology Division', {
      x: margin, y: pageH - 45,
      size: 9, font: helvetica, color: COLORS.midGray,
    });
  
    // App branding
    page1.drawText('SatyaLabel', {
      x: pageW - 130, y: pageH - 35,
      size: 18, font: helveticaBold, color: COLORS.saffron,
    });
    page1.drawText('Compliance Checker - SIH26034', {
      x: pageW - 185, y: pageH - 55,
      size: 8, font: helvetica, color: COLORS.midGray,
    });
  
    // Title
    page1.drawText('PACKAGED COMMODITY COMPLIANCE REPORT', {
      x: margin, y: pageH - 110,
      size: 16, font: helveticaBold, color: COLORS.textDark,
    });
  
    // Compliance status watermark-style badge
    const isCompliant = scan.overallStatus === 'compliant';
    const isNonCompliant = scan.overallStatus === 'non_compliant';
    const badgeColor = isCompliant ? COLORS.green : isNonCompliant ? COLORS.red : COLORS.orange;
    const badgeText = isCompliant ? 'COMPLIANT' : isNonCompliant ? 'NON-COMPLIANT' : 'PARTIALLY COMPLIANT';
  
    drawRect(page1, pageW - 200, pageH - 120, 155, 28, badgeColor);
    page1.drawText(badgeText, {
      x: pageW - 195, y: pageH - 110,
      size: 11, font: helveticaBold, color: COLORS.white,
    });`;

const replace = `    // Ministry branding
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
    page1.drawText(\`REF: LMD-AI-\${String(scan.id).substring(0,8).toUpperCase()}-\${new Date().getFullYear()}\`, {
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
    page1.drawText(\`DATE: \${new Date().toISOString().split('T')[0]}\`, {
      x: pageW - 190, y: pageH - 165,
      size: 8, font: helvetica, color: stampColor,
      rotate: degrees(15),
      opacity: 0.6
    });`;

js = js.replace(target, replace);
fs.writeFileSync('backend/services/report_service.js', js);
console.log("PDF header fixed!");
