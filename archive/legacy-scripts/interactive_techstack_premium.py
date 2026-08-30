import re

with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

# Make sure Zap, Upload, ScanLine, Scale, ArrowRight are in the lucide-react import if not already
if "Zap" not in page:
    page = page.replace("Code, Scan", "Code, Scan, Zap, Upload, ScanLine, Scale, ArrowRight")

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
    <section className="py-32 px-6 max-w-[1400px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-4xl font-medium tracking-tight mb-4">Enterprise Architecture Flow</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">10+ interconnected technologies parallelized for sub-3-second field audits. This is the exact journey of a single scan.</p>
      </div>

      {/* Added pb-16 to prevent scrollbars from the terminal text, and removed overflow-x-auto to prevent clipping/scrollbars */}
      <div 
        className="relative w-full pb-16 flex justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full max-w-[1100px] flex items-stretch justify-between gap-2 md:gap-4 flex-col md:flex-row">
          
          {/* Stage 1: Edge */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 1 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(1)}
          >
            {activeStage === 1 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 1 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>1. Edge Capture</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 1 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><SiNextdotjs size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Next.js & React</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Edge-rendered UI routing</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 1 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Monitor size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">PWA Services</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Offline queuing in warehouses</p>
              </div>
            </div>
            
            <div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 1 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Sending payload...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 2: Gateway */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 2 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(2)}
          >
            {activeStage === 2 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 2 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>2. Gateway</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 2 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Server size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Node.js API</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Backend orchestration</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 2 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><FileText size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Multer Engine</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Multi-part image processing</p>
              </div>
            </div>

            <div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 2 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Images in buffer...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 3: AI Inference */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 3 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(3)}
          >
            {activeStage === 3 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 3 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>3. AI Extraction</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 3 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Cpu size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Llama 90B Vision</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Multimodal JSON parsing</p>
              </div>
            </div>

            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 3 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Scan size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Tesseract.js</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Deterministic spatial mapping</p>
              </div>
            </div>

            <div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 3 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Parsing structure...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>

          {/* Stage 4: Logic & Ledger */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 4 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(4)}
          >
            {activeStage === 4 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 4 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>4. Logic & Ledger</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 4 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 4 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Code size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Regex Rules Engine</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">2011 Act compliance logic</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 4 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 4 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><SiPostgresql size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">PostgreSQL</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Immutable penalty ledger</p>
              </div>
            </div>
            
            <div className={`absolute -bottom-8 left-0 right-0 text-center text-[11px] font-mono transition-opacity duration-300 ${activeStage === 4 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Generating PDF...</div>
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
print("TechStack upgraded with premium colors, logos, and fixed scrollbars")
