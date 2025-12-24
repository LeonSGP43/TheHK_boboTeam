/**
 * 历史数据缓存服务
 * 在 CrawlLoader 阶段预加载数据，供 HistoryRankings 使用
 */

import { BACKEND_URL } from '../config/env';

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

interface CachedData {
  rankings: Record<string, { records: RankedItem[]; total: number }>;
  stats: HistoryStats | null;
  timestamp: number;
}

// 全局缓存
let cachedData: CachedData | null = null;
let isLoading = false;
let loadPromise: Promise<CachedData | null> | null = null;

// 缓存有效期 30 秒
const CACHE_TTL = 30000;

/**
 * 预加载历史数据（在 CrawlLoader 中调用）
 */
export async function preloadHistoryData(): Promise<void> {
  if (isLoading) {
    console.log('[HistoryCache] Already loading, waiting...');
    await loadPromise;
    return;
  }

  isLoading = true;
  console.log('[HistoryCache] 🚀 Preloading history data...');

  loadPromise = (async () => {
    try {
      const [rankingsRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/history/rankings?top_n=1000`),
        fetch(`${BACKEND_URL}/api/history/stats`)
      ]);

      const rankings = rankingsRes.ok ? await rankingsRes.json() : {};
      const stats = statsRes.ok ? await statsRes.json() : null;

      cachedData = {
        rankings,
        stats,
        timestamp: Date.now()
      };

      console.log('[HistoryCache] ✅ Preloaded:', {
        platforms: Object.keys(rankings).length,
        totalRecords: stats?.total_records || 0
      });

      return cachedData;
    } catch (e) {
      console.error('[HistoryCache] ❌ Preload failed:', e);
      return null;
    } finally {
      isLoading = false;
    }
  })();

  await loadPromise;
}

/**
 * 获取缓存的历史数据
 */
export function getCachedHistoryData(): CachedData | null {
  if (!cachedData) return null;
  
  // 检查缓存是否过期
  if (Date.now() - cachedData.timestamp > CACHE_TTL) {
    console.log('[HistoryCache] Cache expired');
    return null;
  }
  
  return cachedData;
}

/**
 * 清除缓存
 */
export function clearHistoryCache(): void {
  cachedData = null;
}
