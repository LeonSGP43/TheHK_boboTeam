/**
 * useRankings - 排名数据 Hook
 * 
 * 获取各平台的趋势排名数据
 */

import { useState, useEffect, useCallback } from 'react';

// 在开发环境下使用代理（空字符串），生产环境使用完整 URL
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const BACKEND_URL = isDev ? "" : (import.meta.env?.VITE_BACKEND_URL || "http://localhost:8000");

export interface RankedItem {
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
    title: string;        // 帖子标题
    description: string;  // 帖子描述
    post_id: string;
    lifecycle: string;
    priority: string;
    rank: number;
    content_url?: string;
    cover_url?: string;
    // 新增字段
    post_count?: number;
    activity?: {
        freshness_rate: number;
        activity_level: string;
        new_posts: number;
    };
}

export interface PlatformRanking {
    platform: string;
    records: RankedItem[];
    total: number;
}

export type RankingsData = Record<string, PlatformRanking>;

export interface HistoryStats {
    total_records: number;
    retention_hours: number;
    platforms: { [key: string]: number };
    average_scores: { [key: string]: number };
    oldest_record: string | null;
    newest_record: string | null;
}

export const useRankings = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
    const [rankings, setRankings] = useState<RankingsData>({});
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchRankings = useCallback(async () => {
        try {
            const [rankingsRes, statsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/history/rankings?top_n=100`),
                fetch(`${BACKEND_URL}/api/history/stats`)
            ]);

            if (!rankingsRes.ok || !statsRes.ok) {
                throw new Error('Failed to fetch rankings');
            }

            const rankingsData = await rankingsRes.json();
            const statsData = await statsRes.json();

            setRankings(rankingsData);
            setStats(statsData);
            setLastUpdated(new Date());
            setError(null);
        } catch (e) {
            console.error('[useRankings] Error:', e);
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPlatformRanking = useCallback(async (platform: string): Promise<RankedItem[]> => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/history/platform/${platform}?limit=50`);
            if (!res.ok) throw new Error(`Failed to fetch ${platform} ranking`);
            return await res.json();
        } catch (e) {
            console.error(`[useRankings] Error fetching ${platform}:`, e);
            return [];
        }
    }, []);

    useEffect(() => {
        fetchRankings();

        if (autoRefresh) {
            const interval = setInterval(fetchRankings, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchRankings, autoRefresh, refreshInterval]);

    // 获取指定平台的排名
    const getPlatformRanking = useCallback((platform: string): RankedItem[] => {
        const platformData = rankings[platform.toUpperCase()] as PlatformRanking | undefined;
        return platformData?.records || [];
    }, [rankings]);

    // 获取所有平台的 Top 1
    const getTopItems = useCallback((): RankedItem[] => {
        return (Object.values(rankings) as PlatformRanking[])
            .map(p => p.records[0])
            .filter(Boolean)
            .sort((a, b) => b.trend_score - a.trend_score);
    }, [rankings]);

    // 获取全局排名（所有平台合并）
    const getGlobalRanking = useCallback((limit: number = 20): RankedItem[] => {
        const allItems = (Object.values(rankings) as PlatformRanking[])
            .flatMap(p => p.records)
            .sort((a, b) => b.trend_score - a.trend_score)
            .slice(0, limit);

        // 重新计算全局排名
        return allItems.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }, [rankings]);

    return {
        rankings,
        stats,
        loading,
        error,
        lastUpdated,
        refresh: fetchRankings,
        getPlatformRanking,
        fetchPlatformRanking,
        getTopItems,
        getGlobalRanking
    };
};
