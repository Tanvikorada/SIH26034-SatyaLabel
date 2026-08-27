import re

with open("frontend/app/results/[id]/page.jsx", "r", encoding="utf-8") as f:
    js = f.read()

old_ui = """                  <div className="text-[15px] leading-relaxed text-text-secondary space-y-3">
                    <p>
                      <strong className="text-text-primary font-medium">Verdict:</strong> The label {report.complianceScore >= 80 ? 'meets most legal requirements' : 'violates multiple mandatory declarations'} under the Legal Metrology (Packaged Commodities) Rules, 2011.
                    </p>
                    <p>
                      <strong className="text-text-primary font-medium">Critical Findings:</strong> Out of {report.totalRulesChecked} rules verified by the AI engine, <span className={report.totalViolations > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>{report.totalViolations} violations</span> were detected.
                    </p>
                    <p className="text-[13px] bg-background/50 p-3 rounded-lg border border-border mt-4">
                      <strong>Legal Context:</strong> The manufacturer, packer, or importer is strictly liable under Rule 32 for the omission of declarations such as MRP, Net Quantity, or Manufacturer Address on the principal display panel. {report.totalViolations > 0 ? "An official notice may be issued." : "No immediate action required."}
                    </p>
                  </div>"""

new_ui = """                  <div className="text-[15px] leading-relaxed text-text-secondary space-y-3">
                    {report.extracted_fields?._ai_analysis ? (
                      report.extracted_fields._ai_analysis.split('\\n\\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))
                    ) : (
                      <>
                        <p>
                          <strong className="text-text-primary font-medium">Verdict:</strong> The label {report.complianceScore >= 80 ? 'meets most legal requirements' : 'violates multiple mandatory declarations'} under the Legal Metrology (Packaged Commodities) Rules, 2011.
                        </p>
                        <p>
                          <strong className="text-text-primary font-medium">Critical Findings:</strong> Out of {report.totalRulesChecked} rules verified by the AI engine, <span className={report.totalViolations > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>{report.totalViolations} violations</span> were detected.
                        </p>
                        <p className="text-[13px] bg-background/50 p-3 rounded-lg border border-border mt-4">
                          <strong>Legal Context:</strong> The manufacturer, packer, or importer is strictly liable under Rule 32 for the omission of declarations such as MRP, Net Quantity, or Manufacturer Address on the principal display panel. {report.totalViolations > 0 ? "An official notice may be issued." : "No immediate action required."}
                        </p>
                      </>
                    )}
                  </div>"""

js = js.replace(old_ui, new_ui)

with open("frontend/app/results/[id]/page.jsx", "w", encoding="utf-8") as f:
    f.write(js)
print("Frontend UI updated to use true AI Auditor output")
