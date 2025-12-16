
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';

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
  const progressWidth = isDataReady ? "100%" : (minTimeElapsed ? "90%" : "60%");

  return (
    <motion.div 
        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
    >
        {/* Background Grid & Aurora */}
        <div className="absolute inset-0 opacity-[0.1]" 
             style={{ 
               backgroundImage: `radial-gradient(#00d4ff 1px, transparent 1px)`, 
               backgroundSize: '30px 30px' 
             }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-gradient-to-tr from-indigo-900/40 to-purple-900/40 rounded-full blur-[120px] pointer-events-none" />

        {/* --- BRAND LOGO: Crystal Butterfly --- */}
        <div className="mb-16 relative group perspective-1000">
             
             {/* Glass Squircle Container - Thick & High Fidelity */}
             <motion.div 
                initial={{ rotateX: 10, rotateY: -10 }}
                animate={{ rotateX: [10, -5, 10], rotateY: [-10, 5, -10] }}
                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                className="relative w-64 h-64 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] flex items-center justify-center shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.05)] overflow-hidden"
             >
                {/* Edge Highlights */}
                <div className="absolute inset-0 rounded-[3rem] border border-white/20 opacity-50" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                
                {/* The Butterfly SVG */}
                <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_0_30px_rgba(189,0,255,0.4)]">
                    <defs>
                        {/* Iridescent Gradient */}
                        <linearGradient id="wingGradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#00F0FF" /> {/* Cyan */}
                            <stop offset="50%" stopColor="#BD00FF" /> {/* Purple */}
                            <stop offset="100%" stopColor="#FF7E5F" /> {/* Pink */}
                        </linearGradient>
                        <radialGradient id="nodeGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
                            <stop stopColor="white" />
                            <stop offset="1" stopColor="#00F0FF" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    
                    {/* Right Wing (Foreground) - Organic Shape with Morphing */}
                    <motion.path 
                        d="M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170" 
                        fill="url(#wingGradient)" 
                        fillOpacity="0.6"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity="0.5"
                        animate={{ 
                            d: [
                                "M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170",
                                "M100 125 C 100 125, 130 50, 170 70 C 190 90, 170 150, 135 165 C 115 175, 100 175, 100 175",
                                "M100 120 C 100 120, 140 40, 180 60 C 200 80, 180 140, 140 160 C 120 170, 100 170, 100 170"
                            ]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                     {/* Left Wing (Background) */}
                     <motion.path 
                        d="M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170" 
                        fill="url(#wingGradient)" 
                        fillOpacity="0.3"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeOpacity="0.3"
                        animate={{ 
                            d: [
                                "M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170",
                                "M100 125 C 100 125, 70 50, 30 70 C 10 90, 30 150, 65 165 C 85 175, 100 175, 100 175",
                                "M100 120 C 100 120, 60 40, 20 60 C 0 80, 20 140, 60 160 C 80 170, 100 170, 100 170"
                            ]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    
                    {/* Tech Nodes (Molecular Overlay) */}
                    <g className="mix-blend-overlay">
                        <motion.line x1="100" y1="120" x2="140" y2="60" stroke="#00F0FF" strokeWidth="1" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{duration: 2, repeat: Infinity}} />
                        <motion.line x1="140" y1="60" x2="180" y2="100" stroke="#00F0FF" strokeWidth="1" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{duration: 2, repeat: Infinity, delay: 0.5}} />
                        <motion.line x1="180" y1="100" x2="140" y2="160" stroke="#00F0FF" strokeWidth="1" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{duration: 2, repeat: Infinity, delay: 1}} />
                        <motion.line x1="140" y1="160" x2="100" y2="170" stroke="#00F0FF" strokeWidth="1" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{duration: 2, repeat: Infinity, delay: 1.5}} />
                        
                        <circle cx="140" cy="60" r="3" fill="white" className="animate-pulse" />
                        <circle cx="180" cy="100" r="2" fill="#00F0FF" className="animate-pulse" />
                        <circle cx="140" cy="160" r="3" fill="white" className="animate-pulse" />
                    </g>

                    {/* Central Body (Light Source) */}
                    <ellipse cx="100" cy="140" rx="4" ry="40" fill="white" opacity="0.8" filter="blur(4px)" />
                    <ellipse cx="100" cy="140" rx="2" ry="30" fill="white" />
                </svg>
             </motion.div>
        </div>

        {/* Mock Search Bar (Blue/Purple Theme) */}
        <div className="w-[90%] max-w-md relative mb-8 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00F0FF]">
                <Search size={20} />
            </div>
            <div className="h-14 w-full bg-[#0a0a0a] border border-indigo-500/30 group-hover:border-indigo-400/60 rounded-full flex items-center pl-12 pr-4 shadow-[0_0_40px_rgba(100,0,255,0.2)] transition-colors">
                <span className="text-indigo-100 font-mono text-sm tracking-wide">
                    {displayText}
                    <span className="inline-block w-2 h-4 bg-[#BD00FF] ml-1 animate-pulse align-middle shadow-[0_0_10px_#BD00FF]" />
                </span>
            </div>
            
            {/* Scan Line Animation */}
            {!isDataReady && (
                <motion.div 
                    initial={{ left: '5%', width: '0%' }}
                    animate={{ left: '0%', width: '100%', opacity: [0, 1, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    className="absolute bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_10px_#00d4ff]"
                />
            )}
        </div>

        {/* Loading Metrics */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[#00F0FF] font-mono text-xs uppercase tracking-widest h-4">
                {isDataReady ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500">
                         <CheckCircle2 size={12} />
                         <span>System Ready</span>
                     </motion.div>
                ) : (
                    <>
                        <Loader2 size={12} className="animate-spin text-[#BD00FF]" />
                        <span className="text-indigo-300">Ingesting Social Signals</span>
                    </>
                )}
            </div>
            
            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: progressWidth }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={`h-full ${isDataReady ? 'bg-green-500' : 'bg-gradient-to-r from-[#00F0FF] to-[#BD00FF]'}`}
                />
            </div>
        </div>

        {/* Disclaimer */}
        <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono">
            POWERED BY GOOGLE GEMINI 3 PRO
        </div>
    </motion.div>
  );
}
