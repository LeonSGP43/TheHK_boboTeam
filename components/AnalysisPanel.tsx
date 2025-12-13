
import React, { useState, useEffect, useCallback } from 'react';
import { TrendItem, AnalysisResult } from '../types';
import { analyzeDeepDive, generateTrendImage } from '../services/geminiService';
import { 
    Loader2, Sparkles, Target, ExternalLink, 
    ShieldAlert, Zap, TrendingUp, DollarSign,
    Globe, Copy, Check, Layers, Camera, AlertCircle, RefreshCcw, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  trend: TrendItem | null;
  t: any; // Translation dictionary
}

const AnalysisPanel: React.FC<Props> = ({ trend, t }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [generatingImg, setGeneratingImg] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgError, setImgError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'intel' | 'strategy'>('intel');
  const [copied, setCopied] = useState(false);

  // Reset state when trend changes
  useEffect(() => {
    if (trend) {
      setLoading(true);
      setResult(null);
      setGeneratedImg(null);
      setImgError(false);
      // Default back to Intel tab on new trend, or keep preference? 
      // Usually better to reset to give overview first, but let's keep user flow smooth if they are digging.
      // Resetting to 'intel' to ensure they see the brief first.
      setActiveTab('intel'); 
      
      analyzeDeepDive(trend)
        .then(setResult)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [trend]);

  // Image Generation Handler
  const handleGenImage = useCallback(async () => {
    if (!result?.visualPrompt) return;
    setGeneratingImg(true);
    setImgError(false);
    
    // Use the prompt from analysis
    const img = await generateTrendImage(result.visualPrompt, imgSize);
    
    if (img) {
        setGeneratedImg(img);
    } else {
        setImgError(true);
    }
    setGeneratingImg(false);
  }, [result, imgSize]);

  // AUTO-GENERATE EFFECT
  // Trigger generation when entering 'strategy' tab if no image exists yet
  useEffect(() => {
      if (
          activeTab === 'strategy' &&  // User is on the correct tab
          result?.visualPrompt &&      // We have a prompt
          !generatedImg &&             // No image yet
          !generatingImg &&            // Not currently generating
          !imgError                    // Hasn't failed previously (prevent loop on error)
      ) {
          handleGenImage();
      }
  }, [activeTab, result, generatedImg, generatingImg, imgError, handleGenImage]);


  const copyPrompt = () => {
      if(result?.visualPrompt) {
          navigator.clipboard.writeText(result.visualPrompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  }

  if (!trend) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-slate-500 font-mono transition-colors">
        <Target size={64} className="mb-6 opacity-20 animate-pulse text-slate-400" />
        <h2 className="text-xl tracking-widest uppercase font-bold text-slate-700 dark:text-slate-300">{t.targetNotAcquired}</h2>
        <p className="text-sm mt-2">{t.initScan}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden transition-colors">
      
      {/* 1. Header & Quick Stats */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex justify-between items-start mb-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-pulse/10 text-pulse border border-pulse/20">
                        {trend.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                        SIG_ID: {trend.id.split('-')[1] || '000'}
                    </span>
                </div>
                <h1 className="text-3xl font-black text-text tracking-tight uppercase max-w-3xl leading-none">
                    {trend.topic}
                </h1>
            </div>
            <div className="text-right">
                <div className="text-4xl font-black text-pulse tabular-nums tracking-tighter">
                    {trend.trendScore || 0}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                    {t.impactScore}
                </div>
            </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-6 border-b border-border mt-6">
            <button 
                onClick={() => setActiveTab('intel')}
                className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'intel' ? 'text-text border-b-2 border-pulse' : 'text-slate-500 hover:text-slate-400'}`}
            >
                {t.tabIntel}
            </button>
            <button 
                onClick={() => setActiveTab('strategy')}
                className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'strategy' ? 'text-text border-b-2 border-spark' : 'text-slate-500 hover:text-slate-400'}`}
            >
                {t.tabStrategy}
            </button>
        </div>
      </div>

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-pulse/20 border-t-pulse rounded-full animate-spin" />
                <p className="text-xs font-mono text-pulse animate-pulse">{t.statusScanning}</p>
            </div>
        ) : result ? (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                
                {/* --- TAB: INTELLIGENCE --- */}
                {activeTab === 'intel' && (
                    <div className="grid grid-cols-12 gap-6">
                        
                        {/* A. Deep Dive (Left Col) */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            
                            {/* 1. The Breakdown */}
                            <div className="bg-white/50 dark:bg-white/5 border border-border p-5 rounded relative overflow-hidden shadow-sm">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Zap size={14} className="text-alpha" /> 
                                    {t.situationReport}
                                </h3>
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm">
                                    {result.deepDive}
                                </p>
                                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase">{t.targetAudience}</span>
                                        <p className="text-xs text-text mt-1 font-medium">{result.marketFit}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase">{t.riskAssess}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${trend.riskLevel === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <span className="text-xs text-text capitalize">{trend.riskLevel || 'Unknown'} Risk</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. SOURCE OF TRUTH (Real Evidence) */}
                            <div className="bg-slate-100 dark:bg-[#0f121a] border border-border p-5 rounded">
                                <h3 className="text-xs font-bold text-pulse uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Globe size={14} /> 
                                    {t.signalEvidence}
                                </h3>
                                
                                <div className="space-y-3">
                                    {trend.evidence && trend.evidence.length > 0 ? (
                                        trend.evidence.map((ev, i) => (
                                            <div key={i} className="pl-3 border-l-2 border-slate-300 dark:border-slate-700 hover:border-pulse transition-colors">
                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-1">"{ev.snippet}"</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-text bg-black/5 dark:bg-white/10 px-1.5 rounded uppercase">{ev.source}</span>
                                                    {ev.publishedTime && <span className="text-[9px] text-slate-500">{ev.publishedTime}</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">
                                            No direct snippets extracted. Cross-referencing generalized trend data.
                                        </p>
                                    )}
                                </div>

                                {/* External Links */}
                                {result.relatedLinks.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                                        {result.relatedLinks.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-pulse hover:text-text border border-pulse/20 hover:bg-pulse/10 px-2 py-1 rounded transition-all">
                                                <ExternalLink size={10} />
                                                <span className="truncate max-w-[150px]">{link.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* B. Metrics Radar (Right Col) */}
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            {/* Score Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/50 dark:bg-white/5 p-3 rounded border border-border">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><DollarSign size={10}/> {t.monetization}</div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${result.scores.monetization}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-text mt-1 block">{result.scores.monetization}/100</span>
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 p-3 rounded border border-border">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><TrendingUp size={10}/> {t.virality}</div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: `${result.scores.virality}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-text mt-1 block">{result.scores.virality}/100</span>
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 p-3 rounded border border-border">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><ShieldAlert size={10}/> {t.competition}</div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${result.scores.competition}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-text mt-1 block">{result.scores.competition}/100</span>
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 p-3 rounded border border-border">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1 flex items-center gap-1"><Zap size={10}/> {t.feasibility}</div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${result.scores.feasibility}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-text mt-1 block">{result.scores.feasibility}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: STRATEGY & GUIDE --- */}
                {activeTab === 'strategy' && (
                    <div className="grid grid-cols-12 gap-6">
                        
                        {/* 1. Guideline & Content */}
                        <div className="col-span-12 lg:col-span-7 space-y-6">
                             {/* Category Match Badge */}
                             {result.guideline ? (
                                <div className="bg-pulse/5 border border-pulse/20 rounded p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Layers size={16} className="text-pulse" />
                                        <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                                            {t.dictMatch}: {result.guideline.matchedCategory}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-[10px] font-mono bg-black/10 dark:bg-black px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-border">
                                            KEYWORD: {result.guideline.coreKeyword}
                                        </span>
                                        <span className="text-[10px] font-mono bg-black/10 dark:bg-black px-2 py-1 rounded text-slate-600 dark:text-slate-400 border border-border">
                                            POTENTIAL: {result.guideline.commercialPotential}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">{t.recTools}</span>
                                        <div className="flex gap-2">
                                            {result.guideline.recommendedTools.map(t => (
                                                <span key={t} className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-text text-[10px]">{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">{t.prodSteps}</span>
                                        <ul className="space-y-2">
                                            {result.guideline.productionSteps.map((step, idx) => (
                                                <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <span className="text-pulse font-mono">{idx+1}.</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                             ) : (
                                 <div className="p-6 border border-dashed border-slate-700 rounded text-center">
                                     <p className="text-xs text-slate-500">
                                         Guideline generation incomplete. Re-scan or refine the trend target.
                                     </p>
                                 </div>
                             )}

                             {/* Hooks */}
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2">{t.contentProto}</h4>
                             {result.strategies.map((strat, i) => (
                                 <div key={i} className="bg-white/50 dark:bg-white/5 border border-border rounded p-4 hover:border-spark/50 transition-colors group">
                                     <div className="flex justify-between items-center mb-3">
                                         <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-spark/10 text-spark border border-spark/20">{strat.platform}</span>
                                         <button className="text-slate-500 hover:text-text transition-colors"><Copy size={12} /></button>
                                     </div>
                                     <div className="mb-2">
                                         <p className="text-sm font-bold text-text">"{strat.hook}"</p>
                                     </div>
                                     <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{strat.body}</p>
                                     <div className="flex flex-wrap gap-2">
                                         {strat.hashtags.map(t => <span key={t} className="text-[10px] text-slate-500">#{t}</span>)}
                                     </div>
                                 </div>
                             ))}
                        </div>

                        {/* 2. Visual Generator (Nano Banana Pro) */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="bg-white dark:bg-black border border-border rounded overflow-hidden sticky top-6 shadow-md dark:shadow-none transition-colors">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50 dark:bg-[#0d1220]">
                                    <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                                        <Camera size={14} className="text-pulse" />
                                        {t.nanoBanana}
                                    </h3>
                                    <div className="flex gap-1">
                                        {(['1K', '2K', '4K'] as const).map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setImgSize(size)}
                                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${imgSize === size ? 'bg-pulse text-black' : 'bg-black/10 dark:bg-white/5 text-slate-500 hover:text-text'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {generatedImg ? (
                                    <>
                                    <div className="relative group aspect-square bg-slate-100 dark:bg-[#050505]">
                                        <img src={generatedImg} alt="AI Generated" className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/60 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <div className="flex gap-2">
                                                <a href={generatedImg} download={`trend_${trend.id}.png`} className="px-4 py-2 bg-pulse text-black text-xs font-bold uppercase rounded hover:scale-105 transition-transform flex items-center gap-2">
                                                    <ExternalLink size={12} />
                                                    {t.download}
                                                </a>
                                                <button 
                                                    onClick={handleGenImage}
                                                    disabled={generatingImg}
                                                    className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    <RefreshCcw size={12} className={generatingImg ? "animate-spin" : ""} />
                                                    Variant
                                                </button>
                                            </div>
                                            <button onClick={() => setGeneratedImg(null)} className="text-[10px] text-white hover:text-red-400 underline decoration-red-400 mt-2">{t.dismiss}</button>
                                        </div>
                                    </div>
                                    {/* Annotation Block */}
                                    <div className="p-3 border-t border-border bg-black/5 dark:bg-[#0a0a0a]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info size={12} className="text-pulse" />
                                            <span className="text-[10px] font-bold uppercase text-slate-500">Visual Annotation</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed">
                                            Targeting: <span className="text-text">{trend.topic}</span><br/>
                                            Style Match: <span className="text-text">{result.guideline?.matchedCategory || 'General Aesthetic'}</span>
                                        </p>
                                    </div>
                                    </>
                                ) : (
                                    <div className="aspect-square bg-slate-50 dark:bg-[#080808] flex flex-col items-center justify-center p-8 text-center border-b border-border relative overflow-hidden">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', color: '#888' }}></div>
                                        
                                        {imgError ? (
                                             <div className="flex flex-col items-center text-red-400 animate-pulse">
                                                 <AlertCircle size={32} className="mb-2" />
                                                 <p className="text-[10px] font-mono">GENERATION FAILED</p>
                                                 <p className="text-[9px] opacity-70 mt-1">Try a different prompt or size</p>
                                             </div>
                                        ) : generatingImg ? (
                                            <div className="flex flex-col items-center gap-3 z-10">
                                                <div className="w-12 h-12 border-4 border-pulse/20 border-t-pulse rounded-full animate-spin" />
                                                <p className="text-[10px] font-mono text-pulse animate-pulse uppercase tracking-widest">
                                                    Constructing Visuals...
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <Sparkles size={24} className="text-slate-400 dark:text-slate-700 mb-4" />
                                                <p className="text-[10px] text-slate-500 font-mono mb-2">{t.promptPreview}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed line-clamp-4">
                                                    "{result.visualPrompt}"
                                                </p>
                                                <p className="text-[9px] text-slate-500 mt-4 opacity-50">
                                                    (Auto-generates on view)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 bg-slate-50 dark:bg-[#0d1220]">
                                    <button 
                                        onClick={handleGenImage}
                                        disabled={generatingImg || !result.visualPrompt}
                                        className="w-full py-3 bg-gradient-to-r from-pulse/10 to-spark/10 hover:from-pulse/20 hover:to-spark/20 border border-pulse/20 text-text text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generatingImg ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-pulse" />}
                                        {generatingImg ? `${t.rendering} ${imgSize}` : t.genPrototype}
                                    </button>
                                    <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
                                        Model: gemini-3-pro-image-preview
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default AnalysisPanel;
