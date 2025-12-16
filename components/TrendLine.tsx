
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  data: number[];
  color: string; // Hex code
}

const TrendLine: React.FC<Props> = ({ data = [], color }) => {
  if (!data || data.length === 0) return null;

  // Format history data for Recharts
  const chartData = data.map((val, i) => ({ i, val }));
  
  // Create a unique ID for the gradient to prevent conflicts
  const gradientId = `grad-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={chartData}>
           <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
          </defs>
          <Area 
              type="monotone" 
              dataKey="val" 
              stroke={color} 
              strokeWidth={2} 
              fill={`url(#${gradientId})`} 
              isAnimationActive={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendLine;
