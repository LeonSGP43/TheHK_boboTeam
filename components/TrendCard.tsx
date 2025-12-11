
import React from 'react';
import { TrendItem } from '../types';
import { TrendingUp, Twitter, Linkedin, Video, MessageCircle, Instagram } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  trend: TrendItem;
  onClick: (trend: TrendItem) => void;
  isSelected: boolean;
}

const TrendCard: React.FC<Props> = ({ trend, onClick, isSelected }) => {
  // Format history data for Recharts, guard against undefined history
  const chartData = (trend.history || []).map((val, i) => ({ i, val }));
  const isPositive = trend.sentiment === 'positive';
  const color = isPositive ? '#4ade80' : trend.sentiment === 'negative' ? '#f87171' : '#94a3b8';

  // Guard against undefined platforms
  const platforms = Array.isArray(trend.platforms) ? trend.platforms : [];

  return (
    <div 
      onClick={() => onClick(trend)}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden
        ${isSelected 
            ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
      `}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{trend.category}</span>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-400' : trend.sentiment === 'negative' ? 'text-red-400' : 'text-slate-400'}`}>
           {isPositive ? '▲' : trend.sentiment === 'negative' ? '▼' : '●'} {trend.velocity}%
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors relative z-10">
        {trend.topic}
      </h3>
      
      <p className="text-slate-400 text-sm mb-4 line-clamp-2 relative z-10">
        {trend.summary}
      </p>

      {/* Sparkline Chart */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData}>
             <defs>
                <linearGradient id={`grad-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <Area 
                type="monotone" 
                dataKey="val" 
                stroke={color} 
                strokeWidth={2} 
                fill={`url(#grad-${trend.id})`} 
                isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 relative z-10">
        <div className="flex gap-2">
            {platforms.map(p => {
                const lowerP = (p || '').toLowerCase();
                if (lowerP.includes('twitter') || lowerP.includes('x')) return <Twitter key={p} size={14} className="text-slate-400" />;
                if (lowerP.includes('linkedin')) return <Linkedin key={p} size={14} className="text-slate-400" />;
                if (lowerP.includes('tiktok')) return <Video key={p} size={14} className="text-slate-400" />;
                if (lowerP.includes('instagram') || lowerP.includes('ig')) return <Instagram key={p} size={14} className="text-slate-400" />;
                return <MessageCircle key={p} size={14} className="text-slate-400" />;
            })}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
            <TrendingUp size={12} />
            <span>{trend.volume.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;
