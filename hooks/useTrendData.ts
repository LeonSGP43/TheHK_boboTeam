import { useState, useEffect } from 'react';

export interface VKSDataPoint {
  time: string;
  vks: number;
  velocity: number;
  acceleration: number;
}

export const useTrendData = () => {
  const [data, setData] = useState<VKSDataPoint[]>([]);
  const [currentVKS, setCurrentVKS] = useState(0);

  useEffect(() => {
    // Initialize with some history
    const initialData: VKSDataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      initialData.push({
        time: new Date(now - i * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        vks: 45 + Math.random() * 10,
        velocity: 40,
        acceleration: 0
      });
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1];
        
        // Simulate Physics
        // Acceleration fluctuates randomly
        const newAccel = Math.max(-5, Math.min(5, last.acceleration + (Math.random() - 0.5) * 2));
        
        // Velocity responds to acceleration
        let newVel = last.velocity + newAccel;
        newVel = Math.max(10, Math.min(100, newVel)); // Clamp velocity

        // VKS Calculation: Velocity + (Acceleration * Impact Factor)
        // High acceleration adds a "Kick" to the score
        let newVKS = newVel + (newAccel * 5);
        
        // Add random noise spike occasionally
        if (Math.random() > 0.9) newVKS += 15;

        // Smooth smoothing
        newVKS = Math.max(0, (last.vks * 0.7) + (newVKS * 0.3));

        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          vks: Math.round(newVKS),
          velocity: Math.round(newVel),
          acceleration: parseFloat(newAccel.toFixed(2))
        };
        
        setCurrentVKS(Math.round(newVKS));

        // Keep last 60 seconds
        const newData = [...prev, newPoint];
        if (newData.length > 60) newData.shift();
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, currentVKS };
};