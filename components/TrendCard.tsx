import React from 'react';
import { TrendItem } from '../types';
import { TrendingUp, TrendingDown, Minus, Twitter, Linkedin, Video, MessageCircle, Instagram } from 'lucide-react';
import { TrendLine } from './effects/TrendLine';
import { BreathingCard } from './effects/BreathingCard';

interface Props {
  trend: TrendItem;
  onClick: (trend: TrendItem) => void;
  isSelected: boolean;
}

// Cyberpunk Color System Definition
const COLORS = {
  PULSE: '#00d4ff', // Positive / Cyan
  SPARK: '#ff6b35', // Negative / Orange-Red
  ALPHA: '#ffd700', // Neutral / Gold
};

const TrendCard: React.FC<Props> = ({ trend, onClick, isSelected }) => {
  // 1. Color Logic
  let themeColor = COLORS.ALPHA;
  if (trend.sentiment === 'positive') themeColor = COLORS.PULSE;
  if (trend.sentiment === 'negative') themeColor = COLORS.SPARK;

  // 2. Icon Helper
  const renderPlatformIcon = (p: string) => {
    const lower = (p || '').toLowerCase();
    const props = { size: 12, className: "text-slate-500" };
    
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter key={p} {...props} />;
    if (lower.includes('linkedin')) return <Linkedin key={p} {...props} />;
    if (lower.includes('tiktok')) return <Video key={p} {...props} />;
    if (lower.includes('instagram') || lower.includes('ig')) return <Instagram key={p} {...props} />;
    return <MessageCircle key={p} {...props} />;
  };

  return (
    <BreathingCard
      onClick={() => onClick(trend)}
      theme={themeColor}
      intensity={isSelected ? 'strong' : 'low'}
      className="mb-3 group min-h-[140px]"
    >
      {/* Decorative Cyberpunk Corner */}
      <div 
        className="absolute top-0 right-0 w-3 h-3 border-t border-r opacity-60 transition-colors" 
        style={{ borderColor: themeColor }} 
      />

      {/* Header: Category & Velocity */}
      <div className="flex justify-between items-start mb-2">
        <span 
          className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono" 
          style={{ color: themeColor }}
        >
          {trend.category}
        </span>
        <div 
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded border border-slate-800"
          style={{ color: themeColor, borderColor: isSelected ? themeColor : undefined }}
        >
          {trend.sentiment === 'positive' && <TrendingUp size={10} />}
          {trend.sentiment === 'negative' && <TrendingDown size={10} />}
          {trend.sentiment === 'neutral' && <Minus size={10} />}
          {Math.abs(trend.velocity)}%
        </div>
      </div>

      {/* Body: Topic */}
      <h3 className="text-sm font-bold text-slate-100 mb-1 leading-snug font-mono group-hover:text-white transition-colors">
        {trend.topic}
      </h3>
      
      {/* Summary */}
      <p className="text-[10px] text-slate-500 mb-6 line-clamp-2 border-l border-slate-800 pl-2">
        {trend.summary}
      </p>

      {/* Chart: TrendLine Upgrade */}
      {/* Positioned absolutely at bottom for that "data underlay" look */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none mix-blend-screen">
        <TrendLine data={trend.history || []} color={themeColor} />
      </div>

      {/* Footer: Platforms & Volume */}
      <div className="flex justify-between items-end mt-auto border-t border-slate-800/50 pt-2 relative z-10">
        <div className="flex gap-1.5">
          {(trend.platforms || []).map(renderPlatformIcon)}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <TrendingUp size={10} style={{ color: themeColor }} />
          <span>{(trend.volume / 1000).toFixed(1)}k</span>
        </div>
      </div>
    </BreathingCard>
  );
};

export default TrendCard;