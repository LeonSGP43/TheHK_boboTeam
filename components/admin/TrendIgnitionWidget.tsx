import React from 'react';
import { motion } from "framer-motion";

export function TrendIgnitionWidget({ vks }: { vks: number }) {
  // Color mapping logic
  // 0 = Blue (#00d4ff), >50 = Purple, >80 = Red (#ff6b35)
  const isHigh = vks > 80;
  const isMed = vks > 50;
  
  const color = isHigh ? '#ff6b35' : (isMed ? '#a855f7' : '#00d4ff');
  
  // Speed calculation: Higher VKS = Lower duration (faster)
  // VKS 0 -> 2s, VKS 100 -> 0.4s
  const duration = Math.max(0.4, 2 - (vks / 60)); 
  
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute top-2 left-3 z-20">
        <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Heatmap Core</span>
      </div>
      
      {/* Background Grid for context */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, 
             backgroundSize: '10px 10px' 
           }} 
      />

      {/* Core */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1], 
          boxShadow: [`0 0 10px ${color}40`, `0 0 30px ${color}80`, `0 0 10px ${color}40`] 
        }}
        transition={{ duration: duration, repeat: Infinity }}
        className="w-8 h-8 rounded-full z-10 backdrop-blur-sm border border-white/20"
        style={{ backgroundColor: color }}
      >
        <div className="w-full h-full flex items-center justify-center">
            <span className="text-[8px] font-bold text-black">{Math.round(vks)}</span>
        </div>
      </motion.div>
      
      {/* Ripple 1 */}
      <motion.div
        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
        transition={{ duration: duration * 1.5, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-8 h-8 rounded-full border-[1px]"
        style={{ borderColor: color }}
      />
      
      {/* Ripple 2 */}
       <motion.div
        animate={{ scale: [1, 3.5], opacity: [0.4, 0] }}
        transition={{ duration: duration * 1.5, repeat: Infinity, delay: duration * 0.3, ease: "easeOut" }}
        className="absolute w-8 h-8 rounded-full border-[1px] border-dashed"
        style={{ borderColor: color }}
      />
      
      {/* Ripple 3 (High Intensity Only) */}
      {isHigh && (
        <motion.div
            animate={{ scale: [1, 5], opacity: [0.2, 0] }}
            transition={{ duration: duration * 1.5, repeat: Infinity, delay: duration * 0.6, ease: "easeOut" }}
            className="absolute w-8 h-8 rounded-full border-[2px]"
            style={{ borderColor: color }}
        />
      )}
    </div>
  );
}