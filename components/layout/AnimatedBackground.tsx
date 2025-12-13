
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  theme: 'dark' | 'light';
}

export function AnimatedBackground({ theme }: Props) {
  if (theme === 'light') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
         <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
               backgroundSize: '20px 20px' 
             }} 
         />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0e1a]">
      {/* Moving Grid Layer */}
      <motion.div
        className="absolute inset-[-100%]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(30, 41, 59, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
        animate={{
          x: ['0%', '-5%'],
          y: ['0%', '-5%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Radial Vignette for Depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, #0a0e1a 90%)'
        }}
      />
      
      {/* Floating Particles (Dust/Data) */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-pulse/20 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * -100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
