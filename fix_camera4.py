import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

old_dropzone = """                  <>
                     <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center mb-3">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                     </div>
                     <span className="text-[14px] text-text-secondary font-medium">Click or drag image to upload</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>"""

new_dropzone = """                  <div className="flex flex-col items-center gap-4 relative z-10 w-full">
                     <span className="text-[14px] text-text-secondary font-medium mb-2">Upload a Product Label</span>
                     <div className="flex gap-4 w-full justify-center px-4">
                       
                       {/* Camera Button */}
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Take Photo</span>
                         <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                       {/* Gallery Button */}
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Gallery</span>
                         <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                     </div>
                  </div>
                )}
              </div>"""

page = page.replace(old_dropzone, new_dropzone)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated dropzone UI")
