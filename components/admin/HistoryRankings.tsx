/**
 * HistoryRankings - 历史排名组件
 * 
 * 显示过去2小时内各平台的得分排名
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, Crown, Medal, Award, RefreshCw, Clock,
    Twitter, Video, MessageCircle, Linkedin, Youtube, Instagram, Facebook,
    TrendingUp, Zap, Activity, BarChart3
} from 'lucide-react';

// 在开发环境下使用代理（空字符串），生产环境使用完整 URL
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? ""  // 开发环境使用 Vite 代理
  : (import.meta.env?.VITE_BACKEND_URL || "http://localhost:8000");

interface RankedItem {
    id: string;
    timestamp: string;
    platform: string;
    hashtag: string;
    trend_score: number;
    dimensions: {
        H: number;
        V: number;
        D: number;
        F: number;
        M: number;
        R: number;
    };
    author: string;
    description: string;
    rank: number;
    lifecycle: string;
    priority: string;
}

interface HistoryStats {
    total_records: number;
    retention_hours: number;
    platforms: Record<string, number>;
    average_scores: Record<string, number>;
}

// 平台图标映射
const PLATFORM_ICONS: Record<string, React.ElementType> = {
    'X': Twitter,
    'TWITTER': Twitter,
    'TIKTOK': Video,
    'REDDIT': MessageCircle,
    'LINKEDIN': Linkedin,
    'YOUTUBE': Youtube,
    'INSTAGRAM': Instagram,
    'FACEBOOK': Facebook,
};

// 平台颜色映射
const PLATFORM_COLORS: Record<string, string> = {
    'X': 'bg-black text-white',
    'TWITTER': 'bg-black text-white',
    'TIKTOK': 'bg-[#ff0050]/20 text-[#ff0050]',
    'REDDIT': 'bg-[#ff4500]/20 text-[#ff4500]',
    'LINKEDIN': 'bg-[#0077b5]/20 text-[#0077b5]',
    'YOUTUBE': 'bg-[#ff0000]/20 text-[#ff0000]',
    'INSTAGRAM': 'bg-[#e1306c]/20 text-[#e1306c]',
    'FACEBOOK': 'bg-[#1877f2]/20 text-[#1877f2]',
};

export function HistoryRankings() {
    const [rankings, setRankings] = useState<Record<string, { records: RankedItem[]; total: number }>>({});
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rankingsRes, statsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/history/rankings?top_n=20`),
                fetch(`${BACKEND_URL}/api/history/stats`)
            ]);

            if (rankingsRes.ok) {
                const data = await rankingsRes.json();
                setRankings(data);
            }

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            setLastUpdated(new Date());
        } catch (e) {
            console.error('[HistoryRankings] Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // 获取当前显示的排名数据
    const getCurrentRankings = (): RankedItem[] => {
        if (selectedPlatform === 'ALL') {
            return (Object.values(rankings) as Array<{ records: RankedItem[]; total: number }>)
                .flatMap(p => p.records || [])
                .sort((a, b) => b.trend_score - a.trend_score)
                .slice(0, 30)
                .map((item, index) => ({ ...item, rank: index + 1 }));
        }
        return rankings[selectedPlatform]?.records || [];
    };

    const currentRankings = getCurrentRankings();
    const platforms = ['ALL', ...Object.keys(rankings)];

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown size={16} className="text-yellow-400" />;
        if (rank === 2) return <Medal size={16} className="text-slate-300" />;
        if (rank === 3) return <Award size={16} className="text-amber-600" />;
        return <span className="text-xs font-mono text-slate-500">#{rank}</span>;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-spark';
        if (score >= 60) return 'text-purple-400';
        if (score >= 40) return 'text-pulse';
        return 'text-slate-400';
    };

    return (
        <div className="h-full flex flex-col bg-card/30 backdrop-blur border border-white/5 rounded overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-yellow-500" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                            历史排名 (过去2小时)
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            {stats && (
                                <>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        总记录: {stats.total_records}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        平台: {Object.keys(stats.platforms).length}
                                    </span>
                                </>
                            )}
                            {lastUpdated && (
                                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <Clock size={10} />
                                    {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-pulse/10 hover:bg-pulse/20 text-pulse border border-pulse/30 rounded text-xs font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    刷新
                </button>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 p-3 border-b border-white/5 overflow-x-auto no-scrollbar">
                {platforms.map(platform => {
                    const Icon = PLATFORM_ICONS[platform] || BarChart3;
                    const count = platform === 'ALL' 
                        ? (Object.values(rankings) as Array<{ records: RankedItem[]; total: number }>).reduce((sum, p) => sum + (p?.total || 0), 0)
                        : rankings[platform]?.total || 0;
                    
                    return (
                        <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                selectedPlatform === platform
                                    ? 'bg-pulse text-black'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <Icon size={14} />
                            {platform}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                selectedPlatform === platform ? 'bg-black/20' : 'bg-white/10'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Stats Bar */}
            {stats && selectedPlatform !== 'ALL' && stats.average_scores[selectedPlatform] && (
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-pulse" />
                        <span className="text-[10px] text-slate-400">平均分:</span>
                        <span className={`text-sm font-bold ${getScoreColor(stats.average_scores[selectedPlatform])}`}>
                            {stats.average_scores[selectedPlatform].toFixed(1)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-green-400" />
                        <span className="text-[10px] text-slate-400">记录数:</span>
                        <span className="text-sm font-bold text-slate-200">
                            {stats.platforms[selectedPlatform] || 0}
                        </span>
                    </div>
                </div>
            )}

            {/* Rankings Table */}
            <div className="flex-1 overflow-auto">
                {loading && currentRankings.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <RefreshCw size={24} className="animate-spin text-pulse mx-auto mb-2" />
                            <span className="text-sm text-slate-500">加载排名数据...</span>
                        </div>
                    </div>
                ) : currentRankings.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Trophy size={32} className="text-slate-600 mx-auto mb-2" />
                            <span className="text-sm text-slate-500">暂无排名数据</span>
                            <p className="text-[10px] text-slate-600 mt-1">等待数据流入...</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#0d1220] z-10">
                            <tr className="border-b border-white/10 text-[10px] uppercase font-mono text-slate-500">
                                <th className="py-2 px-4 w-16">排名</th>
                                <th className="py-2 px-4">话题</th>
                                <th className="py-2 px-4">平台</th>
                                <th className="py-2 px-4 text-center">得分</th>
                                <th className="py-2 px-4">维度</th>
                                <th className="py-2 px-4">时间</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentRankings.map((item, idx) => {
                                const PlatformIcon = PLATFORM_ICONS[item.platform] || Activity;
                                const platformStyle = PLATFORM_COLORS[item.platform] || 'bg-slate-800 text-slate-400';
                                
                                return (
                                    <motion.tr
                                        key={`${item.platform}-${item.id}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center w-8 h-8">
                                                {getRankBadge(item.rank)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-sm text-slate-200">
                                                {item.hashtag}
                                            </div>
                                            {item.description && (
                                                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                                    {item.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${platformStyle}`}>
                                                <PlatformIcon size={12} />
                                                <span className="text-[10px] font-bold">{item.platform}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`text-xl font-black font-mono ${getScoreColor(item.trend_score)}`}>
                                                {Math.round(item.trend_score)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-1 text-[9px] font-mono">
                                                <span className="text-red-400">H:{item.dimensions?.H?.toFixed(0) || 0}</span>
                                                <span className="text-green-400">V:{item.dimensions?.V?.toFixed(0) || 0}</span>
                                                <span className="text-blue-400">D:{item.dimensions?.D?.toFixed(0) || 0}</span>
                                            </div>
                                            <div className="flex gap-1 text-[9px] font-mono mt-0.5">
                                                <span className="text-yellow-400">F:{item.dimensions?.F?.toFixed(0) || 0}</span>
                                                <span className="text-purple-400">M:{item.dimensions?.M?.toFixed(0) || 0}</span>
                                                <span className="text-pink-400">R:{item.dimensions?.R?.toFixed(0) || 0}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
