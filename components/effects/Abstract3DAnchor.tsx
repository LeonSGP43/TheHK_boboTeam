
import React from 'react';
import { motion } from 'framer-motion';

type ShapeType = 'sphere' | 'capsule' | 'donut';

interface Props {
  type: ShapeType;
  className?: string;
  color?: string;
}

export const Abstract3DAnchor: React.FC<Props> = ({ type, className = '', color = '#00F0FF' }) => {
  
  // Simulation of 3D materials using CSS gradients
  const materials = {
    sphere: {
      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, ${color} 20%, #000 100%)`,
      boxShadow: `0 20px 50px -10px ${color}60, inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.4)`
    },
    capsule: {
      background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, ${color} 50%, #000 100%)`,
      boxShadow: `0 15px 30px -5px ${color}40, inset 0 0 20px rgba(255,255,255,0.2)`
    },
    donut: {
       // A torus simulation via radial gradient mask (simplified)
       background: `conic-gradient(from 0deg, ${color}, #fff, ${color})`,
       mask: 'radial-gradient(transparent 40%, black 41%)',
       WebkitMask: 'radial-gradient(transparent 40%, black 41%)',
       boxShadow: `0 0 30px ${color}50`
    }
  };

  return (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: type === 'donut' ? 360 : 0,
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`relative ${className}`}
    >
        {/* The Object */}
        <div 
            className={`w-full h-full ${type === 'sphere' ? 'rounded-full' : type === 'capsule' ? 'rounded-full' : 'rounded-full'}`}
            style={materials[type]}
        />
        
        {/* Specular Highlight (The "Wet" Look) */}
        <div className="absolute top-[15%] left-[15%] w-[20%] h-[10%] bg-white blur-[2px] rounded-full opacity-80" />
    </motion.div>
  );
};
