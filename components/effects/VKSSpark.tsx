import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  active: boolean;
}

export function VKSSpark({ active }: Props) {
  // Increase particle count for "Explosive" feel
  const particleCount = 40;
  
  // Create randomized particle data
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const angle = (i / particleCount) * 360;
    // Introduce randomness to angle for "chaos"
    const randomAngle = angle + (Math.random() * 20 - 10); 
    const distance = 150 + Math.random() * 250; // Further distance
    
    return {
      id: i,
      angle: randomAngle,
      distance,
      size: 2 + Math.random() * 6, // Varied sizes
      color: Math.random() > 0.3 ? '#ff6b35' : '#ffffff', // Mostly Orange, some white hot
      delay: Math.random() * 0.1, // Slight stagger
      duration: 0.6 + Math.random() * 0.4
    };
  });

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          
          {/* Layer 1: Core Flash (Blind the screen momentarily) */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 2, 3] }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute w-[50vw] h-[50vw] bg-white/30 rounded-full blur-[100px]"
          />

          {/* Layer 2: Shockwaves (Expanding Rings) */}
          {[0, 1].map((i) => (
             <motion.div
                key={`wave-${i}`}
                initial={{ width: 0, height: 0, opacity: 0.8, borderWidth: 20 }}
                animate={{ 
                    width: '150vh', 
                    height: '150vh', 
                    opacity: 0,
                    borderWidth: 0
                }}
                transition={{ duration: 0.8, ease: "circOut", delay: i * 0.1 }}
                className="absolute rounded-full border-spark/50 bg-transparent"
                style={{ borderColor: '#ff6b35' }}
             />
          ))}

          {/* Layer 3: Debris Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                opacity: [1, 1, 0],
                scale: [0, p.size, 0],
              }}
              transition={{
                duration: p.duration,
                ease: "circOut", // Explosive ease
                delay: p.delay
              }}
              style={{
                position: 'absolute',
                width: p.size > 5 ? p.size * 3 : p.size, // Stretch larger particles into streaks
                height: p.size,
                borderRadius: p.size > 5 ? '2px' : '50%', // Streaks vs Dots
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
                transform: `rotate(${p.angle}deg)`, // Rotate streaks to follow path
              }}
            />
          ))}

          {/* Layer 4: Impact Text (Cyberpunk HUD style) */}
          <motion.div
            initial={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute flex flex-col items-center justify-center z-50"
          >
             <div className="text-[10px] font-mono text-spark tracking-[1em] uppercase mb-2 animate-pulse">
                System Alert
             </div>
             <div className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-spark drop-shadow-[0_0_25px_rgba(255,107,53,0.8)]"
                  style={{ textShadow: '0 0 50px rgba(255,107,53,0.5)' }}
             >
                SURGE
             </div>
             <div className="h-1 w-full bg-spark mt-2 shadow-[0_0_20px_#ff6b35]" />
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}