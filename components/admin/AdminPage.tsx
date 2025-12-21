/**
 * 独立管理后台页面
 * 包含系统配置、爬虫测试、实时状态监控
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, Save, RefreshCw, Tag, ToggleLeft, ToggleRight, Clock, 
  Loader2, CheckCircle, XCircle, Zap, Play, Square, Activity,
  Server, Database, Wifi, WifiOff, ArrowLeft, Terminal, Trash2,
  Plus, AlertTriangle, FlaskConical, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = 'http://localhost:8000';
const SPIDER_URL = 'http://localhost:8001';

interface ConfigItem {
  value: any;
  description: string;
  updated_at: string;
}

interface SpiderStatus {
  running: boolean;
  lastRun: string | null;
  lastResult: any;
  totalRuns: number;
  config: {
    tags: string[];
    platforms: string[];
  };
}

interface Props {
  onBack: () => void;
}

export function AdminPage({ onBack }: Props) {
  const [configs, setConfigs] = useState<Record<string, ConfigItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [tagsLoading, setTagsLoading] = useState(false);
  
  // 服务状态
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [spiderStatus, setSpiderStatus] = useState<SpiderStatus | null>(null);
  const [spiderOnline, setSpiderOnline] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // 爬虫测试
  const [crawling, setCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<any>(null);
  const [showCrawlConfirm, setShowCrawlConfirm] = useState<'mock' | 'real' | null>(null);

  // 检查后端状态
  const checkBackendStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) });
      setBackendStatus(res.ok ? 'online' : 'offline');
    } catch {
      setBackendStatus('offline');
    }
  };

  // 检查爬虫状态
  const checkSpiderStatus = async () => {
    try {
      const res = await fetch(`${SPIDER_URL}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setSpiderStatus(data);
        setSpiderOnline('online');
      } else {
        setSpiderOnline('offline');
      }
    } catch {
      setSpiderOnline('offline');
    }
  };

  // 加载配置
  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/config`);
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (e) {
      setError('无法连接到后端服务');
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存配置（不刷新整个列表，直接更新本地状态）
  const saveConfig = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/config/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      const data = await res.json();
      if (data.success) {
        // 直接更新本地状态，避免闪烁
        setConfigs(prev => ({
          ...prev,
          [key]: { ...prev[key], value, updated_at: new Date().toISOString() }
        }));
        showSuccess(`已保存`);
      }
    } catch (e) {
      showError('保存失败');
      // 失败时重新加载
      loadConfigs();
    } finally {
      setSaving(false);
    }
  };

  // 同步配置到爬虫
  const syncToSpider = async () => {
    try {
      const res = await fetch(`${SPIDER_URL}/config/refresh`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showSuccess('配置已同步到爬虫');
        checkSpiderStatus();
      }
    } catch {
      showError('无法连接爬虫服务');
    }
  };

  // 启动爬虫（需要确认）
  const confirmCrawl = (mode: 'mock' | 'real') => {
    setShowCrawlConfirm(mode);
  };

  const executeCrawl = async () => {
    if (!showCrawlConfirm) return;
    
    const mode = showCrawlConfirm;
    setShowCrawlConfirm(null);
    setCrawling(true);
    setCrawlResult(null);
    
    try {
      const endpoint = mode === 'mock' ? '/run/mock' : '/run/real';
      const res = await fetch(`${SPIDER_URL}${endpoint}`, { method: 'POST' });
      const data = await res.json();
      setCrawlResult(data);
      if (data.success) {
        showSuccess('爬取完成');
      } else {
        showError(data.message || '爬取失败');
      }
      checkSpiderStatus();
    } catch {
      showError('无法连接爬虫服务');
    } finally {
      setCrawling(false);
    }
  };

  // 切换布尔配置
  const toggleConfig = (key: string) => {
    const current = configs[key]?.value;
    saveConfig(key, !current);
  };

  // 添加标签
  const addTag = async () => {
    if (!newTag.trim()) return;
    const currentTags = configs['spider.tags']?.value || [];
    if (currentTags.includes(newTag.trim())) {
      showError('标签已存在');
      return;
    }
    setTagsLoading(true);
    await saveConfig('spider.tags', [...currentTags, newTag.trim()]);
    setNewTag('');
    setTagsLoading(false);
  };

  // 删除标签
  const removeTag = async (tag: string) => {
    const currentTags = configs['spider.tags']?.value || [];
    setTagsLoading(true);
    await saveConfig('spider.tags', currentTags.filter((t: string) => t !== tag));
    setTagsLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  useEffect(() => {
    loadConfigs();
    checkBackendStatus();
    checkSpiderStatus();
    
    // 定时刷新状态
    const interval = setInterval(() => {
      checkBackendStatus();
      checkSpiderStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const tags = configs['spider.tags']?.value || [];
  const useMock = configs['spider.use_mock']?.value ?? true;
  const limit = configs['spider.limit']?.value ?? 20;
  const delay = configs['spider.request_delay']?.value ?? 500;

  const platforms = [
    { key: 'platforms.tiktok', name: 'TikTok', color: 'bg-pink-500' },
    { key: 'platforms.instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { key: 'platforms.twitter', name: 'Twitter/X', color: 'bg-blue-400' },
    { key: 'platforms.youtube', name: 'YouTube', color: 'bg-red-500' },
    { key: 'platforms.reddit', name: 'Reddit', color: 'bg-orange-500' },
    { key: 'platforms.linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Settings className="text-pulse" size={24} />
                系统管理
              </h1>
              <p className="text-xs text-slate-500">实时配置 · 爬虫控制 · 状态监控</p>
            </div>
          </div>
          
          {/* 服务状态指示器 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <Server size={14} />
              <span className="text-xs">后端</span>
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-green-500' : 
                backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`} />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <Terminal size={14} />
              <span className="text-xs">爬虫</span>
              <div className={`w-2 h-2 rounded-full ${
                spiderOnline === 'online' ? 'bg-green-500' : 
                spiderOnline === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`} />
            </div>
          </div>
        </div>
      </header>

      {/* 状态提示 */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              error ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 
              'bg-green-500/20 border border-green-500/50 text-green-400'
            }`}>
              {error ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {error || success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* 爬虫测试面板 */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <FlaskConical className="text-yellow-500" size={20} />
            爬虫测试
          </h2>
          <p className="text-xs text-slate-500 mb-4">测试爬虫功能，确认配置正确后再用于生产</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => confirmCrawl('mock')}
              disabled={crawling || spiderOnline !== 'online'}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database size={24} className="text-blue-400" />
              <span className="font-bold">Mock 测试</span>
              <span className="text-xs text-slate-500 text-center">使用本地缓存数据，不消耗 API</span>
            </button>
            
            <button
              onClick={() => confirmCrawl('real')}
              disabled={crawling || spiderOnline !== 'online'}
              className="p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle size={24} className="text-orange-500" />
              <span className="font-bold">真实爬取</span>
              <span className="text-xs text-slate-500 text-center">调用 API 爬取，会消耗额度</span>
            </button>
          </div>

          {/* 运行状态 */}
          {crawling && (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
              <Loader2 className="animate-spin text-yellow-500" size={20} />
              <span className="text-yellow-500 font-medium">爬取进行中...</span>
            </div>
          )}

          {/* 爬虫状态 */}
          {spiderStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl">
              <div>
                <span className="text-xs text-slate-500">状态</span>
                <p className={`font-bold ${spiderStatus.running ? 'text-yellow-500' : 'text-green-500'}`}>
                  {spiderStatus.running ? '运行中' : '空闲'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">总运行次数</span>
                <p className="font-bold">{spiderStatus.totalRuns}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">上次运行</span>
                <p className="font-bold text-sm">
                  {spiderStatus.lastRun ? new Date(spiderStatus.lastRun).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">当前标签</span>
                <p className="font-bold text-sm truncate">{spiderStatus.config?.tags?.join(', ') || '-'}</p>
              </div>
            </div>
          )}

          {/* 爬取结果 */}
          {crawlResult && (
            <div className={`mt-4 p-4 rounded-xl ${crawlResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className="font-bold">{crawlResult.message}</p>
              {crawlResult.result && (
                <pre className="mt-2 text-xs text-slate-400 overflow-auto max-h-32">
                  {JSON.stringify(crawlResult.result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </section>

        {/* 配置管理 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-pulse" size={32} />
          </div>
        ) : (
          <>
            {/* 爬虫模式 */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">爬虫模式</h2>
                <button
                  onClick={syncToSpider}
                  className="px-4 py-2 bg-pulse/20 hover:bg-pulse/30 border border-pulse/50 rounded-lg flex items-center gap-2 text-sm text-pulse transition-colors"
                >
                  <Zap size={14} />
                  同步到爬虫
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                <div>
                  <p className="font-medium">Mock 模式</p>
                  <p className="text-xs text-slate-500">开启后使用本地数据，不消耗 API 额度</p>
                </div>
                <button
                  onClick={() => toggleConfig('spider.use_mock')}
                  className={`p-2 rounded-lg transition-colors ${useMock ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {useMock ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </section>

            {/* 爬取标签 */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Tag size={20} />
                爬取标签
                {tagsLoading && <Loader2 className="animate-spin text-pulse" size={16} />}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                {tags.length > 0 ? (
                  tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-pulse/20 text-pulse rounded-full text-sm flex items-center gap-2 group"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        disabled={tagsLoading}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm py-1.5">暂无标签，请添加</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !tagsLoading && addTag()}
                  placeholder="输入标签名称..."
                  disabled={tagsLoading}
                  className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pulse disabled:opacity-50"
                />
                <button
                  onClick={addTag}
                  disabled={tagsLoading || !newTag.trim()}
                  className="px-4 py-2 bg-pulse text-black font-bold rounded-lg hover:bg-pulse/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tagsLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  添加
                </button>
              </div>
            </section>

            {/* 爬取参数 */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock size={20} />
                爬取参数
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-2">每标签帖子数</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => saveConfig('spider.limit', parseInt(e.target.value) || 20)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pulse"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-2">请求间隔 (毫秒)</label>
                  <input
                    type="number"
                    value={delay}
                    onChange={(e) => saveConfig('spider.request_delay', parseInt(e.target.value) || 500)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pulse"
                  />
                </div>
              </div>
            </section>

            {/* 平台开关 */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">平台开关</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((p) => {
                  const enabled = configs[p.key]?.value ?? false;
                  return (
                    <button
                      key={p.key}
                      onClick={() => toggleConfig(p.key)}
                      className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        enabled
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-black/20 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${enabled ? p.color : 'bg-slate-700'}`} />
                      <span className="font-medium flex-1 text-left">{p.name}</span>
                      {enabled ? (
                        <ToggleRight size={20} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* 确认弹窗 */}
      <AnimatePresence>
        {showCrawlConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCrawlConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl border ${
                showCrawlConfirm === 'real' 
                  ? 'bg-[#1a0a0a] border-orange-500/50' 
                  : 'bg-[#0a0a1a] border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {showCrawlConfirm === 'real' ? (
                  <AlertTriangle className="text-orange-500" size={24} />
                ) : (
                  <Database className="text-blue-400" size={24} />
                )}
                <h3 className="text-lg font-bold">
                  {showCrawlConfirm === 'real' ? '确认真实爬取？' : '确认 Mock 测试？'}
                </h3>
              </div>
              
              <p className="text-sm text-slate-400 mb-6">
                {showCrawlConfirm === 'real' 
                  ? '真实爬取会调用 TikHub API，消耗 API 额度。确定要继续吗？'
                  : 'Mock 测试将使用本地缓存数据，不会消耗 API 额度。'
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCrawlConfirm(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={executeCrawl}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${
                    showCrawlConfirm === 'real'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  确认执行
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
