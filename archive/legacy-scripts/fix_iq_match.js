const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const startStr = `{/* TAB 1.5: INGREDIENTS IQ PREMIUM */}`;
const endStr = `{/* TAB 2: EVIDENCE */}`;

const startIdx = fe.indexOf(startStr);
const endIdx = fe.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newTab = `{/* TAB 1.5: INGREDIENTS IQ */}\n          {activeTab === 'ingredients' && (
            <div className="animate-fade-in space-y-6">
              
              <div className="mb-6">
                <h3 className="text-[20px] font-medium text-text-primary mb-1">Ingredient Analysis</h3>
                <p className="text-[14px] text-text-secondary">AI-powered biochemical breakdown and safety profiling.</p>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="glass rounded-[20px] p-12 text-center text-text-secondary">
                  No ingredient data was detected on this packaging.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Health Profile (2/3 width on desktop) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Clean Label Card */}
                    <div className={\`glass rounded-[20px] p-6 border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 \${fields.ingredient_analysis?.is_clean_label ? 'border-l-green-500' : 'border-l-amber-500'}\`}>
                      <div className="flex items-center gap-4">
                        <div className={\`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold bg-background/50 border \${fields.ingredient_analysis?.is_clean_label ? 'text-green-500 border-green-500/20' : 'text-amber-500 border-amber-500/20'}\`}>
                          {fields.ingredient_analysis?.is_clean_label ? 'A' : 'C'}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-medium text-text-primary mb-0.5">
                            {fields.ingredient_analysis?.is_clean_label ? 'Clean Label Certified' : 'Contains Artificial Additives'}
                          </h4>
                          <p className="text-[13px] text-text-secondary">
                            {fields.ingredient_analysis?.is_clean_label ? 'No synthetic chemicals or artificial preservatives detected.' : 'The AI detected synthetic or ultra-processed ingredients in this product.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chemical Flags */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[14px] font-bold tracking-widest uppercase text-text-primary mb-4">Chemical Flags</h4>
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[13px] font-medium">
                              {add}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No harmful E-numbers or restricted additives detected.</div>
                      )}
                    </div>

                    {/* Health Risks */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[14px] font-bold tracking-widest uppercase text-text-primary mb-4">Health Risks</h4>
                      {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                        <div className="space-y-3">
                          {fields.ingredient_analysis.health_risks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 bg-background/40 p-3 rounded-xl border border-border/50">
                              <span className="text-amber-500 mt-0.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                              </span>
                              <span className="text-[14px] text-text-primary leading-relaxed">{risk}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No immediate systemic health risks identified by the AI.</div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Allergens & Raw Text (1/3 width on desktop) */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Allergens */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[14px] font-bold tracking-widest uppercase text-text-primary mb-4">Allergens</h4>
                      {fields.ingredient_analysis?.allergen_warnings?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.allergen_warnings.map((allergen, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[13px] font-medium">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No common allergens declared.</div>
                      )}
                    </div>

                    {/* Raw Ingredients Text */}
                    <div className="glass rounded-[20px] p-6 border border-border h-full min-h-[300px]">
                      <h4 className="text-[14px] font-bold tracking-widest uppercase text-text-primary mb-4">Raw Ingredient Text</h4>
                      <div className="text-[13px] text-text-secondary leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50">
                        {fields.ingredients ? fields.ingredients : "Raw ingredients text unavailable."}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}\n\n          `;
          
  fe = fe.substring(0, startIdx) + newTab + fe.substring(endIdx);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("INGREDIENT UI MATCHED TO APP");
} else {
  console.log("NOT FOUND");
}
