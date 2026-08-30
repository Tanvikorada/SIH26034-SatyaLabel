import re

with open("backend/routes/scans.js", "r", encoding="utf-8") as f:
    js = f.read()

guardrail_old = """    // Step 3: Rules engine"""
guardrail_new = """    // Step 2.5: Multi-Product Guardrail
    if (ocrResult.geminiStructuredData?.error === 'MULTI_PRODUCT_DETECTED') {
      console.warn(`[Pipeline] Scan ${scan.id} failed: Multiple products detected in a single frame.`);
      await scan.update({
        status: 'failed',
        errorMessage: 'Multiple products detected. Please scan one product at a time for accurate compliance analysis.',
      });
      return;
    }

    // Step 3: Rules engine"""

js = js.replace(guardrail_old, guardrail_new)

with open("backend/routes/scans.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Scans route updated with Multi-Product guardrail")
