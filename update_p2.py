import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'function PixelsToPenalty\(\).*?function TheCaseFile\(\)'
replacement = """function PixelsToPenalty() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <section className="py-24 px-6 md:px-12 relative z-10 bg-[var(--color-surface)] border-y border-[var(--color-border)] overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-medium tracking-tight mb-16 text-center">From Pixels to Penalty</h2>
        
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-4 gap-0 border-y border-[var(--color-border)] relative">
          {/* Filmstrip sprocket holes top/bottom */}
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2 -mt-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-[var(--color-background)] rounded-sm border border-[var(--color-border)]" />)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2 -mb-1.5 opacity-20">
            {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-3 bg-[var(--color-background)] rounded-sm border border-[var(--color-border)]" />)}
          </div>

          {/* Frame 1: Pixels */}
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">01_PIXELS</div>
            <div className="w-24 h-32 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm relative overflow-hidden flex flex-col p-2 gap-2">
               <div className="w-full h-3 bg-[var(--color-border)] rounded-sm" />
               <div className="w-3/4 h-2 bg-[var(--color-border)] rounded-sm opacity-50" />
               <div className="w-1/2 h-2 bg-[var(--color-border)] rounded-sm opacity-50" />
               <div className="w-full h-8 bg-[var(--color-border)] rounded-sm mt-auto" />
               
               {/* 3 sequential bounding boxes */}
               {isInView && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <motion.rect x="5%" y="5%" width="90%" height="15%" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"
                       initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.15 }} />
                    <motion.rect x="5%" y="28%" width="70%" height="8%" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"
                       initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.42, duration: 0.15 }} />
                    <motion.rect x="5%" y="60%" width="90%" height="30%" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"
                       initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.54, duration: 0.15 }} />
                 </svg>
               )}
            </div>
          </div>

          {/* Frame 2: Parsed */}
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">02_PARSED</div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.8 }}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-sm p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
                 <span className="text-[11px] text-[var(--color-text-secondary)]">Manufacturer</span>
                 <span className="font-mono text-[11px] font-medium truncate max-w-[90px]">NutriBox</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
                 <span className="text-[11px] text-[var(--color-text-secondary)]">Net Qty</span>
                 <span className="font-mono text-[11px] font-medium">250g</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[11px] text-[var(--color-text-secondary)]">MRP</span>
                 <span className="font-mono text-[11px] font-medium">₹149</span>
              </div>
            </motion.div>
          </div>

          {/* Frame 3: Checked */}
          <div className="border-r border-[var(--color-border)] p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)]">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">03_CHECKED</div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.2, type: 'spring', stiffness: 300, damping: 25 }}
               className="flex flex-col items-center gap-2 w-full">
               <div className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded w-full text-center font-mono text-[11px] shadow-[0_1px_2px_rgba(11,31,58,0.04)]">
                 MRP: ₹149
               </div>
               <div className="text-[10px] font-bold text-[var(--color-text-muted)] italic">vs</div>
               <div className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-accent)] rounded w-full text-center font-mono text-[11px] text-[var(--color-accent)] shadow-[0_4px_12px_rgba(11,31,58,0.06)] relative overflow-hidden">
                 <motion.div className="absolute inset-0 bg-[var(--color-accent)] opacity-10"
                    animate={isInView ? { opacity: [0.1, 0.3, 0.1] } : {}} transition={{ delay: 1.4, duration: 0.8, repeat: Infinity }} />
                 Rule 6(1)(f)
               </div>
            </motion.div>
          </div>
          
          {/* Frame 4: Penalty */}
          <div className="p-8 flex flex-col items-center justify-center min-h-[260px] relative bg-[var(--color-background)] overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--color-text-muted)]">04_PENALTY</div>
            
            {/* Radial flash emphasis */}
            {isInView && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 0], scale: 1.5 }} transition={{ delay: 1.8, duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent-soft)_0%,transparent_70%)] pointer-events-none" />
            )}

            <motion.div initial={{ opacity: 0, scale: 1.5 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.8, duration: 0.18, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 relative z-10 shadow-[0_12px_24px_rgba(11,31,58,0.08)] bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)]">
              <div className="mello-badge-fail px-4 py-1.5 text-sm font-bold tracking-wider transform -rotate-3">
                POTENTIAL NON-COMPLIANCE
              </div>
              <div className="font-mono text-[10px] text-[var(--color-text-secondary)] text-center max-w-[120px] leading-tight mt-1">
                Violation of Rule 6(1)(f): Missing inclusive tax stmt
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function TheCaseFile()"""

text = re.sub(pattern, replacement, text, flags=re.DOTALL)
with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
