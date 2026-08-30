import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will use a regex to replace from 'function InteractivePipelineCard' down to the end of 'function RuleMicroApp'
pattern = r'function InteractivePipelineCard.*?function PipelineSection\(\)'
replacement = """function InteractivePipelineCard({ title, icon: Icon, children }) {
  return (
    <div className="flex flex-col border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(11,31,58,0.04),_0_4px_12px_rgba(11,31,58,0.06),_0_12px_24px_rgba(11,31,58,0.04)] group">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-background)]">
        <Icon size={16} className="text-[var(--color-text-muted)]" />
        <h3 className="font-mono text-[13px] uppercase tracking-wider text-[var(--color-text-secondary)]">{title}</h3>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center bg-[var(--color-background)] min-h-[280px]">
        {children}
      </div>
    </div>
  );
}

function UploadMicroApp() {
  const [state, setState] = useState('idle'); // idle | selected
  
  return (
    <AnimatePresence mode="wait">
      {state === 'idle' ? (
        <motion.div key="idle" 
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full flex flex-col items-center gap-4">
          <div className="w-full h-32 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center bg-[var(--color-surface)]">
            <Upload size={24} className="text-[var(--color-text-muted)] opacity-50" />
          </div>
          <motion.button 
            whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setState('selected')}
            className="mello-btn-primary !py-2 !px-4 !text-[13px]">
            Choose Photo
          </motion.button>
        </motion.div>
      ) : (
        <motion.div key="selected"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full flex flex-col items-center gap-4">
          <div className="w-full h-32 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex items-center justify-center overflow-hidden relative shadow-sm">
             <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent-soft)] to-[var(--color-background)] opacity-50" />
             <FileText size={32} className="text-[var(--color-accent)] relative z-10" />
          </div>
          <div className="font-mono text-[12px] text-[var(--color-text-secondary)]">label_scan_001.jpg</div>
          <motion.button 
            whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setState('idle')}
            className="mello-btn-secondary !py-1 !px-3 !text-[12px]">
            Change
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OCRMicroApp() {
  const [state, setState] = useState('idle'); // idle | scanning | done

  useEffect(() => {
    if (state === 'scanning') {
      const timer = setTimeout(() => setState('done'), 1400);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <AnimatePresence mode="wait">
      {state === 'idle' ? (
        <motion.div key="idle" className="w-full flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <div className="w-3/4 aspect-[4/3] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm flex flex-col p-4 justify-between relative overflow-hidden">
             <div className="w-1/2 h-2 bg-[var(--color-border)] rounded-sm" />
             <div className="w-3/4 h-2 bg-[var(--color-border)] rounded-sm opacity-50" />
             <div className="w-1/3 h-2 bg-[var(--color-border)] rounded-sm" />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setState('scanning')} className="mello-btn-primary !py-2 !px-4 !text-[13px]">
            Run Extraction
          </motion.button>
        </motion.div>
      ) : state === 'scanning' ? (
        <motion.div key="scanning" className="w-full flex flex-col items-center gap-6 relative"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="w-3/4 aspect-[4/3] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm flex flex-col p-4 justify-between relative overflow-hidden">
             <div className="w-1/2 h-2 bg-[var(--color-border)] rounded-sm relative z-0" />
             <div className="w-3/4 h-2 bg-[var(--color-border)] rounded-sm opacity-50 relative z-0" />
             <div className="w-1/3 h-2 bg-[var(--color-border)] rounded-sm relative z-0" />
             
             {/* Scanline ONCE */}
             <motion.div initial={{ top: '0%' }} animate={{ top: '100%' }} transition={{ duration: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)] z-10" />
             
             {/* Staggered Bounding boxes */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ padding: '15px' }}>
                <motion.rect x="0" y="0" width="55%" height="15%" fill="none" stroke="var(--color-accent)" strokeWidth="2"
                   initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.15 }} />
                <motion.rect x="0" y="40%" width="80%" height="15%" fill="none" stroke="var(--color-accent)" strokeWidth="2"
                   initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.6, duration: 0.15 }} />
             </svg>
          </div>
          <div className="text-[12px] font-mono text-[var(--color-text-muted)] animate-pulse">Extracting fields...</div>
        </motion.div>
      ) : (
        <motion.div key="done" className="w-full flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <div className="w-full flex flex-col gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm">
             <div className="flex justify-between items-center text-[11px] font-mono"><span className="text-[var(--color-text-muted)]">Net Qty</span><span className="font-bold">250g</span></div>
             <div className="flex justify-between items-center text-[11px] font-mono"><span className="text-[var(--color-text-muted)]">MRP</span><span className="font-bold">₹149</span></div>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setState('idle')} className="mello-btn-secondary !py-1 !px-3 !text-[12px]">
            Reset
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RuleMicroApp() {
  const examples = [
    { field: 'MRP: ₹149', rule: 'Rule 6(1)(f)', pass: false },
    { field: 'Net Qty: 250g', rule: 'Rule 11(4)', pass: true }
  ];
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState('idle'); // idle | checking | done

  useEffect(() => {
    if (state === 'checking') {
      const timer = setTimeout(() => setState('done'), 400);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const current = examples[idx];

  return (
    <AnimatePresence mode="wait">
      {state === 'idle' ? (
        <motion.div key="idle" className="w-full flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <div className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md font-mono text-[13px] shadow-sm">
            {current.field}
          </div>
          <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setState('checking')} className="mello-btn-primary !py-2 !px-4 !text-[13px]">
            Check Against Rules
          </motion.button>
        </motion.div>
      ) : state === 'checking' ? (
        <motion.div key="checking" className="w-full flex flex-col items-center gap-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded font-mono text-[11px] text-[var(--color-text-muted)]">{current.field}</div>
            <div className="text-[10px] font-bold text-[var(--color-text-muted)] italic">vs</div>
            <div className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-accent)] rounded font-mono text-[11px] text-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]">{current.rule}</div>
          </div>
          <div className="w-32 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
            <motion.div className="h-full bg-[var(--color-accent)]" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.4 }} />
          </div>
        </motion.div>
      ) : (
        <motion.div key="done" className="w-full flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <div className="flex flex-col items-center gap-2">
             <div className="font-mono text-[11px] text-[var(--color-text-muted)]">{current.rule}</div>
             <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18, ease: "easeOut" }}
                className={current.pass ? 'mello-badge-pass text-sm px-3 py-1' : 'mello-badge-fail text-sm px-3 py-1'}>
                {current.pass ? 'PASS' : 'POTENTIAL NON-COMPLIANCE'}
             </motion.div>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => { setIdx((idx + 1) % examples.length); setState('idle'); }} className="mello-btn-secondary !py-1 !px-3 !text-[12px]">
            Next Field ?
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PipelineSection()"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)
with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
