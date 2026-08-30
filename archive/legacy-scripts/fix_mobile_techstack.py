import re

with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

# Fix absolute text positioning to be relative flow (mt-2 h-4) to prevent overlap on mobile
page = page.replace(
    """<div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 1 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Sending payload...</div>""",
    """<div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 1 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Sending payload...</div>"""
)
page = page.replace(
    """<div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 2 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Images in buffer...</div>""",
    """<div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 2 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Images in buffer...</div>"""
)
page = page.replace(
    """<div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 3 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Parsing structure...</div>""",
    """<div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 3 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Parsing structure...</div>"""
)
page = page.replace(
    """<div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 4 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Generating PDF...</div>""",
    """<div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 4 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Generating PDF...</div>"""
)

# Add mobile arrows (downward pointing)
arrow_old = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>"""
arrow_new1 = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>"""

page = page.replace(arrow_old, arrow_new1)

arrow_old2 = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>"""
arrow_new2 = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>"""
page = page.replace(arrow_old2, arrow_new2)

arrow_old3 = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>"""
arrow_new3 = """{/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>"""
page = page.replace(arrow_old3, arrow_new3)

with open("frontend/app/page.jsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Mobile TechStack fixed")
