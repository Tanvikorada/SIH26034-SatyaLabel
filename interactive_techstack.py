import re

with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

tech_pattern = re.compile(r'function TechStack.*?export default function LandingPage', re.DOTALL)

new_tech_stack = """function TechStack() {
  const [activeStage, setActiveStage] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStage(prev => prev >= 4 ? 1 : prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className="py-32 px-6 max-w-[1400px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent overflow-hidden">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-4xl font-medium tracking-tight mb-4">Enterprise Architecture Flow</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">10+ interconnected technologies parallelized for sub-3-second field audits. This is the exact journey of a single scan.</p>
      </div>

      <div 
        className="relative w-full overflow-x-auto pb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="min-w-[1000px] flex items-center justify-between gap-4">
          
          {/* Stage 1: Edge */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-2 rounded-2xl ${activeStage === 1 ? 'scale-105 z-20' : 'opacity-50 scale-95 z-0'}`}
            onMouseEnter={() => setActiveStage(1)}
          >
            {activeStage === 1 && <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 1 ? 'text-blue-400 border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-blue-500/50 border-blue-500/30 bg-blue-500/5'}`}>1. Edge Capture</span>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 1 ? 'border-blue-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Next.js & React</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Edge-rendered UI routing</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 1 ? 'border-blue-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">PWA Service Workers</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Offline queuing in warehouses</p>
            </div>
            {activeStage === 1 && <div className="absolute -bottom-8 left-0 right-0 text-center text-[11px] text-blue-400 font-mono animate-fade-in">Sending multipart/form-data...</div>}
          </div>

          {/* Arrow */}
          <div className={`shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-blue-400 animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 2: Gateway */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-2 rounded-2xl ${activeStage === 2 ? 'scale-105 z-20' : 'opacity-50 scale-95 z-0'}`}
            onMouseEnter={() => setActiveStage(2)}
          >
            {activeStage === 2 && <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 2 ? 'text-green-400 border-green-400 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'text-green-500/50 border-green-500/30 bg-green-500/5'}`}>2. Gateway</span>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 2 ? 'border-green-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Node.js & Express</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">API orchestration</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 2 ? 'border-green-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Multer Engine</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Multi-part image processing</p>
            </div>
            {activeStage === 2 && <div className="absolute -bottom-8 left-0 right-0 text-center text-[11px] text-green-400 font-mono animate-fade-in">Images stitched to buffer...</div>}
          </div>

          {/* Arrow */}
          <div className={`shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-green-400 animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 3: AI Inference */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-2 rounded-2xl ${activeStage === 3 ? 'scale-105 z-20' : 'opacity-50 scale-95 z-0'}`}
            onMouseEnter={() => setActiveStage(3)}
          >
            {activeStage === 3 && <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 3 ? 'text-purple-400 border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-purple-500/50 border-purple-500/30 bg-purple-500/5'}`}>3. AI Extraction</span>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 3 ? 'border-purple-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Llama 3.2 90B Vision</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Multimodal JSON parsing</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 3 ? 'border-purple-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Groq LPU Cloud</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">800+ tokens/sec inference</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 3 ? 'border-purple-400' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Tesseract.js</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Deterministic spatial mapping</p>
            </div>
            {activeStage === 3 && <div className="absolute -bottom-8 left-0 right-0 text-center text-[11px] text-purple-400 font-mono animate-fade-in">Parsed structured JSON...</div>}
          </div>

          {/* Arrow */}
          <div className={`shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-purple-400 animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 4: Logic & Ledger */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-2 rounded-2xl ${activeStage === 4 ? 'scale-105 z-20' : 'opacity-50 scale-95 z-0'}`}
            onMouseEnter={() => setActiveStage(4)}
          >
            {activeStage === 4 && <div className="absolute inset-0 bg-saffron/10 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 4 ? 'text-saffron border-saffron bg-saffron/20 shadow-[0_0_15px_rgba(255,153,51,0.3)]' : 'text-saffron/50 border-saffron/30 bg-saffron/5'}`}>4. Logic & Ledger</span>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 4 ? 'border-saffron' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">Regex Rules Engine</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">2011 Act compliance logic</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 4 ? 'border-saffron' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">PostgreSQL</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Immutable penalty ledger</p>
            </div>
            <div className={`bg-surface/80 border p-4 rounded-xl transition-colors ${activeStage === 4 ? 'border-saffron' : 'border-[var(--color-border)]'}`}>
              <h3 className="font-semibold text-[15px] mb-1">PDF-lib</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Official Notice generation</p>
            </div>
            {activeStage === 4 && <div className="absolute -bottom-8 left-0 right-0 text-center text-[11px] text-saffron font-mono animate-fade-in">Penalty PDF Generated.</div>}
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
print("TechStack upgraded with full interactivity")
