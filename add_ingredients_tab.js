const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// 1. Update Tabs
const oldTabs = `['summary', 'evidence', 'data']`;
const newTabs = `['summary', 'ingredients', 'evidence', 'data']`;
fe = fe.replace(oldTabs, newTabs);

// 2. Insert new Tab Content before TAB 2 (Evidence)
const oldEvidenceTab = `{/* TAB 2: EVIDENCE */}`;
const newIngredientsTab = `{/* TAB 1.5: INGREDIENTS IQ */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-text-primary">Ingredient IQ</h3>
                  <p className="text-[13px] text-text-secondary">AI Health & Safety Chemical Analysis</p>
                </div>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="glass rounded-[16px] p-12 text-center text-text-secondary">
                  No ingredients list detected on this package.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Col: The Raw Ingredients */}
                  <div className="glass rounded-[16px] p-6 border border-border">
                     <h4 className="text-[12px] font-bold tracking-widest uppercase text-text-muted mb-4">Declared Ingredients</h4>
                     <p className="text-[14px] text-text-primary leading-relaxed">
                       {fields.ingredients || "Raw text not available."}
                     </p>
                  </div>

                  {/* Right Col: AI Analysis */}
                  <div className="space-y-4">
                    {/* Clean Label Card */}
                    <div className={\`glass rounded-[16px] p-5 border-l-4 \${fields.ingredient_analysis?.is_clean_label ? 'border-l-green-500 bg-green-500/5' : 'border-l-amber-500 bg-amber-500/5'}\`}>
                      <h4 className="text-[12px] font-bold tracking-widest uppercase text-text-muted mb-1">Clean Label Status</h4>
                      <p className={\`text-[16px] font-medium \${fields.ingredient_analysis?.is_clean_label ? 'text-green-500' : 'text-amber-500'}\`}>
                        {fields.ingredient_analysis?.is_clean_label ? ' Certified Clean Label' : ' Contains Artificial Additives'}
                      </p>
                    </div>

                    {/* Harmful Additives */}
                    <div className="glass rounded-[16px] p-5 border border-border">
                      <h4 className="text-[12px] font-bold tracking-widest uppercase text-text-muted mb-3 flex items-center gap-2">
                        <span className="text-red-500"></span> Flagged Chemicals
                      </h4>
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[13px] font-medium">
                              {add}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-green-500">No harmful E-numbers or chemicals detected.</div>
                      )}
                    </div>

                    {/* Health Risks */}
                    <div className="glass rounded-[16px] p-5 border border-border">
                      <h4 className="text-[12px] font-bold tracking-widest uppercase text-text-muted mb-3">Health Risks</h4>
                      {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                        <ul className="space-y-2">
                          {fields.ingredient_analysis.health_risks.map((risk, i) => (
                            <li key={i} className="text-[13px] text-amber-500 flex items-start gap-2">
                              <span className="mt-0.5">•</span> <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No immediate health risks identified.</div>
                      )}
                    </div>

                    {/* Allergens */}
                    {fields.ingredient_analysis?.allergen_warnings?.length > 0 && (
                      <div className="glass rounded-[16px] p-5 border border-border bg-blue-500/5 border-l-4 border-l-blue-500">
                        <h4 className="text-[12px] font-bold tracking-widest uppercase text-blue-400 mb-2">Allergens Detected</h4>
                        <div className="text-[14px] text-text-primary">
                          {fields.ingredient_analysis.allergen_warnings.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVIDENCE */}`;

fe = fe.replace(oldEvidenceTab, newIngredientsTab);

fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
console.log("INGREDIENT IQ ADDED");
