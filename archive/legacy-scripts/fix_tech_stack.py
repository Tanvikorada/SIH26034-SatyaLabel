import re

with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

# Replace TechNode and TechStack
tech_pattern = re.compile(r'function TechNode.*?function TechStack.*?\n  }\n', re.DOTALL)

new_tech_stack = """
function TechStack() {
  const [activeTech, setActiveTech] = useState(null);

  const stack = [
    { id: 'next', name: 'Next.js & React', role: 'Frontend & Routing', type: 'edge', col: 'col-span-1 md:col-span-2', desc: 'Edge-rendered UI using the App Router for zero-latency client interactions.' },
    { id: 'pwa', name: 'PWA Service Workers', role: 'Offline Queuing', type: 'edge', col: 'col-span-1 md:col-span-2', desc: 'Intercepts network requests to locally queue scans when deep inside warehouses without 4G/5G.' },
    { id: 'node', name: 'Node.js & Express', role: 'API Gateway', type: 'core', col: 'col-span-2 md:col-span-2', desc: 'High-throughput backend orchestrating the dual-OCR pipelines.' },
    { id: 'tesseract', name: 'Tesseract.js', role: 'Deterministic Spatial OCR', type: 'ai', col: 'col-span-1 md:col-span-3', desc: 'Maps the physical X/Y bounding boxes of every character to enforce Rule 7 (Font Size) deterministically.' },
    { id: 'groq', name: 'Groq Cloud LPU', role: 'Inference Engine', type: 'ai', col: 'col-span-1 md:col-span-3', desc: 'Runs inference at 800+ tokens per second, ensuring the entire scan completes in under 3 seconds.' },
    { id: 'llama', name: 'Llama 3.2 90B Vision', role: 'Multimodal Extraction', type: 'ai', col: 'col-span-2 md:col-span-6', desc: 'Massive 90-Billion parameter flagship model running at Temp 0.0 to parse complex curved label layouts into strict JSON without hallucinations.' },
    { id: 'regex', name: 'Regex Rules Engine', role: 'Legal Metrology Act 2011', type: 'logic', col: 'col-span-1 md:col-span-3', desc: 'Bypasses AI completely to cross-reference the extracted JSON against 38 hardcoded Indian laws (e.g. MRP tax statements).' },
    { id: 'pg', name: 'PostgreSQL', role: 'Immutable Ledger', type: 'data', col: 'col-span-1 md:col-span-3', desc: 'Every penalty is cryptographically hashed and committed to a relational database for unbreakable chain-of-custody.' },
    { id: 'pdf', name: 'PDF-lib', role: 'Notice Generation', type: 'data', col: 'col-span-2 md:col-span-6', desc: 'Dynamically injects the failed rules into an official Government Notice PDF template for instant field enforcement.' }
  ];

  return (
    <section className="py-32 px-6 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent overflow-hidden">
      <div className="mb-20 text-center relative z-20">
        <h2 className="text-4xl font-medium tracking-tight mb-4">Enterprise Architecture</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">10+ interconnected technologies parallelized for sub-3-second field audits. Hover over the stack to inspect the data flow.</p>
      </div>

      <div className="relative w-full max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stack.map((tech) => (
            <div 
              key={tech.id}
              onMouseEnter={() => setActiveTech(tech.id)}
              onMouseLeave={() => setActiveTech(null)}
              className={`relative bg-surface/30 border p-5 rounded-2xl cursor-crosshair transition-all duration-300 flex flex-col justify-between min-h-[140px] overflow-hidden ${tech.col} ${activeTech === tech.id ? 'border-[var(--color-primary)] bg-surface shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.15)] scale-[1.02] z-20' : activeTech ? 'border-[var(--color-border)] opacity-40 scale-95 z-0' : 'border-[var(--color-border)] hover:bg-surface/80 z-10'}`}
            >
              {/* Type Indicator */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-full border ${tech.type === 'edge' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' : tech.type === 'core' ? 'text-green-500 border-green-500/30 bg-green-500/10' : tech.type === 'ai' ? 'text-purple-500 border-purple-500/30 bg-purple-500/10' : tech.type === 'logic' ? 'text-[var(--color-primary)] border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10' : 'text-orange-500 border-orange-500/30 bg-orange-500/10'}`}>
                  {tech.type}
                </span>
                {activeTech === tech.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />}
              </div>
              
              {/* Content */}
              <div>
                <h3 className={`text-[16px] font-semibold mb-1 transition-colors ${activeTech === tech.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>{tech.name}</h3>
                <p className="text-[12px] font-mono text-[var(--color-text-muted)]">{tech.role}</p>
              </div>

              {/* Hover Description overlay */}
              <div className={`absolute inset-0 bg-surface/95 backdrop-blur-md p-5 flex items-center justify-center text-center transition-opacity duration-300 ${activeTech === tech.id ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

page = tech_pattern.sub(new_tech_stack, page)

with open("frontend/app/page.jsx", "w", encoding="utf-8") as f:
    f.write(page)
print("TechStack upgraded")
