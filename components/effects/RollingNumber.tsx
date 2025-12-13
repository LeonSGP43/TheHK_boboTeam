import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface Props {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function RollingNumber({ value, prefix = "", decimals = 2, className = "" }: Props) {
  const spring = useSpring(value, { mass: 0.5, stiffness: 75, damping: 15 });
  
  // Transform the spring value into a formatted string
  const display = useTransform(spring, (current) => 
    prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}