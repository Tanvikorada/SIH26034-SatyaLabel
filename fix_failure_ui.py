import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the simple loading state with a better one
loading_ui = r'''  if (loading) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading report...</div></div>;'''
new_loading_ui = r'''  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-32">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-[var(--color-primary)] animate-spin"></div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-[20px] font-medium tracking-tight">Analyzing Label...</h2>
            <p className="text-[14px] text-text-secondary font-mono">Running OCR and Legal Metrology Rules Engine</p>
          </div>
        </div>
      </div>
    );
  }'''
text = text.replace(loading_ui, new_loading_ui)

# Add failure UI right after loading check
failure_ui = r'''  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-6 pb-32">
          <div className="mello-card p-8 max-w-md w-full flex flex-col items-center text-center gap-4 border-red-900/50">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 className="text-[22px] font-medium text-red-500">Scan Failed</h2>
            <p className="text-[14px] text-text-secondary mb-4">{report.errorMessage || report.error_message || "The AI engine could not extract text from this image."}</p>
            <button onClick={() => router.push('/upload')} className="mello-btn-secondary w-full">Try Another Image</button>
          </div>
        </div>
      </div>
    );
  }'''

# Insert failure UI after `if (!report) return ...`
not_found_ui = r'''  if (!report) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-red-500">Not found</div></div>;'''
text = text.replace(not_found_ui, not_found_ui + '\n\n' + failure_ui)

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
