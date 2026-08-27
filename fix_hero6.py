import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

start_idx = page.find("function HeroSeal() {")
end_idx = page.find("function PixelsToPenalty() {")

government_logo = """function HeroSeal() {
  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center group cursor-default mx-auto">
      
      {/* Official Government Aesthetic Container */}
      <div className="relative z-10 w-[240px] h-[240px] rounded-full bg-surface border-4 border-double border-[#b8860b] dark:border-[#d4af37] shadow-[0_10px_40px_-10px_rgba(184,134,11,0.3)] flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Inner concentric ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#b8860b]/30 dark:border-[#d4af37]/30" />
        
        {/* Subtle radial backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#b8860b]/5 dark:to-[#d4af37]/10" />

        {/* Central Government Iconography (Balance Scale of Metrology) */}
        <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] relative z-20 mt-2">
          
          {/* Base & Pillar */}
          <path d="M 46 90 L 54 90 L 52 40 L 48 40 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 35 95 L 65 95 L 60 90 L 40 90 Z" fill="currentColor" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          
          {/* The Balance Beam */}
          <rect x="20" y="38" width="60" height="4" rx="2" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          
          {/* Left Pan (Product/AI) */}
          <line x1="25" y1="42" x2="15" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <line x1="25" y1="42" x2="35" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 10 65 Q 25 75 40 65 Z" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <circle cx="25" cy="62" r="5" fill="#10b981" /> {/* Glowing AI node */}
          
          {/* Right Pan (Law/Book) */}
          <line x1="75" y1="42" x2="65" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <line x1="75" y1="42" x2="85" y2="65" stroke="currentColor" strokeWidth="1.5" className="text-[#1e3a8a] dark:text-[#60a5fa]" />
          <path d="M 60 65 Q 75 75 90 65 Z" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <rect x="70" y="58" width="10" height="6" fill="currentColor" className="text-text-primary" /> {/* Book block */}

          {/* Center Fulcrum */}
          <circle cx="50" cy="40" r="5" fill="currentColor" className="text-[#b8860b] dark:text-[#d4af37]" />
          <circle cx="50" cy="40" r="2" fill="var(--color-surface)" />
        </svg>

        {/* Circular Text (SVG path for perfect text wrapping) */}
        <div className="absolute inset-0 z-30 pointer-events-none animate-[spin_40s_linear_infinite]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path id="textPath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
            <text className="text-[14px] font-medium tracking-[0.15em] uppercase fill-text-primary">
              <textPath href="#textPath" startOffset="0%">
                • LEGAL METROLOGY COMPLIANCE • DEPARTMENT OF CONSUMER AFFAIRS
              </textPath>
            </text>
          </svg>
        </div>

      </div>
    </div>
  );
}

"""

if start_idx != -1 and end_idx != -1:
    new_page = page[:start_idx] + government_logo + page[end_idx:]
    with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
        f.write(new_page)
    print("Updated to Government Logo")
else:
    print("Could not find functions")
