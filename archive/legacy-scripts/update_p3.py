import re
import sys

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'function TheCaseFile\(\).*?(?=export default function LandingPage)'
replacement = """function TheCaseFile() {
  const [sliderVal, setSliderVal] = useState(5);
  const [isResolved, setIsResolved] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isResolved) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isResolved]);

  const handleDrag = (e) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    if (val > 90 && !isResolved) {
      setIsResolved(true);
    }
  };

  const handleToggle = () => {
    if (sliderVal < 90) {
      setSliderVal(100);
      setIsResolved(true);
    } else {
      setSliderVal(5);
      setIsResolved(false);
      setTimer(0);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Case File</h2>
        <p className="text-[var(--color-text-secondary)]">The difference in time is the difference in scale. Drag to process.</p>
      </div>

      <div ref={containerRef} className="h-[400px] w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[0_4px_12px_rgba(11,31,58,0.06)] relative select-none">
        
        {/* Left: Manual (Aged paper styling) - full width underneath */}
        <div className="absolute inset-0 p-8 md:p-12" style={{ backgroundColor: '#FAF9F6' }}>
          {/* subtle paper grain SVG overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          <div className="relative z-10 flex flex-col h-full w-[50%] max-w-[400px]">
            <h3 className="font-serif text-xl text-[#3A332A] mb-8 font-medium">Manual Inspection</h3>
            
            <div className="flex-1 flex flex-col items-start justify-center gap-6 py-6">
              <div className={`text-5xl font-mono tabular-nums ${!isResolved ? 'text-[#8C3A3A]' : 'text-[#8C7A6B]'}`}>
                {formatTime(timer)}
              </div>
              
              <div className="relative h-16 w-full flex items-center">
                <div className={`px-4 py-2 border-[3px] border-[#8C3A3A] text-[#8C3A3A] font-bold tracking-widest uppercase text-xl transform -rotate-[8deg] ${isResolved ? 'opacity-30' : 'opacity-80'}`}
                     style={{ borderRadius: 4, filter: 'url(#stamp-texture)' }}>
                  PENDING
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital (Crisp) - clipping path based on slider */}
        <div className="absolute inset-0 bg-[var(--color-surface)] p-8 md:p-12 pointer-events-none" style={{ clipPath: `polygon(${sliderVal}% 0, 100% 0, 100% 100%, ${sliderVal}% 100%)` }}>
          <div className="absolute inset-y-0 right-0 p-8 md:p-12 w-1/2 flex flex-col h-full items-end text-right">
            <h3 className="font-medium text-xl text-[var(--color-text-primary)] mb-8">SatyaLabel</h3>
            
            <div className="flex-1 flex flex-col items-end justify-center gap-6 py-6">
              {isResolved && (
                <>
                  <div className="text-5xl font-mono tabular-nums text-[var(--color-pass)]">0:01</div>
                  <div className="relative h-16 w-full flex justify-end items-center">
                    <motion.div 
                      initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="px-4 py-2 border-[3px] border-[var(--color-pass)] text-[var(--color-pass)] text-xl font-bold tracking-widest uppercase rounded bg-[var(--color-pass-bg)]"
                    >
                      VERIFIED
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Slider Input overlay */}
        <input 
          type="range" min="0" max="100" value={sliderVal} onChange={handleDrag}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" 
        />

        {/* Visible Handle */}
        <div className="absolute top-0 bottom-0 w-1 bg-[var(--color-border)] z-20 pointer-events-none transition-all duration-75" style={{ left: `${sliderVal}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full shadow-md flex items-center justify-center pointer-events-auto cursor-pointer" onClick={handleToggle}>
            <div className="flex gap-1">
              <div className="w-0.5 h-4 bg-[var(--color-text-muted)] rounded-full" />
              <div className="w-0.5 h-4 bg-[var(--color-text-muted)] rounded-full" />
            </div>
          </div>
        </div>

      </div>
      
      {/* SVG filter for manual stamp */}
      <svg width="0" height="0" className="absolute">
        <filter id="stamp-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </section>
  );
}

const LEDGER_DATA = [
  { id: 'scan-1', product: 'Oat Milk 1L', status: 'fail', rule: 'Rule 6(1)(f)', field: 'MRP', val: 'Rs.150', exp: 'Extracted MRP value did not include the required tax-inclusive statement, violating Rule 6(1)(f).' },
  { id: 'scan-2', product: 'Whole Wheat Atta 5kg', status: 'pass', rule: 'Rule 6(1)(c)', field: 'Net Quantity', val: '5kg', exp: 'Net quantity declared correctly in standard units according to Rule 6(1)(c).' },
  { id: 'scan-3', product: 'Premium Basmati 1kg', status: 'review', rule: 'Rule 6(1)(d)', field: 'Mfg Date', val: '10/23', exp: 'Ambiguous format detected. Verification needed to ensure format complies with MM/YY or DD/MM/YY.' },
];

function RulingLedger() {
  const [expandedId, setExpandedId] = useState(null);
  const [showTech, setShowTech] = useState(false);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Ruling Ledger</h2>
        <p className="text-[var(--color-text-secondary)]">Rooted in the Legal Metrology Rules, 2011. Not generic AI.</p>
      </div>

      <div className="flex flex-col gap-3">
        {LEDGER_DATA.map(row => {
          const isExpanded = expandedId === row.id;
          return (
            <div key={row.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)] shadow-sm transition-all duration-300">
              
              {/* Row Header */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-background)] transition-colors" onClick={() => { setExpandedId(isExpanded ? null : row.id); setShowTech(false); }}>
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'pass' ? 'bg-[var(--color-pass)]' : row.status === 'fail' ? 'bg-[var(--color-fail)]' : 'bg-amber-500'}`} />
                  <span className="font-medium text-[14px]">{row.product}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono text-[var(--color-text-secondary)]">{row.rule}</span>
                  <ChevronDown size={16} className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="overflow-hidden">
                    <div className="p-6 pt-2 bg-[var(--color-background)] border-t border-[var(--color-border)]">
                      
                      {/* Ruling Slip Document Card */}
                      <div className="bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.02)] rounded-lg p-6 relative mb-4">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-3 mb-4 text-center">
                          Legal Metrology (Packaged Commodities) Rules, 2011
                        </div>
                        
                        <div className="absolute top-4 right-4">
                          <motion.div initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                             className={`px-3 py-1 border-2 text-[10px] font-bold uppercase tracking-widest transform rotate-[4deg] rounded ${row.status === 'pass' ? 'border-green-600 text-green-600 bg-green-50' : row.status === 'fail' ? 'border-red-600 text-red-600 bg-red-50' : 'border-amber-600 text-amber-600 bg-amber-50'}`}>
                            {row.status === 'pass' ? 'COMPLIANT' : row.status === 'fail' ? 'VIOLATION' : 'REVIEW'}
                          </motion.div>
                        </div>
                        
                        <p className="text-[14px] text-gray-800 leading-relaxed pr-24">
                          {row.exp.replace(row.rule, '').replace(row.val, '')} 
                          <span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 mx-1">{row.val}</span>
                          under <span className="font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">{row.rule}</span>.
                        </p>
                      </div>

                      {/* Technical Evidence Toggle */}
                      <div className="w-full">
                        <button className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-2" onClick={() => setShowTech(!showTech)}>
                          <FileText size={14} />
                          {showTech ? 'Hide Technical Evidence' : 'View Technical Evidence'}
                        </button>
                        
                        <AnimatePresence>
                          {showTech && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <pre className="text-[10px] font-mono p-4 bg-[#0d1117] text-[#c9d1d9] rounded-md overflow-x-auto border border-[#30363d] shadow-inner mt-2">
{`{
  "scanId": "${row.id}-98a12",
  "rule_evaluated": "${row.rule}",
  "extracted_value": "${row.val}",
  "bbox": [124, 54, 452, 98],
  "confidence": 0.942,
  "status": "${row.status.toUpperCase()}"
}`}
                              </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TechStack() {
  // Using Lucide fallbacks since simple-icons might not be perfectly mapped in existing imports
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">System Architecture</h2>
        <p className="text-[var(--color-text-secondary)]">Built entirely on free-tier infrastructure.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-12 w-full max-w-[900px] mx-auto">
        
        {/* Zone 1: Frontend */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Frontend</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="React Framework">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Monitor size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Next.js</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Styling">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Layers size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Tailwind</span>
            </div>
          </div>
          
          {/* Connector Beam Right */}
          <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-px bg-[var(--color-border)]">
             <motion.div className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%', x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </div>
        </div>

        {/* Zone 2: AI & Extraction */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">AI & Extraction</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Primary OCR">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><FileSearch size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Tesseract</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Fallback Vision">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Eye size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Gemini</span>
            </div>
          </div>
          
          {/* Connector Beam Right */}
          <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-px bg-[var(--color-border)]">
             <motion.div className="h-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%', x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }} />
          </div>
        </div>

        {/* Zone 3: Backend & DB */}
        <div className="flex-1 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(11,31,58,0.04),0_4px_12px_rgba(11,31,58,0.06)] relative group">
          <div className="absolute -top-3 left-4 bg-[var(--color-background)] px-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Backend & DB</div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="API Server">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Server size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Express</span>
            </div>
            <div className="flex flex-col items-center gap-1 group/node cursor-help" title="Database">
              <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-center hover:border-[var(--color-accent)] transition-colors"><Database size={18} /></div>
              <span className="text-[10px] text-[var(--color-text-muted)] group-hover/node:text-[var(--color-primary)]">Postgres</span>
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
