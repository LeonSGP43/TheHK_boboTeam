
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Loader2, CheckCircle2 } from 'lucide-react';

interface IntroLoaderProps {
    isDataReady: boolean;
    onComplete: () => void;
}

export function IntroLoader({ isDataReady, onComplete }: IntroLoaderProps) {
  const [displayText, setDisplayText] = useState("");
  const targetText = "Analyzing Global Visual Trends...";
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  
  // 1. Minimum Branding Timer (Ensures the logo and text are seen for at least 3s)
  useEffect(() => {
    const timer = setTimeout(() => {
        setMinTimeElapsed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Watch for completion condition (Time + Data)
  useEffect(() => {
      if (minTimeElapsed && isDataReady) {
          // Add a small buffer before unmounting for the "100%" visual
          const exitTimer = setTimeout(() => {
              onComplete();
          }, 800);
          return () => clearTimeout(exitTimer);
      }
  }, [minTimeElapsed, isDataReady, onComplete]);

  // 3. Typewriter Effect
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < targetText.length) {
        setDisplayText(prev => prev + targetText.charAt(i));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);
    return () => clearInterval(typing);
  }, []);

  // Calculate fake progress for the bar
  // If data isn't ready, we cap at 90%. If ready, we go to 100%.
  const progressWidth = isDataReady ? "100%" : (minTimeElapsed ? "90%" : "60%");

  return (
    <motion.div 
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
        exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
    >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ 
               backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px)`, 
               backgroundSize: '30px 30px' 
             }} 
        />

        {/* Logo Pulse */}
        <div className="mb-12 relative">
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-pulse blur-[40px] opacity-50 rounded-full"
             />
             <Zap size={64} className="text-pulse relative z-10" fill="currentColor" />
        </div>

        {/* Mock Search Bar */}
        <div className="w-[90%] max-w-md relative mb-8">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={20} />
            </div>
            <div className="h-14 w-full bg-black border border-slate-700 rounded-full flex items-center pl-12 pr-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <span className="text-white font-mono text-sm tracking-wide">
                    {displayText}
                    <span className="inline-block w-2 h-4 bg-pulse ml-1 animate-pulse align-middle" />
                </span>
            </div>
            
            {/* Scan Line Animation - Only active while loading */}
            {!isDataReady && (
                <motion.div 
                    initial={{ left: '5%', width: '0%' }}
                    animate={{ left: '0%', width: '100%', opacity: [0, 1, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    className="absolute bottom-0 h-[2px] bg-pulse shadow-[0_0_10px_#00d4ff]"
                />
            )}
        </div>

        {/* Loading Metrics */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-pulse font-mono text-xs uppercase tracking-widest h-4">
                {isDataReady ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500">
                         <CheckCircle2 size={12} />
                         <span>System Ready</span>
                     </motion.div>
                ) : (
                    <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Ingesting Social Signals</span>
                    </>
                )}
            </div>
            
            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: progressWidth }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-full ${isDataReady ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gradient-to-r from-pulse to-purple-500'}`}
                />
            </div>
            
            <div className="flex justify-between w-64 text-[9px] text-slate-500 font-mono mt-1">
                <span>TIKHUB: {isDataReady ? 'SYNCED' : 'CONNECTING...'}</span>
                <span>GEMINI: {isDataReady ? 'ACTIVE' : 'INITIALIZING...'}</span>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono">
            POWERED BY GOOGLE GEMINI 2.5 FLASH
        </div>
    </motion.div>
  );
}
