
import React from 'react';
import { TrendItem } from '../types';
import { Twitter, Linkedin, Video, MessageCircle, Instagram, Zap, ShieldAlert, Facebook, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  trend: TrendItem;
  variant: 'trending' | 'agent' | 'risk';
  onClick: (trend: TrendItem) => void;
  isSelected: boolean;
}

const COLORS = {
  PULSE: '#00F0FF',
  SPARK: '#FF7E5F',
  SURGE: '#BD00FF'
};

const TrendListItem: React.FC<Props> = ({ trend, variant, onClick, isSelected }) => {
  
  const renderPlatformIcon = (p: string) => {
    const lower = (p || '').toLowerCase();
    const props = { size: 12, className: "text-slate-500" };
    if (lower.includes('x')) return <Twitter key={p} {...props} />;
    if (lower.includes('linkedin')) return <Linkedin key={p} {...props} />;
    if (lower.includes('tiktok')) return <Video key={p} {...props} />;
    if (lower.includes('instagram')) return <Instagram key={p} {...props} />;
    if (lower.includes('facebook')) return <Facebook key={p} {...props} />;
    return <MessageCircle key={p} {...props} />;
  };

  const baseClasses = `
    relative p-5 rounded-2xl border cursor-pointer transition-all duration-500
    ${isSelected 
        ? 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] z-10 translate-x-2' 
        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10 hover:translate-x-1'
    }
  `;

  if (variant === 'trending') {
      const score = trend.trendScore || 0;
      let scoreColor = '#94a3b8';
      if (score >= 90) scoreColor = COLORS.SPARK;
      else if (score >= 75) scoreColor = COLORS.SURGE;
      else if (score >= 50) scoreColor = COLORS.PULSE;

      return (
        <motion.div 
            onClick={() => onClick(trend)}
            className={baseClasses}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex justify-between items-center mb-3">
                 <div className="flex gap-2">
                    {(trend.platforms || []).slice(0, 3).map(renderPlatformIcon)}
                 </div>
                 {trend.agentReady && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 )}
            </div>

            <h4 className={`text-sm font-bold leading-snug transition-colors mb-4 ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {trend.topic}
            </h4>

            {/* Capsule Score Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-black/10 dark:bg-black/30 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className="h-full rounded-full neon-capsule"
                        style={{ backgroundColor: scoreColor, color: scoreColor }}
                    />
                </div>
                <span className="text-xs font-black font-mono" style={{ color: scoreColor }}>{score}</span>
            </div>
            
            {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-zinc-900 dark:bg-white rounded-r-full shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_white]" />}
        </motion.div>
      );
  }

  if (variant === 'agent') {
      return (
        <motion.div onClick={() => onClick(trend)} className={baseClasses} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{trend.agentType || 'TOOL'}</span>
                 <Zap size={12} className="text-green-500" />
             </div>
             <h4 className={`text-sm font-bold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{trend.topic}</h4>
             {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full shadow-[0_0_10px_#22c55e]" />}
        </motion.div>
      );
  }

  if (variant === 'risk') {
    return (
      <motion.div onClick={() => onClick(trend)} className={baseClasses} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
           <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">HIGH RISK</span>
               <ShieldAlert size={12} className="text-red-500" />
           </div>
           <h4 className={`text-sm font-bold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{trend.topic}</h4>
           {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full shadow-[0_0_10px_#ef4444]" />}
      </motion.div>
    );
  }

  return null;
};

export default TrendListItem;
