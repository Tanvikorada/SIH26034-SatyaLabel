const fs = require('fs');
let code = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const injectionPoint = `{/* Raw Ingredients Text */}`;
const newDictionary = `
                    {/* Detailed AI Ingredient Dictionary */}
                    {fields.ingredient_analysis?.ingredient_dictionary && fields.ingredient_analysis.ingredient_dictionary.length > 0 && (
                      <div className="glass rounded-[20px] p-6 mt-6 col-span-full">
                        <h4 className="text-[14px] font-mono tracking-wider text-text-secondary uppercase mb-4 border-b border-border pb-2">AI Ingredient Breakdown</h4>
                        <div className="space-y-4">
                          {fields.ingredient_analysis.ingredient_dictionary.map((ing, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-3 items-start border border-border/50 bg-background/30 rounded-xl p-4 hover:border-text-muted transition-colors">
                               <div className="min-w-[140px] font-medium text-text-primary text-[14px]">{ing.name}</div>
                               <div className="text-[13px] text-text-secondary leading-relaxed">{ing.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Raw Ingredients Text */}`;

if (code.includes(injectionPoint)) {
  code = code.replace(injectionPoint, newDictionary);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', code);
  console.log("INGREDIENT DICTIONARY ADDED TO FRONTEND");
} else {
  console.log("INJECTION POINT NOT FOUND");
}
