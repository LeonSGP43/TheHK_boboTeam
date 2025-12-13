

import React, { useState, useEffect } from 'react';
import { TrendReportItem } from '../../types';
import { fetchRawSocialSignals } from '../../services/tikHubService';
import { runGrowthAnalyticsAgent } from '../../services/geminiService';
import { 
    AlertTriangle, ShieldAlert, Zap, Box, 
    ArrowUpRight, TrendingUp, Download, RefreshCw, 
    Twitter, Linkedin, Video, MessageCircle, AtSign
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export function ActiveOps() {
  const [data, setData] = useState<TrendReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Simulate Crawl from TikHub
        const rawSignals = await fetchRawSocialSignals();
        // 2. Analyze via Gemini Agent
        const report = await runGrowthAnalyticsAgent(rawSignals);
        setData(report);
        setLastUpdated(new Date());
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();
  }, []);

  // Updated Icon Logic for Platform Distinction
  const getPlatformIcon = (p: string) => {
    const lower = p.toLowerCase();
    if (lower.includes('x') || lower.includes('twitter')) {
        return (
            <div className="bg-black/50 p-1.5 rounded border border-slate-800 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <div className="relative">
                    <Twitter size={14} className="relative z-10" fill="currentColor" />
                </div>
            </div>
        );
    }
    if (lower.includes('linkedin')) {
        return (
            <div className="bg-[#0077b5]/10 p-1.5 rounded border border-[#0077b5]/30 text-[#0077b5]">
                 <Linkedin size={14} fill="currentColor" />
            </div>
        );
    }
    if (lower.includes('reddit')) {
        return (
            <div className="bg-[#ff4500]/10 p-1.5 rounded border border-[#ff4500]/30 text-[#ff4500]">
                 <MessageCircle size={14} />
            </div>
        );
    }
    if (lower.includes('tiktok')) {
        return (
             <div className="bg-[#ff0050]/10 p-1.5 rounded border border-[#ff0050]/30 text-[#ff0050]">
                 <Video size={14} />
            </div>
        );
    }
    return <Zap size={14} className="text-slate-500" />;
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return "text-[#ff6b35] drop-shadow-[0_0_8px_rgba(255,107,53,0.5)]";
      if (score >= 60) return "text-[#00d4ff]";
      return "text-slate-400";
  };

  const getLifecycleBadge = (status: string) => {
      const styles = {
          flash: "bg-red-500/10 text-red-500 border-red-500/20",
          rising: "bg-green-500/10 text-green-500 border-green-500/20",
          sustained: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          evergreen: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          declining: "bg-slate-500/10 text-slate-500 border-slate-500/20"
      };
      return styles[status as keyof typeof styles] || styles.declining;
  };

  return (
    <div className="w-full h-full flex flex-col bg-card/30 backdrop-blur border border-white/5 rounded overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-2">
                <Box size={16} className="text-pulse" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Active Ops: Social Trend Intelligence
                </h3>
                {lastUpdated && <span className="text-[10px] text-slate-500 font-mono ml-2">Updated: {lastUpdated.toLocaleTimeString()}</span>}
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-pulse/10 hover:bg-pulse/20 text-pulse border border-pulse/30 rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                 >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {loading ? "CRAWLING & ANALYZING..." : "RUN INTELLIGENCE CYCLE"}
                 </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0d1220] z-10 shadow-lg">
                    <tr className="border-b border-white/10 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                        <th className="py-3 px-4">Signal Source</th>
                        <th className="py-3 px-4">Keyword / Context</th>
                        <th className="py-3 px-4">Metrics (24h)</th>
                        <th className="py-3 px-4 text-center">Trend Score</th>
                        <th className="py-3 px-4 text-center">Lifecycle</th>
                        <th className="py-3 px-4 text-center">Agent Rec</th>
                        <th className="py-3 px-4">Risk Profile</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading && data.length === 0 ? (
                         <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs animate-pulse">
                                ESTABLISHING UPLINK TO TIKHUB (X/REDDIT/LINKEDIN)...<br/>
                                SEARCHING REAL-TIME SOCIAL DATA...
                            </td>
                         </tr>
                    ) : data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            {/* 1. Source Column with Distinct Icons */}
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    {getPlatformIcon(item.platform)}
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-mono text-slate-300 uppercase font-bold">{item.platform}</span>
                                        <span className="text-[9px] text-slate-600">{item.date}</span>
                                    </div>
                                </div>
                            </td>
                            
                            {/* 2. Keyword Column with REAL CONTENT HOVER */}
                            <td className="py-3 px-4 relative">
                                <div className="font-bold text-sm text-slate-200 group-hover:text-pulse transition-colors cursor-help w-fit relative group/tooltip">
                                    {item.keyword}
                                    
                                    {/* HOVER TOOLTIP: Real Content */}
                                    <div className="absolute left-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded p-3 z-[50] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none group-hover/tooltip:pointer-events-auto">
                                        <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 transform rotate-45"></div>
                                        <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1">
                                            <AtSign size={10} className="text-slate-500" />
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {item.author || "Anonymous"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed italic font-serif opacity-90">
                                            "{item.sample_content || "Content data not available from crawl stream."}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 text-slate-400 border border-white/10">
                                        {item.category}
                                    </span>
                                </div>
                            </td>

                            <td className="py-3 px-4 font-mono text-xs">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <TrendingUp size={12} className="text-pulse" />
                                    <span>idx: {item.metrics.search_index}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    Posts: {item.metrics.posts.toLocaleString()}
                                </div>
                            </td>

                            <td className="py-3 px-4 text-center">
                                <div className={`text-xl font-black font-mono ${getScoreColor(item.scores.trend_score)}`}>
                                    {item.scores.trend_score}
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono uppercase">
                                    V:{item.scores.V.toFixed(1)} F:{item.scores.F.toFixed(1)}
                                </div>
                            </td>

                            <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getLifecycleBadge(item.lifecycle)}`}>
                                    {item.lifecycle}
                                </span>
                            </td>

                            <td className="py-3 px-4 text-center">
                                {item.agent_ready ? (
                                    <button className="px-3 py-1.5 bg-pulse text-black font-bold text-[10px] uppercase tracking-wider rounded hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,212,255,0.4)] flex items-center gap-1 mx-auto">
                                        <Zap size={10} fill="currentColor" />
                                        Build
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-slate-600 font-mono">Not Ready</span>
                                )}
                                {item.agent_ready && (
                                    <span className="block text-[9px] text-slate-500 mt-1 font-mono">
                                        Est: {item.build_plan.expected_time_to_ship_days}d
                                    </span>
                                )}
                            </td>

                            <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5" title="IP Risk">
                                        <ShieldAlert size={12} className={item.risks.ip_risk === 'high' ? 'text-red-500' : 'text-slate-600'} />
                                        <div className="h-1 w-12 bg-slate-800 rounded overflow-hidden">
                                            <div className={`h-full ${item.risks.ip_risk === 'high' ? 'bg-red-500' : item.risks.ip_risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: item.risks.ip_risk === 'high' ? '100%' : item.risks.ip_risk === 'medium' ? '60%' : '20%' }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Saturation Risk">
                                        <AlertTriangle size={12} className={item.risks.saturation_risk === 'high' ? 'text-orange-500' : 'text-slate-600'} />
                                        <span className="text-[9px] text-slate-500 uppercase">{item.risks.saturation_risk} sat</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {!loading && data.length > 0 && (
                        <tr className="bg-white/5">
                            <td colSpan={7} className="py-2 text-center text-[10px] font-mono text-slate-500">
                                END OF REPORT • {data.length} ITEMS ANALYZED • TIKHUB STREAM DISCONNECTED
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
