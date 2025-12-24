/**
 * Platform News Cache Service
 * 缓存 Gemini 查询的 LinkedIn/Facebook 新闻结果
 */

import { PlatformNewsItem, searchPlatformNews } from './geminiService';
import { BACKEND_URL } from '../config/env';

// 内存缓存
let cachedNews: PlatformNewsItem[] = [];
let cacheTimestamp: number = 0;
let isLoading: boolean = false;
let loadPromise: Promise<PlatformNewsItem[]> | null = null;

// 缓存有效期 (5分钟)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * 从后端获取配置的 tags
 */
async function fetchConfiguredTags(): Promise<string[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/config`);
        const data = await res.json();
        if (data.success && data.data?.['spider.tags']?.value) {
            return data.data['spider.tags'].value;
        }
    } catch (e) {
        console.error('[PlatformNewsCache] Failed to fetch tags:', e);
    }
    // 默认 tags
    return ['AI', 'trending', 'technology'];
}

/**
 * 预加载平台新闻数据
 * 在 CrawlLoader 期间调用
 */
export async function preloadPlatformNews(): Promise<PlatformNewsItem[]> {
    // 如果正在加载，返回现有的 promise
    if (isLoading && loadPromise) {
        console.log('[PlatformNewsCache] Already loading, returning existing promise');
        return loadPromise;
    }

    // 如果缓存有效，直接返回
    if (cachedNews.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
        console.log('[PlatformNewsCache] Returning cached data');
        return cachedNews;
    }

    isLoading = true;
    console.log('[PlatformNewsCache] 🔄 Starting platform news preload...');

    loadPromise = (async () => {
        try {
            // 获取配置的 tags
            const tags = await fetchConfiguredTags();
            console.log('[PlatformNewsCache] 📋 Using tags:', tags);

            // 调用 Gemini 搜索
            const news = await searchPlatformNews(tags, ['LinkedIn', 'Facebook']);
            
            // 更新缓存
            cachedNews = news;
            cacheTimestamp = Date.now();
            
            console.log(`[PlatformNewsCache] ✅ Cached ${news.length} news items`);
            return news;
        } catch (error) {
            console.error('[PlatformNewsCache] ❌ Preload failed:', error);
            return [];
        } finally {
            isLoading = false;
            loadPromise = null;
        }
    })();

    return loadPromise;
}

/**
 * 获取缓存的平台新闻
 */
export function getCachedPlatformNews(): PlatformNewsItem[] {
    return cachedNews;
}

/**
 * 检查是否有缓存数据
 */
export function hasCachedPlatformNews(): boolean {
    return cachedNews.length > 0;
}

/**
 * 清除缓存
 */
export function clearPlatformNewsCache(): void {
    cachedNews = [];
    cacheTimestamp = 0;
}

/**
 * 按平台过滤新闻
 */
export function getNewsByPlatform(platform: 'LinkedIn' | 'Facebook'): PlatformNewsItem[] {
    return cachedNews.filter(item => item.platform === platform);
}

/**
 * 按标签过滤新闻
 */
export function getNewsByTag(tag: string): PlatformNewsItem[] {
    return cachedNews.filter(item => 
        item.tag.toLowerCase() === tag.toLowerCase()
    );
}
