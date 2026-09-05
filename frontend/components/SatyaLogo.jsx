import React from 'react';

export default function SatyaLogo({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[#EA580C]/10 rounded-3xl blur-xl" />
      
      <div className="relative w-24 h-24 bg-white border border-[#E2E8F0] shadow-xl rounded-2xl flex items-center justify-center overflow-hidden">
        {/* Animated Scanning Laser */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#EA580C] shadow-[0_0_8px_#EA580C] animate-[scanDrop_3s_ease-in-out_infinite]" />
        <style>{`
          @keyframes scanDrop {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor">
          {/* Outer Metrology Ring (Dashed, representing measurement ticks) */}
          <circle cx="50" cy="50" r="42" stroke="#0F172A" strokeWidth="2" strokeDasharray="4 6" className="origin-center animate-[spinSlow_20s_linear_infinite]" opacity="0.15" />
          
          {/* Camera Viewfinder Corners (Computer Vision) */}
          <path d="M 25 15 L 15 15 L 15 25" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 75 15 L 85 15 L 85 25" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 85 L 15 85 L 15 75" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 75 85 L 85 85 L 85 75" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Central Barcode / Label motif */}
          <rect x="30" y="35" width="6" height="30" rx="1" fill="#0F172A" />
          <rect x="42" y="35" width="4" height="30" rx="1" fill="#0F172A" />
          <rect x="52" y="35" width="10" height="30" rx="1" fill="#0F172A" />
          <rect x="68" y="35" width="4" height="30" rx="1" fill="#0F172A" />

          {/* Saffron Legal Checkmark overlaid */}
          <path d="M 40 55 L 50 65 L 75 40" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
