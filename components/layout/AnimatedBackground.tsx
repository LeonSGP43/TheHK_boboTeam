
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  theme: 'dark' | 'light';
}

export function AnimatedBackground({ theme }: Props) {
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base Background */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isLight ? 'bg-[#F5F5F7]' : 'bg-[#030303]'}`} />

      {/* Volumetric Aurora Layers - Blurred to abstraction */}
      <div className="absolute inset-0 opacity-40 dark:opacity-25 blur-[100px] sm:blur-[150px]">
        
        {/* Neon Purple Flow (Bottom Right) */}
        <motion.div 
            animate={{ 
                x: [0, -50, 50, 0], 
                y: [0, 50, -50, 0],
                scale: [1, 1.1, 0.9, 1] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -bottom-20 -right-20 w-[70vw] h-[70vw] rounded-full mix-blend-screen ${isLight ? 'bg-purple-200 opacity-80' : 'bg-[#BD00FF]'}`} 
        />

        {/* Electric Cyan Flow (Top Left) */}
        <motion.div 
            animate={{ 
                x: [0, 50, -50, 0], 
                y: [0, -50, 50, 0],
                scale: [1, 1.2, 0.9, 1] 
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className={`absolute -top-20 -left-20 w-[60vw] h-[60vw] rounded-full mix-blend-screen ${isLight ? 'bg-cyan-200 opacity-80' : 'bg-[#00F0FF]'}`} 
        />

        {/* Coral Warmth (Center Floating) */}
        <motion.div 
            animate={{ 
                x: [0, 30, -30, 0], 
                y: [0, -30, 30, 0],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full mix-blend-screen ${isLight ? 'bg-orange-200 opacity-60' : 'bg-[#FF7E5F]'}`} 
        />
      </div>

      {/* Film Grain Texture for High-End Feel */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />
    </div>
  );
}
