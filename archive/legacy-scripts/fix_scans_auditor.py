import re

with open("backend/routes/scans.js", "r", encoding="utf-8") as f:
    js = f.read()

import_statement = "const { generateAIAuditorAnalysis } = require('../services/auditor_service');"
if "generateAIAuditorAnalysis" not in js:
    js = js.replace("const { generateReport } = require('../services/report_service');", "const { generateReport } = require('../services/report_service');\nconst { generateAIAuditorAnalysis } = require('../services/auditor_service');")

pipeline_old = """    // Step 3: Rules engine
    const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);

    // Step 4: Find or create Product"""

pipeline_new = """    // Step 3: Rules engine
    const { results, violations, stats } = await validateCompliance(fieldsMap, ocrResult.text, metadata);

    // Step 3.5: AI Auditor Brain (Reasoning Layer)
    console.log("[Pipeline] Generating AI Auditor reasoning...");
    const aiAnalysis = await generateAIAuditorAnalysis(fieldsMap, violations, ocrResult.text);
    if (aiAnalysis) {
      fieldsMap._ai_analysis = aiAnalysis;
    }

    // Step 4: Find or create Product"""

js = js.replace(pipeline_old, pipeline_new)

with open("backend/routes/scans.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Scans route updated with LLM Auditor")
