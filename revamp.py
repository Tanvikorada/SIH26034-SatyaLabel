import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    landing = f.read()

# Fix HeroSeal to include rotating text
hero_seal_new = '''function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center md:ml-12 group cursor-default">
      {/* Glow effect behind */}
      <div className="absolute inset-8 rounded-full blur-[60px] opacity-10" style={{ background: 'var(--color-text-primary)' }} />
      
      <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full overflow-visible">
        <defs>
          <path id="textCircle" d="M 100, 100 m -85, 0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0" />
        </defs>

        {/* Rotating Text Ring */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '100px 100px' }}>
            <text fill="var(--color-text-muted)" fontSize="11" letterSpacing="4.5" fontWeight="500" className="uppercase font-mono opacity-80">
                <textPath href="#textCircle" startOffset="0%">
                  LEGAL METROLOGY COMPLIANCE • SATYALABEL AI • LEGAL METROLOGY COMPLIANCE • SATYALABEL AI • 
                </textPath>
            </text>
        </motion.g>

        {/* Outer dashed ring */}
        <motion.circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 8"
          animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        
        {/* Inner solid ring */}
        <circle cx="100" cy="100" r="58" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
        
        {/* Center Shield */}
        <motion.path 
          d="M100 55 L124 65 L124 92 C124 112 114 125 100 133 C86 125 76 112 76 92 L76 65 Z"
          fill="var(--color-background)" stroke="var(--color-text-primary)" strokeWidth="2"
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        
        {/* Checkmark inside shield */}
        <path d="M90 95 L97 102 L111 87" fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Scanning laser line moving down the shield */}
        <motion.line 
          x1="65" y1="50" x2="135" y2="50" 
          stroke="var(--color-text-primary)" strokeWidth="1.5" opacity="0.6"
          animate={{ y: [0, 80, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}'''
landing = re.sub(r'function HeroSeal\(\) \{.*?(?=function PixelsToPenalty\(\))', hero_seal_new + '\n\n', landing, flags=re.DOTALL)

# Fix TechStack to be visual storytelling pipeline
tech_stack_new = '''function TechStack() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent overflow-hidden">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-3xl font-medium tracking-tight mb-3">The Analysis Pipeline</h2>
        <p className="text-[var(--color-text-secondary)]">How raw pixels become deterministic legal rulings.</p>
      </div>

      <div className="relative w-full max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
         {/* Animated connector line behind on desktop */}
         <div className="hidden md:block absolute top-1/2 left-[5%] right-[5%] h-[1px] bg-[var(--color-border)] -translate-y-1/2 z-0 overflow-hidden">
             <motion.div className="h-full bg-[var(--color-text-primary)] opacity-40 w-1/3" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
         </div>

         {/* Nodes */}
         <TechNode icon={<Scan size={24}/>} title="1. Capture" subtitle="Mobile Web/Edge" delay={0} />
         <TechNode icon={<Cpu size={24}/>} title="2. Engine" subtitle="Node.js (Render)" delay={0.2} />
         <TechNode icon={<Zap size={24}/>} title="3. Vision AI" subtitle="Gemini 1.5 Pro" delay={0.4} />
         <TechNode icon={<FileText size={24}/>} title="4. Rules" subtitle="Deterministic Logic" delay={0.6} />
         <TechNode icon={<Database size={24}/>} title="5. Ledger" subtitle="Supabase (PG)" delay={0.8} />
      </div>
    </section>
  );
}

function TechNode({ icon, title, subtitle, delay }) {
  return (
     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay }} viewport={{ once: true }}
       className="relative z-10 flex flex-col items-center gap-4 p-6 bg-transparent border border-[var(--color-border)] rounded-2xl w-full md:w-[170px] shadow-sm hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:-translate-y-1 transition-all group backdrop-blur-sm">
         <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] group-hover:scale-110 transition-transform shadow-md">
           {icon}
         </div>
         <div className="text-center">
            <div className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1">{title}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{subtitle}</div>
         </div>
     </motion.div>
  );
}'''
landing = re.sub(r'function TechStack\(\) \{.*?(?=export default function LandingPage\(\))', tech_stack_new + '\n\n', landing, flags=re.DOTALL)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(landing)
