const { generateAIAuditorAnalysis } = require('./backend/services/auditor_service');
const config = require('./backend/config');

async function test() {
  console.log("Key:", config.groq.apiKey);
  if (!config.groq.apiKey) {
    console.log("No key locally. Can't test.");
    return;
  }
  const fields = { product_name: "Test" };
  const violations = [{ ruleId: "Rule 6", status: "FAIL", detail: "Missing MRP" }];
  console.log("Running...");
  const res = await generateAIAuditorAnalysis(fields, violations, "raw text");
  console.log("Result:", res);
}
test();
