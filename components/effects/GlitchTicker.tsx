import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface Props {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function GlitchTicker({ value, prefix = "", decimals = 2, className = "" }: Props) {
  const spring = useSpring(value, { mass: 0.5, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => 
    prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );

  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    spring.set(value);
    // Trigger glitch on update
    setIsGlitching(true);
    const timeout = setTimeout(() => setIsGlitching(false), 300);
    return () => clearTimeout(timeout);
  }, [value, spring]);

  return (
    <div className="relative inline-block">
      <motion.span 
        className={`${className} relative z-10`}
        animate={isGlitching ? {
           textShadow: [
             "2px 0px 2px rgba(255,0,0,0.5), -2px 0px 2px rgba(0,212,255,0.5)",
             "-2px 0px 2px rgba(255,0,0,0.5), 2px 0px 2px rgba(0,212,255,0.5)",
             "0px 0px 0px transparent"
           ],
           x: [0, -2, 2, 0],
           color: ["#ffffff", "#00d4ff", "#ffffff"]
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {display}
      </motion.span>
      
      {/* Ghost Glitch Layer */}
      {isGlitching && (
        <motion.span
          className={`${className} absolute top-0 left-0 opacity-50 pointer-events-none text-spark`}
          initial={{ clipPath: 'inset(50% 0 0 0)', x: -2 }}
          animate={{ x: 2, clipPath: 'inset(0 0 50% 0)' }}
          exit={{ opacity: 0 }}
        >
          {display}
        </motion.span>
      )}
    </div>
  );
}