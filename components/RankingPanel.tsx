/**
 * RankingPanel - 排名面板组件
 * 
 * 显示各平台的趋势排名，按分数从高到低排列
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, TrendingUp, Crown, Medal, Award,
    Twitter, Video, Youtube, Instagram,
    ChevronDown, ChevronUp, Zap, Activity
} from 'lucide-react';
// 注意：移除了 MessageCircle, Linkedin, Facebook，因为这些平台没有数据
import { RankedItem } from '../hooks/useRankings';

interface PlatformRankingData {
    records: RankedItem[];
    total: number;
}

interface RankingPanelProps {
    rankings: Record<string, PlatformRankingData>;
    activePlatform: string;
    onSelectItem?: (item: RankedItem) => void;
}

// 平台图标映射（只保留有数据的平台）
const PLATFORM_ICONS: { [key: string]: React.ElementType } = {
    'X': Twitter,
    'TWITTER': Twitter,
    'TIKTOK': Video,
    'YOUTUBE': Youtube,
    'INSTAGRAM': Instagram,
};

// 平台颜色映射（只保留有数据的平台）
const PLATFORM_COLORS: { [key: string]: string } = {
    'X': 'text-white',
    'TWITTER': 'text-white',
    'TIKTOK': 'text-[#ff0050]',
    'YOUTUBE': 'text-[#ff0000]',
    'INSTAGRAM': 'text-[#e1306c]',
};

// 排名徽章组件
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Crown size={16} className="text-white" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-400/30">
                <Medal size={16} className="text-white" />
            </div>
        );
    }
    if (rank === 3) {
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-600/30">
                <Award size={16} className="text-white" />
            </div>
        );
    }
    return (
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-xs font-bold text-slate-400">{rank}</span>
        </div>
    );
};

// 分数条组件
const ScoreBar: React.FC<{ score: number; maxScore?: number }> = ({ score, maxScore = 100 }) => {
    const percentage = Math.min((score / maxScore) * 100, 100);
    
    const getColor = () => {
        if (score >= 80) return 'from-spark to-orange-500';
        if (score >= 60) return 'from-purple-500 to-pink-500';
        if (score >= 40) return 'from-pulse to-cyan-400';
        return 'from-slate-500 to-slate-600';
    };
    
    return (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                className={`h-full bg-gradient-to-r ${getColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
        </div>
    );
};

// 单个排名项组件
const RankingItem: React.FC<{ 
    item: RankedItem; 
    onClick?: () => void;
    showPlatform?: boolean;
}> = ({ item, onClick, showPlatform = false }) => {
    const PlatformIcon = PLATFORM_ICONS[item.platform] || Activity;
    const platformColor = PLATFORM_COLORS[item.platform] || 'text-slate-400';
    
    // 提取显示标题：优先使用 title，其次 description
    const displayTitle = (() => {
        // 优先使用 title 字段
        if (item.title && item.title.length > 0) {
            const title = item.title.slice(0, 60);
            return title.length < item.title.length ? `${title}...` : title;
        }
        // 其次使用 description
        if (item.description && item.description.length > 0) {
            const desc = item.description.slice(0, 60);
            return desc.length < item.description.length ? `${desc}...` : desc;
        }
        // 最后使用 hashtag
        return item.hashtag || 'Unknown';
    })();
    
    // 显示作者信息
    const authorInfo = item.author && item.author !== 'unknown' ? `@${item.author}` : null;
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group p-3 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                {/* 排名徽章 */}
                <RankBadge rank={item.rank} />
                
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white truncate" title={item.description}>
                            {displayTitle}
                        </span>
                        {showPlatform && (
                            <PlatformIcon size={14} className={platformColor} />
                        )}
                        {item.priority === 'P1' && (
                            <Zap size={12} className="text-spark animate-pulse" />
                        )}
                    </div>
                    
                    {/* 显示 hashtag 和作者 */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-pulse font-medium">
                            {item.hashtag}
                        </span>
                        {authorInfo && (
                            <span className="text-[10px] text-slate-500">
                                {authorInfo}
                            </span>
                        )}
                    </div>
                    
                    <ScoreBar score={item.trend_score} />
                </div>
                
                {/* 分数 */}
                <div className="text-right shrink-0">
                    <span className={`text-lg font-bold ${
                        item.trend_score >= 80 ? 'text-spark' : 
                        item.trend_score >= 60 ? 'text-purple-400' : 
                        'text-pulse'
                    }`}>
                        {Math.round(item.trend_score)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">SCORE</span>
                </div>
            </div>
            
            {/* 维度指标（悬停显示） */}
            <div className="mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2 text-[9px] font-mono">
                    <span className="text-red-400">H:{item.dimensions?.H?.toFixed(0) || 0}</span>
                    <span className="text-green-400">V:{item.dimensions?.V?.toFixed(0) || 0}</span>
                    <span className="text-blue-400">D:{item.dimensions?.D?.toFixed(0) || 0}</span>
                    <span className="text-yellow-400">F:{item.dimensions?.F?.toFixed(0) || 0}</span>
                    <span className="text-purple-400">M:{item.dimensions?.M?.toFixed(0) || 0}</span>
                    <span className="text-pink-400">R:{item.dimensions?.R?.toFixed(0) || 0}</span>
                </div>
            </div>
        </motion.div>
    );
};

export const RankingPanel: React.FC<RankingPanelProps> = ({ 
    rankings, 
    activePlatform,
    onSelectItem 
}) => {
    const [expanded, setExpanded] = useState(true);
    
    // 获取当前平台的排名数据
    const currentRankings: RankedItem[] = (() => {
        if (!rankings || typeof rankings !== 'object') {
            return [];
        }
        
        if (activePlatform === 'ALL') {
            const allRecords = Object.values(rankings)
                .filter((p): p is PlatformRankingData => 
                    p != null && typeof p === 'object' && Array.isArray((p as any).records)
                )
                .flatMap(p => p.records || [])
                .filter((item): item is RankedItem => item != null && item.trend_score !== undefined)
                .sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0))
                .slice(0, 20)
                .map((item, index) => ({ ...item, rank: index + 1 }));
            return allRecords;
        }
        
        const platformData = rankings[activePlatform];
        if (platformData && Array.isArray(platformData.records)) {
            return platformData.records;
        }
        return [];
    })();
    
    if (currentRankings.length === 0) {
        return (
            <div className="p-6 text-center">
                <Trophy size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">No ranking data yet</p>
                <p className="text-[10px] text-slate-600 mt-1">Waiting for data stream...</p>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            {/* 标题栏 */}
            <div 
                className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-sm font-bold text-white">
                        {activePlatform === 'ALL' ? 'Global Ranking' : `${activePlatform} Ranking`}
                    </span>
                    <span className="text-[10px] bg-pulse/20 text-pulse px-2 py-0.5 rounded-full">
                        TOP {currentRankings.length}
                    </span>
                </div>
                {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </div>
            
            {/* 排名列表 */}
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex-1 overflow-y-auto p-3 space-y-2"
                    >
                        {currentRankings.map((item, index) => (
                            <RankingItem 
                                key={`${item.platform}-${item.id}-${index}`}
                                item={item}
                                showPlatform={activePlatform === 'ALL'}
                                onClick={() => onSelectItem?.(item)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RankingPanel;
