
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendItem } from './types';
import { checkApiKey, searchGlobalTrends, getSearchSuggestions } from './services/geminiService';
import TrendListItem from './components/TrendListItem';
import AnalysisPanel from './components/AnalysisPanel';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { IntroLoader } from './components/layout/IntroLoader';
import { TRANSLATIONS } from './i18n';
import { 
    Flame, BrainCircuit, AlertTriangle, Ghost, Search, Zap, 
    Twitter, Linkedin, Video, MessageCircle, Youtube, Globe, LayoutGrid, 
    Instagram, Facebook, Moon, Sun, Languages, ArrowUpLeft, RefreshCw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG ---

type Lang = 'en' | 'zh';
type Theme = 'dark' | 'light';

const DISCOVERY_QUERIES = [
    "Viral TikTok Filters", "Instagram Aesthetic Trends", "Cosplay Photography", 
    "AI Video Generation Tools", "Cinematic Portrait Styles", "Streetwear Fashion Trends", 
    "Cyberpunk Art Styles", "Retro Anime Aesthetics", "Surrealist AI Art", "Fantasy Character Design"
];

const getPlatforms = (t: any) => [
    { id: 'ALL', label: t.tabAll, icon: LayoutGrid, color: 'text-text' },
    { id: 'X', label: t.twitter, icon: Twitter, color: 'text-text' }, 
    { id: 'TIKTOK', label: t.tiktok, icon: Video, color: 'text-[#ff0050]' },
    { id: 'REDDIT', label: t.reddit, icon: MessageCircle, color: 'text-[#ff4500]' },
    { id: 'LINKEDIN', label: t.linkedin, icon: Linkedin, color: 'text-[#0077b5]' },
    { id: 'YOUTUBE', label: t.youtube, icon: Youtube, color: 'text-[#ff0000]' },
    { id: 'INSTAGRAM', label: t.instagram, icon: Instagram, color: 'text-[#e1306c]' },
    { id: 'FACEBOOK', label: t.facebook, icon: Facebook, color: 'text-[#1877f2]' },
];

const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  
  // App State
  const [activePlatform, setActivePlatform] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null); // For Scroll Detection

  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  const t = TRANSLATIONS[lang];
  const PLATFORMS = getPlatforms(t);

  useEffect(() => {
    setHasKey(checkApiKey());
    document.documentElement.classList.add('dark');
    
    // Initial Load
    const initData = async () => {
        await handleSearch("Trending Visual Styles AI Filters"); 
        setIsDataReady(true);
    };

    initData();
  }, []);

  // --- AUTOCOMPLETE LOGIC ---
  useEffect(() => {
      const fetchSuggestions = async () => {
          if (searchQuery.length >= 2) {
              const results = await getSearchSuggestions(searchQuery);
              setSuggestions(results);
              setShowSuggestions(true);
          } else {
              setSuggestions([]);
              setShowSuggestions(false);
          }
      };

      const timer = setTimeout(fetchSuggestions, 300); // 300ms debounce
      return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleTheme = () => {
      if (theme === 'dark') {
          setTheme('light');
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
      } else {
          setTheme('dark');
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
      }
  };

  const toggleLang = () => {
      setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleSearch = async (query: string) => {
      setShowSuggestions(false); // Hide suggestions immediately
      setIsScanning(true);
      if (query !== searchQuery) setTrends([]); 
      setSelectedTrend(null);
      try {
          const results = await searchGlobalTrends(query);
          setTrends(results);
          if (results.length > 0) setSelectedTrend(results[0]);
      } catch (e) {
          console.error(e);
      } finally {
          setIsScanning(false);
      }
  };

  // NEW: Load More Logic
  const handleLoadMore = async () => {
      if (isLoadingMore || isScanning) return;
      setIsLoadingMore(true);
      
      // Pick a random discovery query to keep it fresh and visual-biased
      const randomQuery = DISCOVERY_QUERIES[Math.floor(Math.random() * DISCOVERY_QUERIES.length)];
      
      try {
          const newResults = await searchGlobalTrends(randomQuery);
          // Append new results, filtering out potential duplicates by ID
          setTrends(prev => {
              const existingIds = new Set(prev.map(t => t.id));
              const uniqueNew = newResults.filter(t => !existingIds.has(t.id));
              return [...prev, ...uniqueNew];
          });
      } catch (e) {
          console.error("Failed to load more trends", e);
      } finally {
          setIsLoadingMore(false);
      }
  };

  // NEW: Scroll Listener
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // Trigger when within 10px of bottom to be more responsive
      if (scrollHeight - scrollTop <= clientHeight + 10) {
          handleLoadMore();
      }
  }, [isLoadingMore, isScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()) handleSearch(searchQuery);
  };

  const selectSuggestion = (s: string) => {
      setSearchQuery(s);
      handleSearch(s);
  };

  // Filter Logic
  const filteredTrends = trends.filter(t => {
      if (activePlatform === 'ALL') return true;
      return t.platforms.some(p => p.toUpperCase().includes(activePlatform));
  });

  const trendingNow = filteredTrends.filter(t => (t.trendScore || 0) > 60).slice(0, 10); // Show more items
  const risks = filteredTrends.filter(t => t.riskLevel === 'high' || t.sentiment === 'negative');
  const agents = filteredTrends.filter(t => (t.trendScore || 0) > 75 && !risks.includes(t)); 

  return (
    <div className={`flex flex-col h-screen bg-background font-sans text-text overflow-hidden relative transition-colors duration-300`}>
      
      {/* GLOBAL LOADING SCREEN */}
      <AnimatePresence>
          {loadingApp && (
              <IntroLoader 
                  isDataReady={isDataReady} 
                  onComplete={() => setLoadingApp(false)} 
              />
          )}
      </AnimatePresence>
      
      <AnimatedBackground theme={theme} />
      
      {/* --- TOP BAR --- */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/90 backdrop-blur-md z-30 shrink-0 shadow-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 w-[250px]">
                <div className="w-8 h-8 bg-pulse/20 rounded flex items-center justify-center border border-pulse/30">
                    <Zap size={18} className="text-pulse fill-pulse" />
                </div>
                <div>
                    <h1 className="text-lg font-black text-text tracking-tighter leading-none">{t.appTitle}</h1>
                    <span className="text-[8px] font-mono text-slate-500 tracking-[0.3em] uppercase block mt-0.5">{t.appSubtitle}</span>
                </div>
           </div>

           {/* Social Filter Icons */}
           <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50vw]">
               {PLATFORMS.map((p) => (
                   <button
                       key={p.id}
                       onClick={() => setActivePlatform(p.id)}
                       className={`
                           flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 shrink-0
                           ${activePlatform === p.id 
                                ? 'bg-black/10 dark:bg-white/10 border-pulse text-text shadow-sm' 
                                : 'bg-transparent border-transparent text-slate-500 hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                           }
                       `}
                   >
                       <p.icon size={14} className={activePlatform === p.id ? p.color : 'currentColor'} />
                       <span className={`text-[10px] font-bold uppercase ${activePlatform === p.id ? 'block' : 'hidden xl:block'}`}>
                           {p.label}
                       </span>
                   </button>
               ))}
           </div>

           {/* Settings & Status */}
           <div className="w-[250px] flex justify-end items-center gap-4">
                {/* NEW: Refresh Button */}
                <button 
                    onClick={handleLoadMore} 
                    disabled={isLoadingMore}
                    className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-pulse transition-colors relative"
                    title="Refresh Data"
                >
                    <RefreshCw size={16} className={isLoadingMore ? "animate-spin text-pulse" : ""} />
                </button>

                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <button onClick={toggleLang} className="text-slate-500 hover:text-text transition-colors">
                        <Languages size={16} />
                    </button>
                    <button onClick={toggleTheme} className="text-slate-500 hover:text-text transition-colors">
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>

                {isScanning ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-pulse animate-pulse">
                        <Globe size={14} className="animate-spin" />
                        <span className="hidden lg:inline">{t.statusScanning}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="hidden lg:inline">{t.statusLive}</span>
                    </div>
                )}
           </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden z-10 pb-20"> 
        
        {/* LEFT: Feed */}
        <div 
            className="w-[380px] min-w-[380px] border-r border-border bg-card/80 backdrop-blur-sm h-full flex flex-col transition-colors"
        >
            <div className="p-3 border-b border-border bg-black/5 dark:bg-black/20 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Signals: {activePlatform}
                </span>
                <span className="text-[10px] font-mono text-pulse">
                    {filteredTrends.length} {t.signalsDetected}
                </span>
            </div>

            <div 
                ref={listRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar pb-32"
            >
                {filteredTrends.length === 0 && !isScanning ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center opacity-50">
                        <Ghost size={32} className="mb-3 text-slate-400" />
                        <p className="text-xs font-mono text-slate-500">{t.noSignals}</p>
                    </div>
                ) : (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <Flame size={14} className="text-[#ff6b35]" />
                                <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.sectionTrending}</h3>
                            </div>
                            <div className="space-y-1">
                                {trendingNow.map(t => (
                                    <TrendListItem key={t.id} trend={t} variant="trending" onClick={setSelectedTrend} isSelected={selectedTrend?.id === t.id} />
                                ))}
                            </div>
                        </section>
                        
                        {agents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3 px-1 pt-2 border-t border-border">
                                    <BrainCircuit size={14} className="text-pulse" />
                                    <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.sectionOpportunity}</h3>
                                </div>
                                <div className="space-y-1">
                                    {agents.map(t => (
                                        <TrendListItem key={`ag-${t.id}`} trend={t} variant="agent" onClick={setSelectedTrend} isSelected={selectedTrend?.id === t.id} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {risks.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3 px-1 pt-2 border-t border-border">
                                    <AlertTriangle size={14} className="text-yellow-500" />
                                    <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.sectionRisk}</h3>
                                </div>
                                <div className="space-y-1">
                                    {risks.map(t => (
                                        <TrendListItem key={`rk-${t.id}`} trend={t} variant="risk" onClick={setSelectedTrend} isSelected={selectedTrend?.id === t.id} />
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {/* Loading More Indicator */}
                        {isLoadingMore && (
                            <div className="py-4 flex justify-center text-pulse animate-pulse">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        )}
                    </>
                )}
                 <div className="h-12" />
            </div>
        </div>

        {/* RIGHT: Analysis */}
        <div className="flex-1 h-full bg-background relative overflow-hidden transition-colors">
            <AnalysisPanel trend={selectedTrend} t={t} />
        </div>

      </div>

      {/* --- FLOATING COMMAND BAR (BOTTOM) --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative group"
          >
              {/* SUGGESTIONS DROPDOWN (Pops UP) */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 left-0 right-0 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden p-1 z-50"
                    >
                        <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                             <span className="text-[10px] font-mono text-pulse uppercase tracking-wider">Visual Intelligence Suggestions</span>
                             <span className="text-[9px] text-slate-500">Gemini Flash-Lite</span>
                        </div>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => selectSuggestion(s)}
                                className="w-full text-left px-4 py-2.5 hover:bg-pulse/10 hover:text-pulse text-sm text-text transition-colors flex items-center gap-3 group/item"
                            >
                                <ArrowUpLeft size={12} className="text-slate-500 group-hover/item:text-pulse" />
                                {s}
                            </button>
                        ))}
                    </motion.div>
                )}
              </AnimatePresence>

              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pulse via-purple-500 to-spark rounded-full opacity-30 dark:opacity-30 group-focus-within:opacity-70 blur-md transition-opacity duration-500 hidden dark:block" />
              
              <form onSubmit={handleManualSubmit} className="relative bg-card/90 backdrop-blur-xl border border-border rounded-full flex items-center p-2 shadow-2xl transition-all duration-300 focus-within:ring-1 focus-within:ring-pulse/50">
                  <div className="pl-4 pr-3 text-slate-400">
                      {isScanning ? <Zap size={20} className="animate-pulse text-pulse" /> : <Search size={20} className="group-focus-within:text-pulse transition-colors" />}
                  </div>
                  <input 
                      ref={searchInputRef}
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.scanPlaceholder}
                      className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm h-10 placeholder:text-slate-500"
                      autoComplete="off"
                  />
                  <div className="flex items-center gap-2 pr-2">
                      <span className="hidden md:block text-[10px] font-mono text-slate-500 border border-border px-2 py-1 rounded">
                          ⏎ ENTER
                      </span>
                      <button 
                        type="submit"
                        disabled={isScanning}
                        className="bg-pulse hover:bg-pulse/80 text-black rounded-full p-2 transition-colors disabled:opacity-50"
                      >
                          <Zap size={18} fill="currentColor" />
                      </button>
                  </div>
              </form>
          </motion.div>
      </div>

    </div>
  );
};

export default App;
