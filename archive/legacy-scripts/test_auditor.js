const { generateAIAuditorAnalysis } = require('./backend/services/auditor_service');

async function test() {
  const fields = { product_name: "Test" };
  const violations = [{ ruleId: "Rule 6", status: "FAIL", detail: "Missing MRP" }];
  console.log("Running...");
  const res = await generateAIAuditorAnalysis(fields, violations, "raw text");
  console.log("Result:", res);
}
test();
