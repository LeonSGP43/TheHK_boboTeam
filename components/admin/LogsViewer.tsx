import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2, Download, Filter, X } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  logger: string;
  message: string;
}

interface LogsResponse {
  total: number;
  logs: LogEntry[];
}

// 在开发环境下使用代理（空字符串），生产环境使用完整 URL
// 生产环境默认 URL
const PROD_BACKEND_URL = "http://47.101.161.15:8000";

const isLocalDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const BACKEND_URL = isLocalDev ? "" : (import.meta.env?.VITE_BACKEND_URL || PROD_BACKEND_URL);

const LogLevelColors: Record<string, string> = {
  DEBUG: 'bg-gray-100 text-gray-800',
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900'
};

const LogLevelBgColors: Record<string, string> = {
  DEBUG: 'bg-gray-50',
  INFO: 'bg-blue-50',
  WARNING: 'bg-yellow-50',
  ERROR: 'bg-red-50',
  CRITICAL: 'bg-red-100'
};

export const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterLogger, setFilterLogger] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 获取日志
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLevel) params.append('level', filterLevel);
      if (filterLogger) params.append('logger_name', filterLogger);
      params.append('limit', '200');

      const response = await fetch(`${BACKEND_URL}/api/logs/?${params}`);
      const data: LogsResponse = await response.json();
      setLogs(data.logs);

      // 获取统计信息
      const statsResponse = await fetch(`${BACKEND_URL}/api/logs/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [filterLevel, filterLogger, autoRefresh]);

  // 滚动到底部
  useEffect(() => {
    if (autoRefresh && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoRefresh]);

  // 清空日志
  const handleClear = async () => {
    if (confirm('确定要清空所有日志吗？')) {
      try {
        await fetch(`${BACKEND_URL}/api/logs/`, { method: 'DELETE' });
        setLogs([]);
        setStats(null);
      } catch (error) {
        console.error('清空日志失败:', error);
      }
    }
  };

  // 导出日志
  const handleExport = () => {
    const csv = logs
      .map(log => `"${log.timestamp}","${log.level}","${log.logger}","${log.message.replace(/"/g, '""')}"`)
      .join('\n');
    
    const header = '"Timestamp","Level","Logger","Message"\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">系统日志</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
              title="刷新"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-blue-500 rounded-lg transition"
              title="导出"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-red-500 rounded-lg transition"
              title="清空"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="flex gap-4 text-sm">
            <div>
              <span className="opacity-75">总计:</span>
              <span className="ml-2 font-bold">{stats.total}</span>
            </div>
            {Object.entries(stats.by_level).map(([level, count]: [string, any]) => (
              <div key={level}>
                <span className="opacity-75">{level}:</span>
                <span className="ml-2 font-bold">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 过滤器 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">过滤:</span>
        </div>

        {/* 日志级别过滤 */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        >
          <option value="">所有级别</option>
          <option value="DEBUG">DEBUG</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        {/* 记录器过滤 */}
        <input
          type="text"
          placeholder="记录器名称..."
          value={filterLogger}
          onChange={(e) => setFilterLogger(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        />

        {/* 自动刷新 */}
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">自动刷新</span>
        </label>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            暂无日志
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`border-b border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                LogLevelBgColors[log.level] || 'bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* 时间戳 */}
                <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>

                {/* 日志级别 */}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${
                    LogLevelColors[log.level] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {log.level}
                </span>

                {/* 记录器 */}
                <span className="text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                  {log.logger}
                </span>

                {/* 消息 */}
                <span className="text-gray-800 dark:text-gray-200 flex-1 break-words">
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
