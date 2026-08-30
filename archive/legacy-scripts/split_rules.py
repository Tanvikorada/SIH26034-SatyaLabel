import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Replace the ruling ledger map block
old_block = r"const checks = report\.violations \|\| \[\];.*?return sortedChecks\.map\(\(v, i\) => \{.*?\);.*?\}\);.*?\(\)\}"

new_block = """const checks = report.violations || [];
                    const actionRequired = checks.filter(c => c.status === 'POTENTIAL NON-COMPLIANCE' || c.status === 'fail' || c.status === 'estimated_fail' || c.status === 'MANUAL REVIEW' || c.status === 'needs_review' || c.status === 'NOT VERIFIED');
                    const compliant = checks.filter(c => c.status === 'PASS' || c.status === 'pass' || c.status === 'NOT APPLICABLE');

                    const renderRule = (v, i) => {
                      const isPass = v.status === 'PASS' || v.status === 'pass';
                      const isReview = v.status === 'MANUAL REVIEW' || v.status === 'needs_review';
                      
                      let dotColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                      let badgeBg = 'bg-[#ef44441a] text-red-500';
                      
                      if (isPass) {
                        dotColor = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
                        badgeBg = 'bg-[#22c55e1a] text-green-500';
                      } else if (isReview) {
                        dotColor = 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
                        badgeBg = 'bg-[#f59e0b1a] text-amber-500';
                      }

                      return (
                        <div key={v.rule_id + i} className="flex flex-col p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors mb-2" onClick={() => setExpandedRule(expandedRule === v.rule_id ? null : v.rule_id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                              <div>
                                <div className="text-[11px] font-mono text-text-muted">{v.rule_id}</div>
                                <div className="text-[14px] font-medium tracking-tight mt-0.5">{v.rule_description || v.detail}</div>
                              </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeBg} whitespace-nowrap ml-4`}>{v.status === 'POTENTIAL NON-COMPLIANCE' ? 'FAIL' : v.status}</div>
                          </div>
                          {expandedRule === v.rule_id && v.detail && (
                            <div className="mt-4 pt-3 border-t border-border/50 text-[13px] text-text-secondary leading-relaxed">
                              {v.detail}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div className="flex flex-col gap-6">
                        {actionRequired.length > 0 && (
                          <div>
                            <div className="text-[11px] font-mono text-red-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-red-500"></span> Action Required ({actionRequired.length})
                            </div>
                            {actionRequired.map(renderRule)}
                          </div>
                        )}
                        {compliant.length > 0 && (
                          <div>
                            <div className="text-[11px] font-mono text-green-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2 mt-4">
                              <span className="w-1 h-1 rounded-full bg-green-500"></span> Compliant ({compliant.length})
                            </div>
                            {compliant.map(renderRule)}
                          </div>
                        )}
                      </div>
                    );
                  """

page = re.sub(old_block, new_block.strip(), page, flags=re.DOTALL)

# Add AI Compliance Summary block above the Ledger
summary_block = """
              {/* AI COMPLIANCE ANALYSIS */}
              <div className="border border-border rounded-2xl p-6 shadow-lg bg-surface relative overflow-hidden mb-6 mt-8">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-[14px] font-mono text-text-muted uppercase tracking-widest mb-4">AI Compliance Analysis</h3>
                <div className="text-[15px] leading-relaxed text-text-secondary space-y-3">
                  <p>
                    <strong className="text-text-primary font-medium">Verdict:</strong> The label {report.complianceScore >= 80 ? 'meets most legal requirements' : 'violates multiple mandatory declarations'} under the Legal Metrology (Packaged Commodities) Rules, 2011.
                  </p>
                  <p>
                    <strong className="text-text-primary font-medium">Critical Findings:</strong> Out of {report.totalRulesChecked} rules verified by the AI engine, <span className={report.totalViolations > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>{report.totalViolations} violations</span> were detected.
                  </p>
                  <p className="text-[13px] bg-background/50 p-3 rounded-lg border border-border mt-4">
                    <strong>Legal Context:</strong> The manufacturer, packer, or importer is strictly liable under Rule 32 for the omission of declarations such as MRP, Net Quantity, or Manufacturer Address on the principal display panel. {report.totalViolations > 0 ? "An official notice may be issued." : "No immediate action required."}
                  </p>
                </div>
              </div>
"""

# Insert summary_block right before {/* RULING LEDGER */}
page = page.replace("{/* RULING LEDGER */}", summary_block + "\n              {/* RULING LEDGER */}")

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)

print("Updated grouping and AI summary")
