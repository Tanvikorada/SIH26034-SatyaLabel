import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

old_extracted = """            <div className="flex flex-col gap-6">
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
            </div>"""

new_extracted = """            <div className="flex flex-col gap-6">
               <h3 className="text-2xl font-medium tracking-tight">Mandatory Declarations</h3>
               
               <div className="flex flex-col gap-4">
                 {(() => {
                   const fields = report.extractedFields || report.extracted_fields || {};
                   
                   // Core Legal Metrology Fields
                   const groups = {
                     'Identity': ['manufacturer_name', 'manufacturer_address', 'common_name', 'product_name', 'brand_name'],
                     'Quantity & Price': ['net_quantity', 'net_quantity_unit', 'mrp', 'mrp_includes_tax_statement'],
                     'Dates': ['mfg_date', 'import_date'],
                     'Consumer Support': ['consumer_care_details', 'customer_care']
                   };

                   // Extended Data Cards
                   const extendedCardKeys = [
                     { k: 'ingredients', icon: '🍲', label: 'Ingredients List' },
                     { k: 'nutrition', icon: '📊', label: 'Nutritional Info' },
                     { k: 'fssai_license', icon: '🛡️', label: 'FSSAI License' },
                     { k: 'batch_lot_number', icon: '📦', label: 'Batch / Lot Number' },
                     { k: 'best_before', icon: '⏳', label: 'Best Before / Expiry' },
                     { k: 'country_of_origin', icon: '🌍', label: 'Country of Origin' },
                     { k: 'veg_nonveg', icon: '🥬', label: 'Veg / Non-Veg' },
                     { k: 'allergens_or_warnings', icon: '⚠️', label: 'Allergens & Warnings' }
                   ];

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
                   
                   const assignedKeys = [...Object.values(groups).flat(), ...extendedCardKeys.map(e => e.k)];
                   const unassignedKeys = Object.keys(fields).filter(k => !assignedKeys.includes(k) && !k.startsWith('_'));
                   if (unassignedKeys.length > 0) {
                     renderedGroups.push(renderGroup('Other Data', unassignedKeys));
                   }

                   // Render Extended Cards
                   const extendedCardsToRender = extendedCardKeys
                     .map(ext => ({ ...ext, v: fields[ext.k] }))
                     .filter(ext => ext.v !== undefined && ext.v !== null && ext.v !== '');

                   return (
                     <>
                       {renderedGroups.length > 0 ? renderedGroups : <div className="mello-card p-5 text-text-muted text-sm text-center">No structured data extracted.</div>}
                       
                       {extendedCardsToRender.length > 0 && (
                         <div className="mt-6 pt-6 border-t border-border">
                           <h3 className="text-xl font-medium tracking-tight mb-4">Product Attributes</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {extendedCardsToRender.map((ext, i) => (
                               <div key={i} className="mello-card p-5 flex flex-col hover:border-[var(--color-primary)] transition-colors">
                                 <div className="flex items-center gap-2 mb-3">
                                   <span className="text-[16px]">{ext.icon}</span>
                                   <span className="text-[12px] font-bold tracking-widest uppercase text-text-muted">{ext.label}</span>
                                 </div>
                                 <div className="text-[14px] font-medium text-text-primary leading-relaxed break-words">
                                   {String(ext.v)}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>
            </div>"""

page = page.replace(old_extracted, new_extracted)

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated results page to show extended fields as cards")
