import re

with open('backend/services/report_service.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'''    for \(let i = 0; i < violations.length; i\+\+\) \{
      const v = violations\[i\];
      if \(vy < 120\) \{
        // Would overflow  add another page \(simplified: stop at 50 violations\)
        break;
      \}

      const sevColor = v.severity === 'critical' \? COLORS.red :
                       v.severity === 'major'    \? COLORS.orange : COLORS.yellow;

      // Violation card background
      drawRect\(page, margin, vy - 65, contentW, 72, COLORS.lightGray\);
      drawRect\(page, margin, vy - 65, 4, 72, sevColor\); // Left accent bar

      // Rule number badge
      drawRect\(page, margin \+ 12, vy - 10, 120, 18, sevColor\);
      page.drawText\(v.ruleNumber, \{
        x: margin \+ 15, y: vy - 5,
        size: 9, font: helveticaBold, color: COLORS.white,
      \}\);

      // Severity label
      page.drawText\(v.severity.toUpperCase\(\), \{
        x: margin \+ 145, y: vy - 5,
        size: 8, font: helveticaBold, color: sevColor,
      \}\);

      if \(v.isEstimated\) \{
        page.drawText\('\[ESTIMATED\]', \{
          x: margin \+ 210, y: vy - 5,
          size: 7, font: helveticaBold, color: COLORS.orange,
        \}\);
      \}

      // Rule description
      page.drawText\(truncate\(v.ruleDescription, 85\), \{
        x: margin \+ 12, y: vy - 25,
        size: 7.5, font: helvetica, color: COLORS.midGray,
      \}\);

      // Violation finding
      page.drawText\(truncate\(v.violationDetail, 90\), \{
        x: margin \+ 12, y: vy - 40,
        size: 8, font: helveticaBold, color: COLORS.textDark,
      \}\);

      if \(v.isEstimated && v.estimationNote\) \{
        page.drawText\(`Note: \$\{truncate\(v.estimationNote, 85\)\}`, \{
          x: margin \+ 12, y: vy - 56,
          size: 6.5, font: helvetica, color: COLORS.orange,
        \}\);
      \}'''

replacement = '''    for (let i = 0; i < violations.length; i++) {
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
      }'''

if pattern in text:
    print("Found exact match")
else:
    match = re.search(r"    for \(let i = 0; i < violations.length; i\+\+\) \{[\s\S]*?vy - 56,[\s\S]*?\}\);\n      \}", text)
    if match:
        text = text[:match.start()] + replacement + text[match.end():]
        print("Regex match succeeded")
    else:
        print("Not found")

with open('backend/services/report_service.js', 'w', encoding='utf-8') as f:
    f.write(text)
