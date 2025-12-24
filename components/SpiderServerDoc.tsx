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
              <h1 className="text-3xl font-bold">🕷️ Spider6P Crawler Server</h1>
              <p className="text-blue-100 mt-1">HTTP API Documentation</p>
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
            {/* Quick Start */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Start</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Start the crawler server:</p>
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
                  <p className="text-sm text-gray-600 mb-2">Or start all services at once:</p>
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

            {/* API Endpoints */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">API Endpoints</h2>
              <div className="space-y-4">
                {/* POST /run */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                    <code className="text-gray-700 font-mono">/run</code>
                    <span className="text-gray-500 text-sm">Start crawling (default tags)</span>
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
                    <span className="text-gray-500 text-sm">Crawl with specified tags</span>
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
                    <span className="text-gray-500 text-sm">Get crawler status</span>
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
                    <span className="text-gray-500 text-sm">Health check</span>
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

            {/* Data Flow */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Flow</h2>
              <div className="bg-blue-50 p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Crawler Server (8001)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Crawl Data (TikTok, Instagram, etc.)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Send to Kafka (market-stream)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Backend Consumer (8000)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Calculate VKS Score</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">SSE Push to Frontend (3000)</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">Real-time Chart Display</span>
                </div>
              </div>
            </section>

            {/* Service Addresses */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Addresses</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Backend API</p>
                  <a href="http://localhost:8000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8000 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Frontend</p>
                  <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:3000 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Crawler Service</p>
                  <a href="http://localhost:8001" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8001 <ExternalLink size={14} />
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">API Documentation</p>
                  <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    http://localhost:8000/docs <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </section>

            {/* Tip */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> For complete documentation, see <code className="bg-yellow-100 px-2 py-1 rounded">spider6p/doc/SPIDER_SERVER.md</code>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
