
import React from 'react';
import { TrendItem } from '../types';
import { Twitter, Linkedin, Video, MessageCircle, Instagram, Zap, AlertTriangle, ShieldAlert, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  trend: TrendItem;
  variant: 'trending' | 'agent' | 'risk';
  onClick: (trend: TrendItem) => void;
  isSelected: boolean;
}

const COLORS = {
  PULSE: '#00d4ff',
  SPARK: '#ff6b35',
  ALPHA: '#ffd700',
  SURGE: '#a855f7'
};

const TrendListItem: React.FC<Props> = ({ trend, variant, onClick, isSelected }) => {
  
  // Icon Helper
  const renderPlatformIcon = (p: string) => {
    const lower = (p || '').toLowerCase();
    const props = { size: 10, className: "text-slate-400 opacity-70" };
    
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter key={p} {...props} />;
    if (lower.includes('linkedin')) return <Linkedin key={p} {...props} />;
    if (lower.includes('tiktok')) return <Video key={p} {...props} />;
    if (lower.includes('instagram') || lower.includes('ig')) return <Instagram key={p} {...props} />;
    if (lower.includes('facebook') || lower.includes('fb')) return <Facebook key={p} {...props} />;
    return <MessageCircle key={p} {...props} />;
  };

  const baseClasses = `
    relative p-3 mb-2 rounded border cursor-pointer transition-all duration-300
    ${isSelected 
        ? 'bg-pulse/10 border-pulse/30 dark:bg-white/5 dark:border-pulse/30' 
        : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10'
    }
  `;

  const textColor = isSelected ? 'text-black dark:text-white' : 'text-slate-700 dark:text-slate-200';
  const subTextColor = 'text-slate-500';

  if (variant === 'trending') {
      const scoreColor = (trend.trendScore || 0) > 80 ? COLORS.SPARK : COLORS.PULSE;
      return (
        <motion.div 
            onClick={() => onClick(trend)}
            className={`${baseClasses} flex items-center justify-between group`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex flex-col gap-0.5 max-w-[70%]">
                <span className={`text-xs font-bold truncate transition-colors ${textColor}`}>
                    {trend.topic}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="flex gap-1">
                        {(trend.platforms || []).slice(0, 3).map(renderPlatformIcon)}
                    </span>
                    {trend.agentReady && (
                        <div className="flex items-center gap-0.5 px-1 rounded bg-green-500/10 text-[8px] font-bold text-green-600 dark:text-green-500 border border-green-500/20">
                            <Zap size={8} /> READY
                        </div>
                    )}
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-black font-mono leading-none" style={{ color: scoreColor }}>
                    {trend.trendScore || 0}
                </div>
                <span className="text-[8px] uppercase font-mono text-slate-400">Score</span>
            </div>
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-pulse" />}
        </motion.div>
      );
  }

  if (variant === 'agent') {
      return (
        <motion.div 
            onClick={() => onClick(trend)}
            className={`${baseClasses} group`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
             <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold truncate transition-colors ${textColor}`}>
                    {trend.topic}
                </span>
             </div>
             <div className="flex items-center gap-2">
                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                     trend.agentType === 'portrait' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                     trend.agentType === 'filter' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                     'bg-slate-500/10 text-slate-500 border-slate-500/20'
                 }`}>
                     <Zap size={8} fill="currentColor" />
                     {trend.agentType || 'TOOL'}
                 </span>
                 <span className="text-[8px] text-slate-500 font-mono">
                     Est. 2d
                 </span>
             </div>
             {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />}
        </motion.div>
      );
  }

  if (variant === 'risk') {
    return (
      <motion.div 
          onClick={() => onClick(trend)}
          className={`${baseClasses} group`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
      >
           <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-bold truncate transition-colors ${textColor}`}>
                  {trend.topic}
              </span>
           </div>
           <div className="flex items-center gap-2 mt-1">
               <div className="flex items-center gap-1 text-[9px] font-mono text-red-500">
                   <ShieldAlert size={10} />
                   IP: {trend.riskLevel?.toUpperCase()}
               </div>
               <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
               <div className="flex items-center gap-1 text-[9px] font-mono text-orange-500">
                   <AlertTriangle size={10} />
                   SAT: {trend.saturation?.toUpperCase()}
               </div>
           </div>
           {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />}
      </motion.div>
    );
}

  return null;
};

export default TrendListItem;
