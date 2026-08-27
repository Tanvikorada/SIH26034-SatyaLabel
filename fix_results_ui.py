import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    ui = f.read()

new_ui = """
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-tight">Compliance Ledger</h3>
                <div className="text-[12px] font-mono text-text-muted">Legal Metrology Rules, 2011</div>
              </div>

              {/* RULING LEDGER */}
              <div className="border border-border rounded-2xl overflow-hidden shadow-lg bg-surface/30 relative">
                <div className="flex flex-col p-2 gap-2">
                  {(() => {
                    const checks = report.violations || [];
                    const fails = checks.filter(c => c.status === 'POTENTIAL NON-COMPLIANCE' || c.status === 'fail' || c.status === 'estimated_fail');
                    const reviews = checks.filter(c => c.status === 'MANUAL REVIEW' || c.status === 'needs_review');
                    const passes = checks.filter(c => c.status === 'PASS' || c.status === 'pass');
                    const sortedChecks = [...fails, ...reviews, ...passes];

                    if (sortedChecks.length === 0) return <div className="p-8 text-center text-text-muted">No rules checked.</div>;

                    return sortedChecks.map((v, i) => {
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
                        <div key={i} className="flex flex-col p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                              <div className="flex flex-col">
                                <span className="font-mono text-[11px] tracking-wider text-text-muted mb-0.5">{v.rule_id}</span>
                                <span className="font-medium text-[15px] text-text-primary leading-tight">{v.rule_title}</span>
                              </div>
                            </div>
                            <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                              {v.status.replace('POTENTIAL NON-COMPLIANCE', 'FAIL')}
                            </div>
                          </div>
                          
                          {/* Expanded Detail */}
                          {expandedRule === i && (
                            <div className="mt-4 pt-4 border-t border-border/50 text-[14px] text-text-secondary leading-relaxed font-mono">
                              {v.detail || v.detail_text || "No official finding detailed."}
                            </div>
                          )}
                        </div>
                      )
                    });
                  })()}
                </div>
              </div>
              
              <div className="mello-card p-6 mt-2">
                <h3 className="text-[15px] font-medium mb-4">Raw Extraction Log</h3>
                <div className="bg-background border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {report.ocr_raw_text || report.ocrRawText || 'No raw text available.'}
                </div>
              </div>
            </div>
  
            <div className="flex flex-col gap-6">
               <h3 className="text-2xl font-medium tracking-tight">Extracted Data</h3>
               
               <div className="flex flex-col gap-4">
                 {(() => {
                   const fields = report.extractedFields || report.extracted_fields || {};
                   
                   const groups = {
                     'Identity': ['manufacturer_name', 'manufacturer_address', 'common_name', 'product_name', 'brand_name', 'country_of_origin'],
                     'Quantity & Price': ['net_quantity', 'net_quantity_unit', 'mrp', 'mrp_includes_tax_statement'],
                     'Dates': ['mfg_date', 'best_before', 'import_date'],
                     'Consumer Support': ['consumer_care_details', 'customer_care']
                   };

                   const renderGroup = (title, keys) => {
                     const groupFields = keys.map(k => ({ k, v: fields[k] })).filter(f => f.v !== undefined && f.v !== null && f.v !== '');
                     if (groupFields.length === 0) return null;
                     
                     return (
                       <div key={title} className="mello-card p-5">
                         <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-4 pb-2 border-b border-border">{title}</h4>
                         <div className="flex flex-col">
                           {groupFields.map(({k, v}) => (
                             <div key={k} className="py-2.5 flex flex-col gap-1 border-b border-border/50 last:border-0 last:pb-0">
                               <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{k.replace(/_/g, ' ')}</span>
                               <span className="text-[14px] font-medium text-text-primary break-words leading-tight">{String(v)}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   };

                   const renderedGroups = Object.entries(groups).map(([title, keys]) => renderGroup(title, keys)).filter(Boolean);
                   
                   // Render unassigned fields
                   const assignedKeys = Object.values(groups).flat();
                   const unassignedKeys = Object.keys(fields).filter(k => !assignedKeys.includes(k) && !k.startsWith('_'));
                   if (unassignedKeys.length > 0) {
                     renderedGroups.push(renderGroup('Other Data', unassignedKeys));
                   }
                   
                   if (renderedGroups.length === 0) {
                     return <div className="mello-card p-5 text-text-muted text-sm text-center">No structured data extracted.</div>;
                   }

                   return renderedGroups;
                 })()}
               </div>

               <div className="mt-2 flex flex-col gap-3">
                 <button onClick={downloadPDF} className="mello-btn-primary w-full shadow-lg">Download Official Notice PDF</button>
                 {localStorage.getItem('role') === 'admin' && (
                    <button onClick={handleDelete} className="mello-btn-secondary w-full text-red-500 border-red-900/30 hover:bg-red-500/10">Delete Record</button>
                 )}
               </div>
            </div>
          </div>
"""

# Replace the whole <div className="grid ..."> block
start_idx = ui.find('<div className="grid grid-cols-1')
end_idx = ui.find('</div>\n      </div>\n    );\n  }')

if start_idx != -1 and end_idx != -1:
    ui = ui[:start_idx] + new_ui + '\n        ' + ui[end_idx:]
    with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
        f.write(ui)
