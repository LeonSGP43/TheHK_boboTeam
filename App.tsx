import React, { useState, useEffect } from 'react';
import { TrendItem, DataStreamStatus } from './types';
import { INITIAL_TRENDS, CATEGORIES } from './constants';
import { fetchLiveTrends, checkApiKey } from './services/geminiService';
import StreamStatus from './components/StreamStatus';
import TrendCard from './components/TrendCard';
import AnalysisPanel from './components/AnalysisPanel';
import { Radar, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const App: React.FC = () => {
  const [trends, setTrends] = useState<TrendItem[]>(INITIAL_TRENDS);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [streamStatus, setStreamStatus] = useState(DataStreamStatus.CONNECTED);
  const [hasKey, setHasKey] = useState(true);
  
  // Live Chart State
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  // Check API key on mount
  useEffect(() => {
    setHasKey(checkApiKey());
    setStreamStatus(DataStreamStatus.INGESTING);
  }, []);

  // Initialize and simulate live chart data (Rolling 1-hour window)
  useEffect(() => {
    const generateInitialData = () => {
        const now = Date.now();
        const data = [];
        let baseValue = 4500;
        
        // Generate 60 points (1 hour history)
        for (let i = 60; i >= 0; i--) {
            const t = now - i * 60 * 1000;
            // Random walk simulation
            baseValue = Math.max(1000, Math.min(9000, baseValue + (Math.random() - 0.5) * 800));
            data.push({
                time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: Math.round(baseValue)
            });
        }
        return data;
    };

    setChartData(generateInitialData());

    const interval = setInterval(() => {
        setChartData(prev => {
            const last = prev[prev.length - 1];
            let newVal = last.value + (Math.random() - 0.5) * 1200; // Volatility
            newVal = Math.max(1200, Math.min(9500, newVal)); // Clamp
            
            const nextTime = new Date();
            const newItem = {
                time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: Math.round(newVal)
            };
            
            // Remove first, add new (Keep window constant)
            return [...prev.slice(1), newItem];
        });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (!hasKey) return;
    setIsRefreshing(true);
    setStreamStatus(DataStreamStatus.INGESTING);
    
    try {
      // Simulate "Connect to Kafka Topic"
      const newTrends = await fetchLiveTrends(activeCategory);
      if (newTrends.length > 0) {
        setTrends(prev => {
            // Merge new trends at the top
            const combined = [...newTrends, ...prev].slice(0, 50); // Keep buffer size manageable
            return combined;
        });
      }
    } catch (e) {
      console.error(e);
      setStreamStatus(DataStreamStatus.DISCONNECTED);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter trends based on active category
  const filteredTrends = trends.filter(t => t.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Warning if no Key */}
      {!hasKey && (
          <div className="bg-red-500/10 text-red-500 px-4 py-2 text-sm text-center border-b border-red-500/20 flex items-center justify-center gap-2">
            <AlertCircle size={14} />
            <span>Missing API_KEY. Please set process.env.API_KEY to use Gemini features.</span>
          </div>
      )}

      {/* 1. Header & Status Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Radar size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">TrendPulse<span className="text-blue-500">AI</span></h1>
        </div>
        
        {/* Category Selector */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700 overflow-x-auto max-w-[60vw]">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedTrend(null); }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </header>

      {/* 2. Stream Visualization Bar */}
      <StreamStatus status={streamStatus} />

      {/* 3. Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Trend Stream */}
        <div className="flex-1 flex flex-col min-w-[320px] max-w-2xl border-r border-slate-800 bg-slate-950/50">
            
            {/* Controls */}
            <div className="p-4 flex justify-between items-center border-b border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400">
                    <BarChart3 size={16} />
                    <span className="text-sm font-medium">Topic Velocity Stream</span>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || !hasKey}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                >
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'SYNCING...' : 'REFRESH STREAM'}
                </button>
            </div>

            {/* Visual: Velocity Chart (Rolling 1h Window) */}
            <div className="h-48 w-full bg-slate-900/30 border-b border-slate-800/50 relative group overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                            itemStyle={{ color: '#94a3b8', fontSize: '12px' }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorVal)" 
                            isAnimationActive={false} // Disable animation for smoother streaming feel
                        />
                    </AreaChart>
                 </ResponsiveContainer>
                 <div className="absolute top-3 left-3 flex items-center gap-2">
                     <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[10px] text-slate-400 font-mono font-medium">LIVE INGESTION</span>
                     </div>
                     <span className="text-[10px] text-slate-500 font-mono">Global Event Volume (1h)</span>
                 </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredTrends.length > 0 ? (
                    filteredTrends.map(trend => (
                        <TrendCard 
                            key={trend.id} 
                            trend={trend} 
                            onClick={setSelectedTrend} 
                            isSelected={selectedTrend?.id === trend.id}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No trends found for {activeCategory}.</p>
                        <p className="text-xs mt-2">Click "Refresh Stream" to fetch live data via Gemini.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Analysis Engine */}
        <div className="flex-[1.5] relative">
            <AnalysisPanel trend={selectedTrend} />
        </div>

      </div>
    </div>
  );
};

export default App;