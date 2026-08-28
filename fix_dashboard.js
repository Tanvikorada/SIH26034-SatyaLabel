const fs = require('fs');
let js = fs.readFileSync('backend/routes/dashboard.js', 'utf8');

js = js.replace("const { optionalAuth } = require('../middleware/auth');", "const { requireAuth } = require('../middleware/auth');");
js = js.replace("router.get('/stats', optionalAuth, async (req, res) => {", "router.get('/stats', requireAuth, async (req, res) => {");
js = js.replace("router.get('/products', optionalAuth, async (req, res) => {", "router.get('/products', requireAuth, async (req, res) => {");

const queryOverview = `
      SELECT
        COUNT(*)                                                                         AS "totalScans",
        COUNT(*) FILTER (WHERE overall_compliance IN ('PASS', 'compliant'))              AS "compliant",
        COUNT(*) FILTER (WHERE overall_compliance IN ('POTENTIAL NON-COMPLIANCE', 'non_compliant')) AS "nonCompliant",
        COUNT(*) FILTER (WHERE overall_compliance IN ('MANUAL REVIEW', 'needs_review')) AS "needsReview",
        COUNT(*) FILTER (WHERE overall_compliance = 'NOT VERIFIED')                     AS "notVerified",
        COUNT(*) FILTER (WHERE overall_compliance = 'NOT APPLICABLE')                   AS "notApplicable",
        COALESCE(SUM(total_violations), 0)                                              AS "totalViolations",
        COALESCE(SUM(high_violations), 0)                                               AS "highViolations",
        COALESCE(ROUND(AVG(compliance_score)::NUMERIC, 1), 0)                           AS "avgComplianceScore"
      FROM scans
      WHERE status = 'complete'
    \`, { type: QueryTypes.SELECT });`;

const newOverview = `
      SELECT
        COUNT(*)                                                                         AS "totalScans",
        COUNT(*) FILTER (WHERE overall_compliance IN ('PASS', 'compliant'))              AS "compliant",
        COUNT(*) FILTER (WHERE overall_compliance IN ('POTENTIAL NON-COMPLIANCE', 'non_compliant')) AS "nonCompliant",
        COUNT(*) FILTER (WHERE overall_compliance IN ('MANUAL REVIEW', 'needs_review')) AS "needsReview",
        COUNT(*) FILTER (WHERE overall_compliance = 'NOT VERIFIED')                     AS "notVerified",
        COUNT(*) FILTER (WHERE overall_compliance = 'NOT APPLICABLE')                   AS "notApplicable",
        COALESCE(SUM(total_violations), 0)                                              AS "totalViolations",
        COALESCE(SUM(high_violations), 0)                                               AS "highViolations",
        COALESCE(ROUND(AVG(compliance_score)::NUMERIC, 1), 0)                           AS "avgComplianceScore"
      FROM scans
      WHERE status = 'complete'
      \${req.user && req.user.role !== 'admin' ? \` AND uploaded_by = '\${req.user.id}'\` : ''}
    \`, { type: QueryTypes.SELECT });`;

js = js.replace(queryOverview, newOverview);

// Also need to inject into recentScans
const recentScansOld = `const recentScans = await Scan.findAll({
      where: { status: 'complete' },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });`;

const recentScansNew = `
    let scanWhere = { status: 'complete' };
    if (req.user && req.user.role !== 'admin') {
      scanWhere.uploadedBy = req.user.id;
    }
    const recentScans = await Scan.findAll({
      where: scanWhere,
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });`;

js = js.replace(recentScansOld, recentScansNew);

fs.writeFileSync('backend/routes/dashboard.js', js);
console.log("Dashboard isolation fixed");
