
import React, { useState, useEffect } from 'react';
import { TrendItem, AnalysisResult } from '../types';
import { analyzeTrendStrategy, generateTrendImage } from '../services/geminiService';
import { Loader2, Sparkles, Copy, ExternalLink, Zap, Image as ImageIcon, Check } from 'lucide-react';

interface Props {
  trend: TrendItem | null;
}

const AnalysisPanel: React.FC<Props> = ({ trend }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Image Generation State
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (trend) {
      setLoading(true);
      setResult(null);
      setGeneratedImage(null);
      analyzeTrendStrategy(trend)
        .then(setResult)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [trend]);

  const handleGenerateImage = async () => {
    if (!result?.visualPrompt) return;
    setGeneratingImage(true);
    try {
        const imgData = await generateTrendImage(result.visualPrompt);
        setGeneratedImage(imgData);
    } catch (e) {
        console.error(e);
    } finally {
        setGeneratingImage(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  if (!trend) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-l border-slate-800 bg-slate-900/50">
        <Sparkles size={48} className="mb-4 opacity-20" />
        <h3 className="text-xl font-semibold mb-2">Select a Trend</h3>
        <p className="max-w-xs">Click on any active trend card to generate AI-powered insights and content strategies via Gemini.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20">
                LIVE ANALYSIS
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {trend.id.split('-')[1]}</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{trend.topic}</h2>
        <p className="text-slate-400 text-sm">{trend.summary}</p>
      </div>

      <div className="p-6 space-y-8">
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-slate-400 text-sm animate-pulse">Gemini is analyzing search grounding data...</p>
            </div>
        ) : result ? (
            <>
                {/* Deep Dive Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="text-yellow-500" size={18} />
                        <h3 className="font-bold text-slate-200">Why It's Trending</h3>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-300 text-sm leading-relaxed">
                        {result.deepDive}
                    </div>
                </section>

                {/* Visual Intelligence Section (New) */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="text-pink-500" size={18} />
                        <h3 className="font-bold text-slate-200">Visual Intelligence</h3>
                    </div>
                    
                    <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">AI Image Prompt</span>
                                    <button 
                                        onClick={() => copyToClipboard(result.visualPrompt || "", "prompt")}
                                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                                    >
                                        {copiedId === "prompt" ? <Check size={12} className="text-green-500"/> : <Copy size={12} />}
                                        {copiedId === "prompt" ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-xs text-slate-300 font-mono break-words">
                                    {result.visualPrompt}
                                </div>
                            </div>

                            {generatedImage ? (
                                <div className="relative rounded-lg overflow-hidden border border-slate-700 group">
                                    <img src={generatedImage} alt="AI Generated" className="w-full h-auto object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={generatedImage} download={`trend-${trend.id}.png`} className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-200 transition-colors">
                                            Download Image
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleGenerateImage}
                                    disabled={generatingImage}
                                    className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-bold rounded transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                                >
                                    {generatingImage ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Generating Visuals...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            Generate AI Preview
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Strategy Cards */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-purple-500" size={18} />
                        <h3 className="font-bold text-slate-200">Content Strategy</h3>
                    </div>
                    
                    <div className="grid gap-4">
                        {(result.strategies || []).map((strat, idx) => (
                            <div key={idx} className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
                                <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                                    <span className="font-bold text-sm text-slate-200">{strat.platform}</span>
                                    <button 
                                        onClick={() => copyToClipboard(strat.body, `strat-${idx}`)}
                                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                         {copiedId === `strat-${idx}` ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Hook</span>
                                        <p className="text-sm font-medium text-blue-300">{strat.hook}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Content Body</span>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{strat.body}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(strat.hashtags || []).map(tag => (
                                            <span key={tag} className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sources */}
                {(result.relatedLinks || []).length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Grounding Sources</h3>
                        <ul className="space-y-2">
                            {(result.relatedLinks || []).map((link, i) => (
                                <li key={i}>
                                    <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 truncate transition-colors">
                                        <ExternalLink size={12} />
                                        <span className="truncate">{link.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </>
        ) : (
             <div className="text-center text-red-400 py-8">
                Failed to load analysis. Check your API connection.
             </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
