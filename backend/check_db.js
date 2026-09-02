const { Scan, Violation } = require('./models');

async function check() {
  const scan = await Scan.findOne({
    order: [['createdAt', 'DESC']],
    include: [{ model: Violation, as: 'violations' }]
  });
  console.log("SCAN ID:", scan.id);
  console.log("OVERALL COMPLIANCE:", scan.overallCompliance);
  console.log("VIOLATIONS:");
  scan.violations.forEach(v => {
    console.log(`  Rule: ${v.ruleId} | Status: ${v.status} | Detail: ${v.detail}`);
  });
}
check().catch(console.error).finally(() => process.exit(0));
