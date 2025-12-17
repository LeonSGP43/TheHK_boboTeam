import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

interface SpiderServerDocProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpiderServerDoc: React.FC<SpiderServerDocProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-lg">
            <div>
              <h1 className="text-3xl font-bold">🕷️ Spider6P 爬虫服务器</h1>
              <p className="text-blue-100 mt-1">HTTP API 文档</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* 快速开始 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">快速开始</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">启动爬虫服务器：</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                      cd spider6p && npm run server
                    </code>
                    <button
                      onClick={() => copyToClipboard('cd spider6p && npm run server', 'start')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'start' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">或一键启动所有服务：</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                      ./start-dev.sh
                    </code>
                    <button
                      onClick={() => copyToClipboard('./start-dev.sh', 'all')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'all' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* API 接口 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">API 接口</h2>
              <div className="space-y-4">
                {/* POST /run */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                    <code className="text-gray-700 font-mono">/run</code>
                    <span className="text-gray-500 text-sm">启动爬取（默认标签）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                      curl -X POST http://localhost:8001/run
                    </code>
                    <button
                      onClick={() => copyToClipboard('curl -X POST http://localhost:8001/run', 'run')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'run' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* POST /run/tags */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                    <code className="text-gray-700 font-mono">/run/tags</code>
                    <span className="text-gray-500 text-sm">指定标签爬取</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                      curl -X POST http://localhost:8001/run/tags -H "Content-Type: application/json" -d '{"{"}tags": ["music", "AI"]{"}"}
                    </code>
                    <button
                      onClick={() => copyToClipboard('curl -X POST http://localhost:8001/run/tags -H "Content-Type: application/json" -d \'{"tags": ["music", "AI"]}\'', 'tags')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'tags' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* GET /status */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono text-sm font-bold">GET</span>
                    <code className="text-gray-700 font-mono">/status</code>
                    <span className="text-gray-500 text-sm">获取爬虫状态</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                      curl http://localhost:8001/status
                    </code>
                    <button
                      onClick={() => copyToClipboard('curl http://localhost:8001/status', 'status')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'status' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* GET /health */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono text-sm font-bold">GET</span>
                    <code className="text-gray-700 font-mono">/health</code>
                    <span className="text-gray-500 text-sm">健康检查</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
                      curl http://localhost:8001/health
                    </code>
                    <button
                      onClick={() => copyToClipboard('curl http://localhost:8001/health', 'health')}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === 'health' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 数据流 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">数据流</h2>
              <div className="bg-blue-50 p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">爬虫服务器 (8001)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">爬取数据 (TikTok, Instagram, etc.)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">发送到 Kafka (market-stream)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">后端消费 (8000)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">计算 VKS 分数</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">SSE 推送到前端 (3000)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">实时图表显示</span>
                </div>
              </div>
            </section>

            {/* 服务地址 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">服务地址</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">后端 API</p>
                  <a href="http://localhost:8000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8000 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">前端页面</p>
                  <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:3000 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">爬虫服务</p>
                  <a href="http://localhost:8001" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8001 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">API 文档</p>
                  <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8000/docs <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </section>

            {/* 提示 */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 提示：</strong> 完整文档请查看 <code className="bg-yellow-100 px-2 py-1 rounded">spider6p/doc/SPIDER_SERVER.md</code>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
