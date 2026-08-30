const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const oldTab = `{/* TAB 1.5: INGREDIENTS IQ */}
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
          )}`;

const newTab = `{/* TAB 1.5: INGREDIENTS IQ PREMIUM */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h3 className="text-[22px] font-medium tracking-tight text-text-primary mb-1">Clinical Ingredient Analysis</h3>
                <p className="text-[14px] text-text-secondary">AI-powered biochemical breakdown and safety profiling.</p>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="border border-border/50 border-dashed rounded-[2px] p-12 text-center text-text-muted uppercase tracking-widest text-[12px] font-mono">
                  [ No Ingredient Data Detected ]
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  
                  {/* Top Dashboard: Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score / Clean Label */}
                    <div className="col-span-1 border border-border/50 bg-[#050505] p-6 rounded-[4px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4">Purity Index</div>
                      
                      <div className="flex items-center gap-4">
                        <div className={\`w-16 h-16 rounded-full border-4 flex items-center justify-center text-[22px] font-medium \${fields.ingredient_analysis?.is_clean_label ? 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}\`}>
                          {fields.ingredient_analysis?.is_clean_label ? 'A+' : 'C-'}
                        </div>
                        <div>
                          <div className={\`text-[16px] font-medium mb-1 \${fields.ingredient_analysis?.is_clean_label ? 'text-green-400' : 'text-amber-400'}\`}>
                            {fields.ingredient_analysis?.is_clean_label ? 'Clean Label' : 'Additives Present'}
                          </div>
                          <div className="text-[12px] text-text-secondary leading-tight">
                            {fields.ingredient_analysis?.is_clean_label ? 'No synthetic chemicals or artificial preservatives detected.' : 'Contains synthetic or ultra-processed ingredients.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chemical Flags */}
                    <div className="col-span-1 md:col-span-2 border border-border/50 bg-black/20 p-6 rounded-[4px]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase">Chemical Flags</div>
                        <div className="text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm">High Priority</div>
                      </div>
                      
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <div key={i} className="flex items-center gap-2 border border-red-500/30 bg-[#0A0000] px-3 py-2 rounded-[2px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="text-[13px] font-mono text-red-400">{add}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span className="text-[14px] text-text-secondary">No harmful E-numbers or restricted additives detected.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Analysis Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                    
                    {/* Left: Health Risks & Allergens */}
                    <div className="space-y-8">
                      {/* Health Risks */}
                      <div>
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4 pb-2 border-b border-border/50">Epidemiological Risks</div>
                        {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                          <div className="space-y-3">
                            {fields.ingredient_analysis.health_risks.map((risk, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className="text-amber-500 font-mono text-[10px] mt-1.5">[{String(i+1).padStart(2, '0')}]</span>
                                <span className="text-[14px] text-text-primary leading-relaxed">{risk}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[13px] text-text-secondary italic">No immediate systemic health risks identified.</div>
                        )}
                      </div>

                      {/* Allergens */}
                      <div>
                        <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4 pb-2 border-b border-border/50">Identified Allergens</div>
                        {fields.ingredient_analysis?.allergen_warnings?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {fields.ingredient_analysis.allergen_warnings.map((allergen, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[12px] font-medium tracking-wide">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[13px] text-text-secondary italic">None declared.</div>
                        )}
                      </div>
                    </div>

                    {/* Right: The Raw Data Log */}
                    <div className="bg-[#020205] border border-border/50 p-6 rounded-[2px] relative">
                      <div className="absolute top-0 right-0 p-4 opacity-30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M2 15h10"></path><path d="M9 18l3-3-3-3"></path></svg>
                      </div>
                      <div className="text-[11px] font-mono tracking-widest text-text-muted uppercase mb-4">Raw Ingredient Manifest</div>
                      <div className="text-[13px] font-mono text-text-secondary leading-loose max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {fields.ingredients ? fields.ingredients.split(',').map((ing, i) => (
                          <div key={i} className="flex gap-4 border-b border-border/30 pb-2 mb-2 last:border-0 hover:bg-white/5 p-1 transition-colors">
                            <span className="text-accent opacity-50">{String(i+1).padStart(2, '0')}</span>
                            <span className="text-text-primary capitalize">{ing.trim()}</span>
                          </div>
                        )) : "Manifest unavailable."}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}`;

let changed = false;
if (fe.indexOf("TAB 1.5: INGREDIENTS IQ") !== -1) {
  // Use exact index replacement
  const startIndex = fe.indexOf("{/* TAB 1.5: INGREDIENTS IQ */}");
  const endIndex = fe.indexOf("{/* TAB 2: EVIDENCE */}");
  if (startIndex !== -1 && endIndex !== -1) {
    fe = fe.substring(0, startIndex) + newTab + '\n\n          ' + fe.substring(endIndex);
    fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
    console.log("REPLACED USING INDEX");
    changed = true;
  }
}

if (!changed) {
  console.log("FAILED TO REPLACE");
}
