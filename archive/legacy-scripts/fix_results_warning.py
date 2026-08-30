import re

with open("frontend/app/results/[id]/page.jsx", "r", encoding="utf-8") as f:
    js = f.read()

banner_old = """        {/* CONTENT */}
        {report && (
          <div className="animate-fade-in mt-6 max-w-5xl mx-auto space-y-6">"""

banner_new = """        {/* CONTENT */}
        {report && (
          <div className="animate-fade-in mt-6 max-w-5xl mx-auto space-y-6">
            
            {report.extracted_fields?._quality_warning && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
                <div className="text-amber-500 mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-amber-500">Image Quality / Obstruction Warning</h3>
                  <p className="text-[14px] text-amber-500/80 mt-1">{report.extracted_fields._quality_warning}</p>
                </div>
              </div>
            )}"""

js = js.replace(banner_old, banner_new)

with open("frontend/app/results/[id]/page.jsx", "w", encoding="utf-8") as f:
    f.write(js)
print("Added quality warning banner to Results UI")
