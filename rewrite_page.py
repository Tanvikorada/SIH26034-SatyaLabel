with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write("""'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

// Custom Hook for Scroll Reveal
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Custom Component for Bento Spotlight Card
function BentoCard({ children, className }) {
  const cardRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };
  return (
    <div 
      ref={cardRef} 
      className={`bento-card ${className}`} 
      onMouseMove={handleMouseMove}
    >
      <div className="bento-content p-8 h-full flex flex-col justify-between relative">
        {children}
      </div>
    </div>
  );
}

// Terminal Animation Component
function TerminalEngine() {
  const [phase, setPhase] = useState('typing'); // 'typing' -> 'parsing' -> 'cards'
  const [typedText, setTypedText] = useState('');
  
  const fullText = `{
  "manufacturer_name": "THE COCA-COLA COMPANY",
  "net_quantity": "200 ml",
  "mrp": "Rs. 50/-",
  "ingredients": "CARBONATED WATER, ACIDITY REGULATORS..."
}`;

  useEffect(() => {
    if (phase !== 'typing') return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('parsing'), 800);
        setTimeout(() => setPhase('cards'), 1500);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    // Reset loop
    if (phase === 'cards') {
      const t = setTimeout(() => {
        setPhase('typing');
        setTypedText('');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="terminal-window w-full shadow-2xl shadow-saffron/20 max-w-lg mx-auto">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="ml-4 text-xs text-gray-500 font-sans tracking-widest">GROQ_VISION_LLM</span>
      </div>
      <div className="p-6 h-64 relative text-left">
        {phase === 'typing' && (
          <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
            {typedText}
            <span className="animate-pulse">_</span>
          </pre>
        )}
        {phase === 'parsing' && (
          <div className="flex items-center justify-center h-full text-saffron text-sm font-mono animate-pulse">
            [ Parsing Structured Layout... ]
          </div>
        )}
        {phase === 'cards' && (
          <div className="flex flex-col gap-3 animate-fade-in h-full overflow-hidden">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
              <span className="text-xs text-gray-400">Manufacturer</span>
              <span className="text-sm font-medium text-white">THE COCA-COLA COMPANY</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
              <span className="text-xs text-gray-400">MRP</span>
              <span className="text-sm font-medium text-green-400">Rs. 50/-</span>
            </div>
            <div className="bg-saffron/10 border border-saffron/30 rounded-lg p-3">
              <span className="text-xs text-saffron block mb-1">⚠️ Ingredients Warning</span>
              <span className="text-sm text-gray-200">ACIDITY REGULATORS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const reveal1 = useReveal();
  const reveal2 = useReveal();
  const reveal3 = useReveal();

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden selection:bg-saffron/30">
      
      {/* Abstract Glowing Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-saffron/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <NavBar />

      {/* HERO SECTION */}
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10 min-h-[90vh]">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full border border-saffron/30 bg-saffron/5 text-saffron text-sm font-medium mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(255,153,51,0.2)]">
            SIH 2024: Problem Statement 1718
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Enforcing Metrology<br />
            <span className="text-gradient-animated">Through Edge AI.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
            SatyaLabel digitizes the Legal Metrology (Packaged Commodities) Rules, 2011. 
            Upload packaging, extract invisible fields, and instantly flag regulatory violations in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => router.push('/upload')} 
              className="px-8 py-4 rounded-xl bg-saffron text-white font-semibold text-lg hover:bg-orange-500 transition-all shadow-[0_0_30px_rgba(255,153,51,0.3)] hover:shadow-[0_0_45px_rgba(255,153,51,0.5)] transform hover:-translate-y-1"
            >
              Start Scanning Demo
            </button>
            <button 
              onClick={() => router.push('/rules')} 
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-lg transition-all backdrop-blur-md"
            >
              Explore the Rules
            </button>
          </div>
        </div>

        {/* Hero Interactive Visual */}
        <div className="flex-1 w-full relative perspective-1000">
          <TerminalEngine />
        </div>
      </main>

      {/* BENTO BOX FEATURES SECTION */}
      <section ref={reveal1} className="py-24 px-6 max-w-7xl mx-auto reveal">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">The Compliance Engine</h2>
          <p className="text-gray-400">Architected for instantaneous field audits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Bento 1 - Wide */}
          <BentoCard className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-2">Dual-Layer Intelligence</h3>
            <p className="text-gray-400 max-w-sm mb-6">Tesseract OCR grounds the spatial bounding boxes, while Groq Qwen 3.8B handles contextual extraction.</p>
            <div className="absolute right-0 bottom-0 p-6 opacity-30">
              <svg className="w-48 h-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </BentoCard>

          {/* Bento 2 - Tall */}
          <BentoCard className="md:row-span-2 flex items-center justify-center text-center group">
            <div>
              <div className="w-32 h-32 rounded-full border-[8px] border-saffron/20 border-t-saffron mx-auto mb-6 flex items-center justify-center transition-transform group-hover:rotate-180 duration-1000">
                <span className="text-3xl font-bold text-white transition-transform group-hover:-rotate-180 duration-1000">100%</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Automated Rulings</h3>
              <p className="text-gray-400">Cross-references all 38 rules from the 2011 Act.</p>
            </div>
          </BentoCard>

          {/* Bento 3 - Small */}
          <BentoCard>
            <h3 className="text-xl font-bold mb-2">Cloud Synced</h3>
            <p className="text-gray-400 text-sm">Every scan is securely hashed and stored in PostgreSQL for chain-of-custody.</p>
            <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-saffron">
              <span>Syncing Active</span>
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-saffron"></span></span>
            </div>
          </BentoCard>

          {/* Bento 4 - Small */}
          <BentoCard>
            <h3 className="text-xl font-bold mb-2">Instant Reports</h3>
            <p className="text-gray-400 text-sm">Generate legally binding PDF notices instantly upon detecting violations.</p>
            <div className="mt-auto pt-4 border-t border-white/10 text-xs font-mono text-gray-500">
              PDF_RENDERER_v1.2
            </div>
          </BentoCard>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section ref={reveal3} className="relative py-32 overflow-hidden reveal">
        <div className="cyber-grid" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-0" />
        
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready for the Field.</h2>
          <p className="text-xl text-gray-400 mb-10">Equip Legal Metrology officers with the ultimate inspection tool. No specialized hardware required.</p>
          <button 
            onClick={() => router.push('/upload')} 
            className="px-12 py-5 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:-translate-y-2"
          >
            Launch Web App
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-6 text-center text-gray-500 text-sm z-10 relative bg-black">
        <p className="mb-2">Developed for Smart India Hackathon 2024</p>
        <p>Problem Statement 1718 · Ministry of Consumer Affairs</p>
      </footer>
    </div>
  );
}
""")
print("Landing page rewritten entirely")
