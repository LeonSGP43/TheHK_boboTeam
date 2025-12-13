import React from 'react';
import { motion } from 'framer-motion';

interface BreathingCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  theme: string; // Hex color for the glow/border
  intensity?: 'low' | 'strong';
  className?: string;
}

const BreathingCard: React.FC<BreathingCardProps> = ({ 
  children, 
  onClick, 
  theme, 
  intensity = 'low', 
  className = '' 
}) => {
  const isStrong = intensity === 'strong';

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        // Dynamic box shadow based on theme color
        boxShadow: isStrong 
          ? `0 0 15px ${theme}40, inset 0 0 10px ${theme}10` 
          : `0 0 0px ${theme}00` 
      }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: `0 0 25px ${theme}30, inset 0 0 5px ${theme}20`,
        borderColor: theme
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        relative p-4 rounded-sm border cursor-pointer overflow-hidden backdrop-blur-md
        bg-[#050505]/90 border-slate-900 transition-colors
        ${className}
      `}
      style={{
        borderColor: isStrong ? theme : undefined,
        borderLeftWidth: isStrong ? '4px' : '1px',
        borderLeftColor: isStrong ? theme : undefined
      }}
    >
      {/* Subtle scanline effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-20 pointer-events-none bg-[length:100%_4px,3px_100%]" />
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

export default BreathingCard;