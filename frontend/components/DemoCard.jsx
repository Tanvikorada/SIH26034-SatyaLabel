"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoCard({ steps, autoPlay = true, loop = true }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCurrentStep(steps.length - 1);
      return;
    }

    if (!autoPlay || steps.length === 0) return;
    
    let timeoutId;
    const playNext = () => {
      const step = steps[currentStep];
      const duration = step.durationMs || 2500;
      
      timeoutId = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(c => c + 1);
        } else if (loop) {
          setCurrentStep(0);
        }
      }, duration);
    };
    
    playNext();
    return () => clearTimeout(timeoutId);
  }, [currentStep, autoPlay, steps, loop]);

  const handleTap = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCurrentStep(steps.length - 1);
      return;
    }

    if (autoPlay) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else if (loop) {
      setCurrentStep(0);
    }
  };

  const step = steps[currentStep];

  return (
    <div 
      className={`mello-card-flat flex flex-col overflow-hidden w-full h-[320px] ${!autoPlay ? 'cursor-pointer hover:border-mist transition-colors group' : ''}`}
      onClick={handleTap}
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-graphite bg-charcoal/50">
        <span className="text-[12px] font-medium text-mist uppercase tracking-widest">{step.label}</span>
        {!autoPlay && (
          <span className="text-[11px] text-fog opacity-0 group-hover:opacity-100 transition-opacity">Tap to advance &rarr;</span>
        )}
      </div>
      
      <div className="relative flex-1 bg-obsidian overflow-hidden p-6 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="w-full flex justify-center"
          >
            {step.content}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress Indicator */}
      <div className="h-1 w-full bg-charcoal flex">
         {steps.map((_, i) => (
           <div 
             key={i} 
             className={`flex-1 h-full transition-colors duration-500 ${i <= currentStep ? 'bg-mist' : 'bg-transparent'}`} 
           />
         ))}
      </div>
    </div>
  );
}
