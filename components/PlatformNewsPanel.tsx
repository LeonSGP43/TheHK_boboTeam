/**
 * Platform News Panel
 * Displays LinkedIn and Facebook trending news
 */

import React, { useState, useEffect } from 'react';
import { Linkedin, Facebook, ExternalLink, TrendingUp, MessageCircle, Heart, Share2, RefreshCw } from 'lucide-react';
import { getCachedPlatformNews, preloadPlatformNews } from '../services/platformNewsCache';
import { PlatformNewsItem } from '../services/geminiService';

interface Props {
    className?: string;
}

export function PlatformNewsPanel({ className = '' }: Props) {
    const [news, setNews] = useState<PlatformNewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'LinkedIn' | 'Facebook'>('all');

    useEffect(() => {
        // 获取缓存的数据
        const cached = getCachedPlatformNews();
        if (cached.length > 0) {
            setNews(cached);
        }
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const freshNews = await preloadPlatformNews();
            setNews(freshNews);
        } catch (e) {
            console.error('Failed to refresh news:', e);
        } finally {
            setLoading(false);
        }
    };

    const filteredNews = activeFilter === 'all' 
        ? news 
        : news.filter(item => item.platform === activeFilter);

    const getPlatformIcon = (platform: string) => {
        return platform === 'LinkedIn' 
            ? <Linkedin size={14} className="text-[#0077b5]" />
            : <Facebook size={14} className="text-[#1877f2]" />;
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-400';
            case 'negative': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    if (news.length === 0) {
        return (
            <div className={`bg-card/30 backdrop-blur border border-white/5 rounded-xl p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={14} className="text-pulse" />
                        Platform News
                    </h3>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin text-pulse' : 'text-slate-400'} />
                    </button>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">No platform news available</p>
                    <button 
                        onClick={handleRefresh}
                        className="mt-2 text-xs text-pulse hover:underline"
                    >
                        Click to load
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-card/30 backdrop-blur border border-white/5 rounded-xl ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={14} className="text-pulse" />
                        Platform News
                    </h3>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin text-pulse' : 'text-slate-400'} />
                    </button>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(['all', 'LinkedIn', 'Facebook'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                activeFilter === filter
                                    ? 'bg-pulse/20 text-pulse border border-pulse/30'
                                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                            }`}
                        >
                            {filter === 'LinkedIn' && <Linkedin size={12} />}
                            {filter === 'Facebook' && <Facebook size={12} />}
                            {filter === 'all' ? 'All' : filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* News List */}
            <div className="max-h-[400px] overflow-y-auto">
                {filteredNews.map((item, index) => (
                    <div 
                        key={item.id || index}
                        className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {getPlatformIcon(item.platform)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                                        #{item.tag}
                                    </span>
                                    <span className={`text-[10px] ${getSentimentColor(item.sentiment)}`}>
                                        {item.sentiment}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        Score: {item.relevanceScore}
                                    </span>
                                </div>
                                
                                <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">
                                    {item.title}
                                </h4>
                                
                                <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                    {item.summary}
                                </p>
                                
                                {/* Engagement Stats */}
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                    {item.engagement?.likes !== undefined && item.engagement.likes > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Heart size={10} />
                                            {item.engagement.likes.toLocaleString()}
                                        </span>
                                    )}
                                    {item.engagement?.comments !== undefined && item.engagement.comments > 0 && (
                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={10} />
                                            {item.engagement.comments.toLocaleString()}
                                        </span>
                                    )}
                                    {item.engagement?.shares !== undefined && item.engagement.shares > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Share2 size={10} />
                                            {item.engagement.shares.toLocaleString()}
                                        </span>
                                    )}
                                    {item.url && (
                                        <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-pulse hover:underline ml-auto"
                                        >
                                            <ExternalLink size={10} />
                                            View
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-white/5 text-center">
                <span className="text-[10px] text-slate-500">
                    {filteredNews.length} items • Powered by Gemini AI
                </span>
            </div>
        </div>
    );
}
