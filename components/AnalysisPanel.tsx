
import React, { useState, useEffect, useCallback } from 'react';
import { TrendItem, AnalysisResult } from '../types';
import { analyzeDeepDive, generateTrendImage } from '../services/geminiService';
import { Abstract3DAnchor } from './effects/Abstract3DAnchor';
import { 
    Loader2, Sparkles, Target, ExternalLink, 
    Zap, Camera, RefreshCcw, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  trend: TrendItem | null;
  t: any;
}

const AnalysisPanel: React.FC<Props> = ({ trend, t }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [generatingImg, setGeneratingImg] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'strategy'>('intel');

  useEffect(() => {
    if (trend) {
      setLoading(true);
      setResult(null);
      setGeneratedImg(null);
      setImgError(false);
      setActiveTab('intel'); 
      analyzeDeepDive(trend)
        .then(setResult)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [trend]);

  const handleGenImage = useCallback(async () => {
    if (!result?.visualPrompt) return;
    setGeneratingImg(true);
    setImgError(false);
    const img = await generateTrendImage(result.visualPrompt, imgSize);
    if (img) setGeneratedImg(img); else setImgError(true);
    setGeneratingImg(false);
  }, [result, imgSize]);

  useEffect(() => {
      if (activeTab === 'strategy' && result?.visualPrompt && !generatedImg && !generatingImg && !imgError) {
          handleGenImage();
      }
  }, [activeTab, result, generatedImg, generatingImg, imgError, handleGenImage]);

  if (!trend) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-transparent text-slate-500 font-mono relative overflow-hidden">
        {/* Floating 3D Anchor for Empty State */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
             <Abstract3DAnchor type="sphere" className="w-96 h-96" color="#333" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
            <Target size={64} className="mb-6 opacity-40 animate-pulse text-slate-400" />
            <h2 className="text-xl tracking-[0.3em] uppercase font-bold text-slate-700 dark:text-slate-300">{t.targetNotAcquired}</h2>
            <p className="text-sm mt-4 font-light text-slate-500">{t.initScan}</p>
        </div>
      </div>
    );
  }

  // Score Bar Component (Neon Capsule)
  const NeonBar = ({ value, color }: { value: number, color: string }) => (
      <div className="h-3 w-full bg-black/10 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full neon-capsule"
            style={{ backgroundColor: color, color: color }} 
          />
      </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      
      {/* 1. Header Area with 3D Anchor */}
      <div className="p-8 pb-4 border-b border-black/5 dark:border-white/5 relative shrink-0 transition-colors">
         {/* 3D Decor positioned nicely */}
         <div className="absolute right-10 top-2 w-32 h-32 opacity-80 pointer-events-none">
             <Abstract3DAnchor type="donut" className="w-full h-full" color={trend.trendScore && trend.trendScore > 80 ? '#FF7E5F' : '#00F0FF'} />
         </div>

         <div className="relative z-10 pr-32">
            <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-white border border-black/10 dark:border-white/20 backdrop-blur-md">
                    {trend.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {trend.id.split('-')[1]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-[0.9] uppercase mb-8 transition-colors">
                {trend.topic}
            </h1>
            
            {/* --- TRANSPARENT LIQUID GLASS SLIDER --- */}
            {/* Base Container: Recessed Dark Glass */}
            <div className="relative w-full max-w-md h-16 p-1 rounded-full bg-[#050505]/40 border border-white/5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)] backdrop-blur-md flex overflow-hidden">
                
                {/* The Sliding Liquid Pill */}
                <motion.div 
                    className="absolute top-1 bottom-1 rounded-full z-0 overflow-hidden"
                    initial={false}
                    animate={{
                        left: activeTab === 'intel' ? '4px' : '50%',
                        right: activeTab === 'intel' ? '50%' : '4px',
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                >
                     {/* The "Glass" Body */}
                     <div className={`
                        w-full h-full rounded-full relative
                        border border-white/20
                        backdrop-blur-xl
                        transition-colors duration-700
                        ${activeTab === 'intel' ? 'bg-pulse/5 shadow-[0_0_30px_rgba(0,240,255,0.15)]' : 'bg-spark/5 shadow-[0_0_30px_rgba(255,126,95,0.15)]'}
                     `}>
                        {/* Top Specular Highlight (The wet look) */}
                        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent opacity-90 rounded-t-full" />
                        
                        {/* Inner Tint Glow */}
                        <div className={`absolute inset-0 opacity-20 rounded-full ${activeTab === 'intel' ? 'bg-gradient-to-tr from-pulse to-transparent' : 'bg-gradient-to-tr from-spark to-transparent'}`} />
                        
                        {/* Bottom Rim Light */}
                        <div className="absolute bottom-1 left-4 right-4 h-[1px] bg-white/40 blur-[1px] rounded-full" />
                     </div>
                </motion.div>

                {/* Tab 1 Trigger */}
                <button 
                    onClick={() => setActiveTab('intel')}
                    className="flex-1 relative z-10 h-full rounded-full flex items-center justify-center transition-colors duration-300 group"
                >
                    <span className={`text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'intel' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-105' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {t.tabIntel}
                    </span>
                </button>

                {/* Tab 2 Trigger */}
                <button 
                    onClick={() => setActiveTab('strategy')}
                    className="flex-1 relative z-10 h-full rounded-full flex items-center justify-center transition-colors duration-300 group"
                >
                    <span className={`text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'strategy' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-105' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {t.tabStrategy}
                    </span>
                </button>
            </div>

         </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
                <Abstract3DAnchor type="sphere" className="w-20 h-20 animate-spin-slow" color="#555" />
                <p className="text-xs font-mono text-pulse animate-pulse uppercase tracking-widest">{t.statusScanning}</p>
            </div>
        ) : result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
                
                {/* INTELLIGENCE TAB */}
                {activeTab === 'intel' && (
                    <div className="grid grid-cols-12 gap-8">
                        {/* Metrics Radar - Top Priority in visual hierarchy */}
                        <div className="col-span-12 lg:col-span-4 space-y-4 order-2 lg:order-1">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Impact Radar</h3>
                            <div className="space-y-5 bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 backdrop-blur-sm transition-colors">
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                                        <span>{t.monetization}</span>
                                        <span className="text-green-600 dark:text-green-400 font-black">{result.scores.monetization}</span>
                                    </div>
                                    <NeonBar value={result.scores.monetization} color="#22c55e" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                                        <span>{t.virality}</span>
                                        <span className="text-purple-600 dark:text-purple-400 font-black">{result.scores.virality}</span>
                                    </div>
                                    <NeonBar value={result.scores.virality} color="#a855f7" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                                        <span>{t.feasibility}</span>
                                        <span className="text-blue-600 dark:text-blue-400 font-black">{result.scores.feasibility}</span>
                                    </div>
                                    <NeonBar value={result.scores.feasibility} color="#3b82f6" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                                        <span>{t.competition}</span>
                                        <span className="text-red-600 dark:text-red-400 font-black">{result.scores.competition}</span>
                                    </div>
                                    <NeonBar value={result.scores.competition} color="#ef4444" />
                                </div>
                            </div>
                        </div>

                        {/* Text Analysis */}
                        <div className="col-span-12 lg:col-span-8 order-1 lg:order-2 space-y-8">
                             <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-8 rounded-[2rem] relative overflow-hidden transition-colors">
                                 {/* Decorative blur */}
                                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-pulse/10 rounded-full blur-[80px] pointer-events-none" />
                                 
                                 <h3 className="text-sm font-bold text-pulse uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                                     <Zap size={16} /> {t.situationReport}
                                 </h3>
                                 <p className="text-lg text-zinc-700 dark:text-slate-200 leading-relaxed font-light relative z-10 transition-colors">
                                     {result.deepDive}
                                 </p>
                                 <div className="mt-8 grid grid-cols-2 gap-8 relative z-10">
                                     <div>
                                         <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">{t.targetAudience}</span>
                                         <p className="text-sm font-medium text-zinc-900 dark:text-white transition-colors">{result.marketFit}</p>
                                     </div>
                                     <div>
                                         <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">{t.riskAssess}</span>
                                         <div className="flex items-center gap-2">
                                             <div className={`w-3 h-3 rounded-full ${trend.riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_green]'}`} />
                                             <span className="text-sm font-medium text-zinc-900 dark:text-white capitalize transition-colors">{trend.riskLevel || 'Unknown'} Risk</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Evidence */}
                             <div className="space-y-4">
                                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Evidence & Grounding</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {trend.evidence?.map((ev, i) => (
                                         <div key={i} className="p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 transition-colors">
                                             <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-3 leading-relaxed">"{ev.snippet}"</p>
                                             <div className="flex justify-between items-center">
                                                 <span className="text-[9px] font-bold text-slate-500 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-2 py-1 rounded uppercase">{ev.source}</span>
                                                 {ev.publishedTime && <span className="text-[9px] text-slate-600 font-mono">{ev.publishedTime}</span>}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 {result.relatedLinks?.length > 0 && (
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {result.relatedLinks.map((link, i) => (
                                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full transition-all hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-black/5 dark:hover:border-white/10">
                                                <ExternalLink size={10} /> {link.title}
                                            </a>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'strategy' && (
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 lg:col-span-7 space-y-8">
                            {/* Guideline Card */}
                             <div className="bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] p-8 relative overflow-hidden transition-colors">
                                 <div className="absolute top-0 right-0 p-8 opacity-20"><Layers size={100} className="text-zinc-900 dark:text-white" /></div>
                                 
                                 <div className="relative z-10">
                                     <span className="text-[10px] font-mono text-pulse bg-pulse/10 px-3 py-1 rounded border border-pulse/20 mb-4 inline-block">
                                         {t.dictMatch}: {result.guideline?.matchedCategory}
                                     </span>
                                     <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 transition-colors">
                                         {result.guideline?.coreKeyword || trend.topic}
                                     </h3>
                                     
                                     <div className="space-y-6">
                                         <div>
                                             <span className="text-[10px] text-slate-500 uppercase font-bold block mb-3">{t.prodSteps}</span>
                                             <ul className="space-y-3">
                                                {result.guideline?.productionSteps?.map((step, idx) => (
                                                    <li key={idx} className="flex gap-4 items-start text-sm text-zinc-700 dark:text-slate-300">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-black dark:text-white transition-colors">{idx+1}</span>
                                                        <span className="mt-0.5">{step}</span>
                                                    </li>
                                                ))}
                                             </ul>
                                         </div>
                                         <div className="pt-6 border-t border-black/5 dark:border-white/5">
                                             <span className="text-[10px] text-slate-500 uppercase font-bold block mb-3">{t.recTools}</span>
                                             <div className="flex flex-wrap gap-2">
                                                 {result.guideline?.recommendedTools?.map(t => (
                                                     <span key={t} className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-slate-300 transition-colors">{t}</span>
                                                 ))}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Visual Gen */}
                        <div className="col-span-12 lg:col-span-5">
                             <div className="sticky top-0 bg-white/80 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl transition-colors">
                                  <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
                                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white transition-colors">
                                          <Camera size={16} className="text-pulse" />
                                          <span>Visual Prototype</span>
                                      </div>
                                      <div className="flex gap-1 bg-black/10 dark:bg-black/30 p-1 rounded-lg">
                                        {(['1K', '2K', '4K'] as const).map(size => (
                                            <button key={size} onClick={() => setImgSize(size)} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${imgSize === size ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-zinc-900 dark:hover:text-white'}`}>{size}</button>
                                        ))}
                                      </div>
                                  </div>

                                  <div className="aspect-square bg-slate-100 dark:bg-[#050505] relative flex flex-col items-center justify-center p-8 group transition-colors">
                                      {generatedImg ? (
                                          <>
                                            <img src={generatedImg} alt="Gen" className="w-full h-full object-contain relative z-10" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4 backdrop-blur-sm">
                                                <a href={generatedImg} download className="h-10 px-6 bg-white text-black rounded-full font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"><ExternalLink size={14}/> SAVE</a>
                                                <button onClick={handleGenImage} className="h-10 px-6 bg-white/10 text-white border border-white/20 rounded-full font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"><RefreshCcw size={14}/> REGEN</button>
                                            </div>
                                          </>
                                      ) : (
                                          <div className="text-center space-y-4 max-w-[200px]">
                                              {generatingImg ? (
                                                   <Abstract3DAnchor type="capsule" className="w-16 h-16 mx-auto" color="#888" />
                                              ) : (
                                                   <Sparkles size={32} className="text-slate-400 dark:text-slate-600 mx-auto" />
                                              )}
                                              <p className="text-xs text-slate-500 font-mono">
                                                  {generatingImg ? `${t.rendering} ${imgSize}` : 'Waiting for generation...'}
                                              </p>
                                          </div>
                                      )}
                                      
                                      {/* Background Grid */}
                                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#888 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                                  </div>

                                  <div className="p-6">
                                      <button 
                                        onClick={handleGenImage}
                                        disabled={generatingImg || !result.visualPrompt}
                                        className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:bg-pulse hover:text-black hover:shadow-[0_0_20px_#00F0FF] transition-all disabled:opacity-50 disabled:shadow-none"
                                      >
                                          {generatingImg ? 'PROCESSING...' : t.genPrototype}
                                      </button>
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
