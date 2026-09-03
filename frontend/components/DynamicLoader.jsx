"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ultra-high quality 3D Assets (Blinkit / Apple style 3D emojis)
const icons = [
  // 1. Food Packaging Box (Scanning)
  <img key="package" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Package/3D/package_3d.png" alt="Package" className="w-[110px] h-[110px] drop-shadow-2xl object-contain" />,
  
  // 2. OCR AI (Extraction)
  <img key="robot" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Robot/3D/robot_3d.png" alt="AI Robot" className="w-[110px] h-[110px] drop-shadow-2xl object-contain" />,
  
  // 3. Legal Scales (Rules Engine)
  <img key="scales" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Balance%20scale/3D/balance_scale_3d.png" alt="Legal Scales" className="w-[110px] h-[110px] drop-shadow-2xl object-contain" />,
  
  // 4. Verified Shield (Compliance)
  <img key="shield" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/Shield/3D/shield_3d.png" alt="Compliance Shield" className="w-[110px] h-[110px] drop-shadow-2xl object-contain" />
];

const texts = [
  "Extracting Packaging Telemetry",
  "Running OCR Vision Models",
  "Auditing Legal Metrology Rules",
  "Finalizing Compliance Score"
];

export default function DynamicLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % icons.length);
    }, 2500); // 2.5s per state
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      
      {/* 3D Flip Container */}
      <div 
        className="relative w-32 h-32 flex items-center justify-center mb-10" 
        style={{ perspective: 1200 }} // Gives the 3D depth illusion
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Soft glowing aura behind the icon */}
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150"></div>
            {icons[index]}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Text Carousel */}
      <div className="h-6 overflow-hidden relative w-full max-w-[280px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[13px] font-bold tracking-widest uppercase text-text-secondary text-center absolute w-full"
          >
            {texts[index]}...
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-48 h-1 bg-border rounded-full mt-6 overflow-hidden relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: `${((index + 1) / icons.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

    </div>
  );
}
