function TheCaseFile() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const timerRef = useRef(null);

  useEffect(() => {
    // Start ticking immediately, stop only when resolved
    if (!isResolved) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isResolved]);

  const handleProcess = () => {
    if (isResolved) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsResolved(true);
    }, 1500); // SatyaLabel takes 1.5s
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
        <p className="text-[var(--color-text-secondary)]">The difference in time is the difference in scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm relative">
        
        {/* Left: Manual (Aged paper styling) */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--color-border)] relative overflow-hidden"
             style={{ backgroundColor: '#FAF9F6' }}>
          {/* subtle paper grain SVG overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-serif text-xl text-[#3A332A] mb-8 font-medium">Manual Inspection</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
              <div className={`text-5xl font-mono tabular-nums ${!isResolved ? 'text-[#8C3A3A]' : 'text-[#8C7A6B]'}`}>
                {formatTime(timer)}
              </div>
              
              <div className="relative h-16 w-full flex justify-center items-center">
                <motion.div className={`px-4 py-2 border-[3px] border-[#8C3A3A] text-[#8C3A3A] font-bold tracking-widest uppercase text-xl transform -rotate-12 ${isResolved ? 'opacity-30' : 'opacity-80'}`}
                     style={{ borderRadius: 4, filter: 'url(#stamp-texture)' }}>
                  PENDING
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Digital (Crisp) */}
        <div className="p-8 md:p-12 bg-[var(--color-surface)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-medium text-xl text-[var(--color-text-primary)] mb-8">SatyaLabel</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
              {!isResolved && !isProcessing ? (
                <button onClick={handleProcess} className="mello-btn-primary active:scale-[0.98] !text-lg !px-8 !py-3">
                  Process Case
                </button>
              ) : isProcessing ? (
                <div className="text-[var(--color-accent)] animate-pulse font-mono text-sm">Processing label...</div>
              ) : (
                <>
                  <div className="text-5xl font-mono tabular-nums text-[var(--color-pass)]">0:01</div>
                  <div className="relative h-16 w-full flex justify-center items-center">
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

      </div>
      
      <p className="text-center mt-6 text-sm text-[var(--color-text-muted)] max-w-[600px] mx-auto">
        You just spent more time reading this section than SatyaLabel spent verifying a label.
      </p>

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

// ─── PHASE 5: Ruling Ledger (Rules Engine) ────────────────────────────────
const LEDGER_DATA = [
  { id: 'pass', label: 'PASS', icon: CheckCircle2, rule: 'Rule 6(1)(c)', field: 'Net Quantity', val: '500g', exp: 'Declared correctly in standard unit.' },
  { id: 'fail', label: 'POTENTIAL NON-COMPLIANCE', icon: AlertTriangle, rule: 'Rule 6(1)(f)', field: 'MRP', val: 'Rs.150', exp: 'MRP must state "inclusive of all taxes". Phrase absent.' },
  { id: 'review', label: 'MANUAL REVIEW', icon: HelpCircle, rule: 'Rule 6(1)(d)', field: 'Mfg Date', val: '10/23', exp: 'Ambiguous format. Could be MM/YY or DD/MM.' },
  { id: 'na', label: 'NOT APPLICABLE', icon: MinusCircle, rule: 'Rule 31', field: 'Category', val: 'Exempt', exp: 'Fast food packages are exempt from certain rules.' },
  { id: 'nv', label: 'NOT VERIFIED', icon: EyeOff, rule: 'Rule 14A', field: 'FSSAI No.', val: 'null', exp: 'Field unreadable due to glare or damage.' },
];

function RulingLedger()