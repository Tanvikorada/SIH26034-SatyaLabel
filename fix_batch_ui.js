const fs = require('fs');
let js = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const target = `{scan.product_name || 'Unknown Product'}
                      </h3>`;
const replacement = `{scan.product_name || 'Unknown Product'}
                        {scan.extracted_fields?.is_wholesale_or_multipiece_package && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 align-middle uppercase tracking-wider">
                            Wholesale
                          </span>
                        )}
                        {scan.extracted_fields?._quality_warning && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 align-middle uppercase tracking-wider">
                            ⚠️ Poor Quality
                          </span>
                        )}
                      </h3>`;

js = js.replace(target, replacement);
fs.writeFileSync('frontend/app/batch/[id]/page.jsx', js);
console.log("UI fixed");
