const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const oldRegex = /<h3 className="text-\[18px\] font-medium text-text-primary mb-6">Legal Metrology Violations<\/h3>[\s\S]*?\{\(report\.violations \|\| \[\]\)\.map\(\(v, i\) => \{[\s\S]*?\}\)\}/;

const newSection = `<h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>
            
            {/* FAILED RULES SECTION */}
            <div className="mb-8">
              <h4 className="text-[14px] font-bold tracking-widest uppercase text-red-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Violations & Warnings
              </h4>
              <div className="space-y-4">
                {(report.violations || []).filter(v => v.status !== 'PASS' && v.status !== 'NOT APPLICABLE').map((v, i) => (
                  <div key={'fail-'+i} className="glass rounded-[16px] p-6 border-l-4 border-l-red-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 font-mono text-[11px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[16px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-red-500 tracking-widest uppercase">{v.status}</span>
                    </div>
                    <p className="text-[14px] text-text-secondary leading-relaxed font-mono">
                      {v.detail || v.detail_text}
                    </p>
                  </div>
                ))}
                {(report.violations || []).filter(v => v.status !== 'PASS' && v.status !== 'NOT APPLICABLE').length === 0 && (
                  <div className="text-[14px] text-text-muted italic px-2">No violations found. Product is fully compliant.</div>
                )}
              </div>
            </div>

            {/* PASSED RULES SECTION */}
            <div>
              <h4 className="text-[14px] font-bold tracking-widest uppercase text-green-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Compliant Checks
              </h4>
              <div className="space-y-3">
                {(report.violations || []).filter(v => v.status === 'PASS' || v.status === 'NOT APPLICABLE').map((v, i) => (
                  <div key={'pass-'+i} className="glass rounded-[12px] p-3 border-l-2 border-l-green-500 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 font-mono text-[10px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[14px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>`;

if (fe.match(oldRegex)) {
  fe = fe.replace(oldRegex, newSection);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("SUMMARY SORTED");
} else {
  console.log("REGEX FAILED");
}
