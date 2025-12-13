import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Zap } from 'lucide-react';

export function AiVsHuman() {
    const humanText = "Check out this new AI tool. It is really fast and helps you code better. I think everyone should try it out.";
    const aiText = "🚀 Just discovered a game-changer for devs! This AI doesn't just code; it ARCHITECTS. ⚡ Sub-ms latency & context-aware suggestions? My productivity just went 10x. #DevLife #AIRevolution";
    
    const [displayedText, setDisplayedText] = useState("");

    // Reset typewriter effect on mount
    useEffect(() => {
        setDisplayedText("");
        let i = 0;
        const timer = setInterval(() => {
            if (i < aiText.length) {
                setDisplayedText(prev => prev + aiText.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 30); // Typing speed
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 border border-white/10 rounded relative overflow-hidden group">
            {/* Background Flair */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-pulse/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-pulse/20 transition-colors"></div>

            {/* Human Side */}
            <div className="border-r border-white/10 pr-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <User size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Human Input</span>
                </div>
                <div className="flex-1 bg-white/5 p-3 rounded-tl rounded-bl border-l-2 border-slate-600">
                    <p className="text-xs text-slate-400 font-serif leading-relaxed opacity-80 italic">
                        "{humanText}"
                    </p>
                </div>
            </div>

            {/* AI Side */}
            <div className="pl-0 flex flex-col">
                 <div className="flex items-center gap-2 mb-2 text-pulse">
                    <Zap size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Gemini Optimized</span>
                </div>
                <div className="flex-1 bg-pulse/5 p-3 rounded-tr rounded-br border-l-2 border-pulse relative">
                    <p className="text-xs text-white font-medium leading-relaxed font-sans">
                        {displayedText}
                        <motion.span 
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-1 h-3 bg-pulse ml-1 align-middle"
                        />
                    </p>
                </div>
            </div>
        </div>
    )
}