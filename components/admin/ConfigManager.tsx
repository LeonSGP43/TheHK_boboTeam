/**
 * 系统配置管理组件
 * 支持爬虫配置、平台开关等动态配置
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Tag, ToggleLeft, ToggleRight, Clock, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL, SPIDER_URL } from '../../config/env';

interface ConfigItem {
  value: any;
  description: string;
  updated_at: string;
}

interface Configs {
  [key: string]: ConfigItem;
}

export function ConfigManager() {
  const [configs, setConfigs] = useState<Configs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  // 加载配置
  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/config`);
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      } else {
        setError('Failed to load config');
      }
    } catch (e) {
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // 保存单个配置
  const saveConfig = async (key: string, value: any) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/config/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Config ${key} saved`);
        setTimeout(() => setSuccess(null), 2000);
        loadConfigs();
      } else {
        setError('Save failed');
      }
    } catch (e) {
      setError('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  // 通知爬虫刷新配置
  const refreshSpiderConfig = async () => {
    try {
      const res = await fetch(`${SPIDER_URL}/config/refresh`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Spider config refreshed');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (e) {
      setError('Cannot notify spider service');
    }
  };

  // 切换布尔值
  const toggleConfig = (key: string) => {
    const current = configs[key]?.value;
    saveConfig(key, !current);
  };

  // 添加标签
  const addTag = () => {
    if (!newTag.trim()) return;
    const currentTags = configs['spider.tags']?.value || [];
    if (!currentTags.includes(newTag.trim())) {
      saveConfig('spider.tags', [...currentTags, newTag.trim()]);
    }
    setNewTag('');
  };

  // 删除标签
  const removeTag = (tag: string) => {
    const currentTags = configs['spider.tags']?.value || [];
    saveConfig('spider.tags', currentTags.filter((t: string) => t !== tag));
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-pulse" size={32} />
      </div>
    );
  }

  const tags = configs['spider.tags']?.value || [];
  const useMock = configs['spider.use_mock']?.value ?? true;
  const limit = configs['spider.limit']?.value ?? 20;
  const delay = configs['spider.request_delay']?.value ?? 500;

  const platforms = [
    { key: 'platforms.tiktok', name: 'TikTok', color: 'bg-pink-500' },
    { key: 'platforms.instagram', name: 'Instagram', color: 'bg-purple-500' },
    { key: 'platforms.twitter', name: 'Twitter/X', color: 'bg-blue-400' },
    { key: 'platforms.youtube', name: 'YouTube', color: 'bg-red-500' },
    { key: 'platforms.reddit', name: 'Reddit', color: 'bg-orange-500' },
    { key: 'platforms.linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="text-pulse" size={24} />
          <h2 className="text-xl font-bold text-white">System Config</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadConfigs}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 text-sm text-slate-300 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={refreshSpiderConfig}
            className="px-4 py-2 bg-pulse/20 hover:bg-pulse/30 border border-pulse/50 rounded-lg flex items-center gap-2 text-sm text-pulse transition-colors"
          >
            <Zap size={14} />
            Sync to Spider
          </button>
        </div>
      </div>

      {/* 状态提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400"
          >
            <XCircle size={16} />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400"
          >
            <CheckCircle size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 爬虫模式 */}
      <div className="bg-card/50 backdrop-blur border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Crawler Mode</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Mock Mode</p>
            <p className="text-xs text-slate-500">Uses local data when enabled, no API cost</p>
          </div>
          <button
            onClick={() => toggleConfig('spider.use_mock')}
            className={`p-2 rounded-lg transition-colors ${useMock ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
          >
            {useMock ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>

      {/* 爬取标签 */}
      <div className="bg-card/50 backdrop-blur border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag size={14} />
          Crawl Tags
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-pulse/20 text-pulse rounded-full text-sm flex items-center gap-2 group"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add new tag..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pulse"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-pulse text-black font-bold rounded-lg hover:bg-pulse/80 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* 爬取参数 */}
      <div className="bg-card/50 backdrop-blur border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock size={14} />
          Crawl Parameters
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Posts per tag</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => saveConfig('spider.limit', parseInt(e.target.value) || 20)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pulse"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Request delay (ms)</label>
            <input
              type="number"
              value={delay}
              onChange={(e) => saveConfig('spider.request_delay', parseInt(e.target.value) || 500)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pulse"
            />
          </div>
        </div>
      </div>

      {/* 平台开关 */}
      <div className="bg-card/50 backdrop-blur border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Platform Switches</h3>
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
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${enabled ? p.color : 'bg-slate-700'}`} />
                <span className="font-medium">{p.name}</span>
                {enabled ? (
                  <ToggleRight size={20} className="ml-auto text-green-400" />
                ) : (
                  <ToggleLeft size={20} className="ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
