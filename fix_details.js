const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const oldSummaryRegex = /\{\(report\.violations \|\| \[\]\)\.filter\(v => v\.status \!\=\= 'PASS'\)\.map\(\(v, i\) => \([\s\S]*?\{\(report\.violations \|\| \[\]\)\.filter\(v => v\.status \!\=\= 'PASS'\)\.length \=\=\= 0 && \([\s\S]*?\)\}/;

const newSummary = `{(report.violations || []).map((v, i) => {
              const isPass = v.status === 'PASS';
              const isNA = v.status === 'NOT APPLICABLE';
              if (isPass || isNA) {
                return (
                  <div key={i} className="glass rounded-[16px] p-4 border-l-4 border-l-green-500 opacity-70">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 font-mono text-[11px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[15px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-green-600 tracking-widest uppercase">{v.status}</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="glass rounded-[16px] p-6 border-l-4 border-l-red-500">
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
              );
            })}`;

if (fe.match(oldSummaryRegex)) {
  fe = fe.replace(oldSummaryRegex, newSummary);
}

const dataEndRegex = /<\/div>\s*<\/div>\s*\)\}\s*<\/main>/;
const newData = `</div>
             <div className="mt-8 glass rounded-[16px] p-6">
               <h3 className="text-[16px] font-medium text-text-primary mb-4">Raw OCR Extraction Log</h3>
               <div className="bg-black/5 border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                 {report.ocr_raw_text || report.ocrRawText || 'No raw text available.'}
               </div>
             </div>
          </div>
        )}

      </main>`;

if (fe.match(dataEndRegex)) {
  fe = fe.replace(dataEndRegex, newData);
}

fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
console.log("DETAILS RESTORED!");
