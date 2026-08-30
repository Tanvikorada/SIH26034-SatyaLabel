import re

with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

tech_pattern = re.compile(r'function TechStack.*?export default function LandingPage', re.DOTALL)

new_tech_stack = """function TechStack() {
  return (
    <section className="py-32 px-6 max-w-[1400px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent overflow-hidden">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-4xl font-medium tracking-tight mb-4">Enterprise Architecture Flow</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">10+ interconnected technologies parallelized for sub-3-second field audits. This is the exact journey of a single scan.</p>
      </div>

      <div className="relative w-full overflow-x-auto pb-10">
        <div className="min-w-[1000px] flex items-center justify-between gap-4">
          
          {/* Stage 1: Edge */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">1. Edge Capture</span>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl hover:border-blue-500/50 transition-colors">
              <h3 className="font-semibold text-[15px] mb-1">Next.js & React</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Edge-rendered UI routing</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl hover:border-blue-500/50 transition-colors">
              <h3 className="font-semibold text-[15px] mb-1">PWA Service Workers</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Offline queuing in warehouses</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-[var(--color-border)] shrink-0 animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 2: Gateway */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">2. Gateway</span>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl hover:border-green-500/50 transition-colors">
              <h3 className="font-semibold text-[15px] mb-1">Node.js & Express</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">API orchestration</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl hover:border-green-500/50 transition-colors">
              <h3 className="font-semibold text-[15px] mb-1">Multer Engine</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Multi-part image processing</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-[var(--color-border)] shrink-0 animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 3: AI Inference */}
          <div className="flex-1 flex flex-col gap-4 relative">
            <div className="absolute -inset-4 bg-purple-500/5 blur-2xl rounded-full z-0" />
            <div className="text-center mb-2 relative z-10">
              <span className="text-[11px] font-bold tracking-widest uppercase text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">3. AI Extraction</span>
            </div>
            <div className="bg-surface/80 border border-purple-500/30 p-4 rounded-xl relative z-10 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <h3 className="font-semibold text-[15px] mb-1 text-purple-400">Llama 3.2 90B Vision</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Multimodal JSON parsing</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl relative z-10">
              <h3 className="font-semibold text-[15px] mb-1">Groq LPU Cloud</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">800+ tokens/sec inference</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl relative z-10">
              <h3 className="font-semibold text-[15px] mb-1">Tesseract.js</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Deterministic spatial mapping</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-[var(--color-border)] shrink-0 animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 4: Logic & Ledger */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-saffron bg-saffron/10 px-3 py-1 rounded-full border border-saffron/30">4. Logic & Ledger</span>
            </div>
            <div className="bg-surface/80 border border-saffron/30 p-4 rounded-xl shadow-[0_0_20px_rgba(255,153,51,0.1)]">
              <h3 className="font-semibold text-[15px] mb-1 text-saffron">Regex Rules Engine</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">2011 Act compliance logic</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl">
              <h3 className="font-semibold text-[15px] mb-1">PostgreSQL</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Immutable penalty ledger</p>
            </div>
            <div className="bg-surface/50 border border-[var(--color-border)] p-4 rounded-xl">
              <h3 className="font-semibold text-[15px] mb-1">PDF-lib</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Official Notice generation</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default function LandingPage"""

page = tech_pattern.sub(new_tech_stack, page)

with open("frontend/app/page.jsx", "w", encoding="utf-8") as f:
    f.write(page)
print("TechStack upgraded to Flow Diagram")
