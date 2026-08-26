import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'function TechStack\(\).*?return.*?\}'
replacement = """function TechStack() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">System Architecture</h2>
        <p className="text-[var(--color-text-secondary)]">Built entirely on free-tier infrastructure.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-12 w-full max-w-[1000px] mx-auto">
        
        {/* Zone 1: Frontend */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Frontend</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Next.js Framework">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiNextdotjs size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Next.js</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="React">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiReact size={18} className="text-[#61DAFB]" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">React</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Tailwind CSS">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiTailwindcss size={18} className="text-[#06B6D4]" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Tailwind</span>
            </div>
          </div>
          
          {/* Connector Beam Right */}
          <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-px bg-[var(--color-border)]">
             <motion.div className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%', x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </div>
        </div>

        {/* Zone 2: Backend & DB */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Backend & DB</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Express.js Server">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Server size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Express</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="PostgreSQL Database">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiPostgresql size={18} className="text-[#4169E1]" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Postgres</span>
            </div>
          </div>
          
          {/* Connector Beam Right */}
          <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-px bg-[var(--color-border)]">
             <motion.div className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%', x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }} />
          </div>
        </div>

        {/* Zone 3: AI & Extraction */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">AI & Extraction</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Tesseract OCR">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><FileSearch size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Tesseract</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Gemini 1.5 Vision">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiGoogle size={18} className="text-[#4285F4]" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Gemini</span>
            </div>
          </div>
          
          {/* Connector Beam Right */}
          <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-px bg-[var(--color-border)]">
             <motion.div className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%', x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 1.0 }} />
          </div>
        </div>
        
        {/* Zone 4: Deployment */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Deployment</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Vercel Hosting">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiVercel size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Vercel</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="GitHub Repo">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiGithub size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">GitHub</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Render API">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><SiRender size={18} className="text-text-primary" /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Render</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)
with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
