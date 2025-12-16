
import React from 'react';
import { motion } from 'framer-motion';

export interface BreathingCardProps {
  children?: React.ReactNode;
  onClick?: () => void;
  theme: string; // Hex color for the glow/border
  intensity?: 'low' | 'strong';
  className?: string;
}

export const BreathingCard: React.FC<BreathingCardProps> = ({ 
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isStrong 
          ? `0 20px 40px -10px ${theme}30, 0 0 20px ${theme}10 inset` // Deep ambient glow
          : `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
      }}
      whileHover={{ 
        y: -4,
        scale: 1.005,
        boxShadow: `0 25px 50px -12px ${theme}40, 0 0 30px ${theme}20 inset`,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Apple-like spring easing
      className={`
        relative p-5 rounded-2xl cursor-pointer overflow-hidden
        bg-white/5 dark:bg-[#121212]/60 backdrop-blur-xl
        border border-white/10 hover:border-white/20
        transition-colors
        ${className}
      `}
      style={{
        borderColor: isStrong ? `${theme}60` : undefined,
      }}
    >
      {/* Top Highlight (Simulated light reflection) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
      
      {/* Background Gradient Blob for Atmosphere */}
      {isStrong && (
          <div 
            className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: theme }}
          />
      )}
    </motion.div>
  );
};
export default BreathingCard;
