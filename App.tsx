
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendItem } from './types';
import { checkApiKey, searchGlobalTrends, getSearchSuggestions } from './services/geminiService';
import TrendListItem from './components/TrendListItem';
import TrendGalleryCard from './components/TrendGalleryCard';
import AnalysisPanel from './components/AnalysisPanel';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { CrawlLoader } from './components/layout/CrawlLoader';
import { useRankings, RankedItem } from './hooks/useRankings';
import { Dashboard } from './components/admin/Dashboard';
import { AdminPage } from './components/admin/AdminPage';
import { SpiderServerDoc } from './components/SpiderServerDoc';
import { TRANSLATIONS } from './i18n';
import {
    Flame, BrainCircuit, AlertTriangle, Search, Zap,
    Twitter, Linkedin, Video, MessageCircle, Youtube, Globe, LayoutGrid,
    Instagram, Facebook, ArrowUpLeft, RefreshCw,
    List, Grid, Box, CornerDownLeft, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIG ---
type PageView = 'search' | 'dashboard' | 'admin';
type Lang = 'en' | 'zh';
type Theme = 'dark' | 'light';
type ViewMode = 'list' | 'gallery';

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

const SkeletonItem: React.FC<{ mode: ViewMode }> = ({ mode }) => {
    return (
        <div className={`rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 animate-pulse flex flex-col justify-center px-6 ${mode === 'gallery' ? 'h-40' : 'h-24'}`}>
            <div className="h-3 w-1/3 bg-black/10 dark:bg-white/10 rounded-full mb-3" />
            <div className="h-2 w-2/3 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>
    );
};

// --- CUSTOM ICONS ---
const ButterflyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 60C50 60 70 20 90 30C100 40 90 70 70 80C60 85 50 85 50 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 60C50 60 30 20 10 30C0 40 10 70 30 80C40 85 50 85 50 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 60L50 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="90" cy="30" r="4" fill="currentColor" />
        <circle cx="10" cy="30" r="4" fill="currentColor" />
    </svg>
);

const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  
  // 排名数据
  const { rankings, getPlatformRanking, getGlobalRanking, refresh: refreshRankings } = useRankings(true, 30000);

  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [activePlatform, setActivePlatform] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null); 

  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSpiderDoc, setShowSpiderDoc] = useState(false);

  const t = TRANSLATIONS[lang];
  const PLATFORMS = getPlatforms(t);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
      const timer = setTimeout(fetchSuggestions, 300);
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

  const toggleLang = () => { setLang(prev => prev === 'en' ? 'zh' : 'en'); };

  const handleSearch = async (query: string) => {
      setShowSuggestions(false);
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

  const handleLoadMore = async () => {
      if (isLoadingMore || isScanning) return;
      setIsLoadingMore(true);
      const randomQuery = DISCOVERY_QUERIES[Math.floor(Math.random() * DISCOVERY_QUERIES.length)];
      try {
          const newResults = await searchGlobalTrends(randomQuery);
          setTrends(prev => {
              const existingIds = new Set(prev.map(t => t.id));
              const uniqueNew = newResults.filter(t => !existingIds.has(t.id));
              return [...prev, ...uniqueNew];
          });
      } catch (e) { console.error(e); } finally { setIsLoadingMore(false); }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 50) handleLoadMore();
  }, [isLoadingMore, isScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()) handleSearch(searchQuery);
  };

  const selectSuggestion = (s: string) => {
      setSearchQuery(s);
      handleSearch(s);
  };

  const filteredTrends = trends.filter(t => {
      if (activePlatform === 'ALL') return true;
      return t.platforms.some(p => p.toUpperCase().includes(activePlatform));
  });

  const trendingNow = filteredTrends.filter(t => (t.trendScore || 0) > 60);
  const risks = filteredTrends.filter(t => t.riskLevel === 'high' || t.sentiment === 'negative');
  const agents = filteredTrends.filter(t => (t.trendScore || 0) > 75 && t.riskLevel !== 'high');

  const renderTrendSection = (items: TrendItem[], variant: 'trending' | 'agent' | 'risk') => {
      if (isScanning && items.length === 0) return <div className="space-y-4">{[1,2].map(i => <SkeletonItem key={i} mode={viewMode} />)}</div>;
      if (items.length === 0) return <div className="py-8 text-center border border-dashed border-black/5 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-white/5"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Signals</span></div>;

      const ItemComponent = viewMode === 'gallery' ? TrendGalleryCard : TrendListItem;
      const containerClass = viewMode === 'gallery' ? "grid grid-cols-2 gap-4" : "space-y-3";

      return (
          <div className={containerClass}>
              {items.map(t => (
                  <ItemComponent key={`${variant}-${t.id}`} trend={t} variant={variant} onClick={setSelectedTrend} isSelected={selectedTrend?.id === t.id} />
              ))}
          </div>
      );
  };

  return (
    <div className="flex h-screen bg-transparent font-sans text-text overflow-hidden relative transition-colors duration-700">
      
      <AnimatePresence>
          {loadingApp && <CrawlLoader onComplete={() => {
              setLoadingApp(false);
              // 加载完成后刷新排名数据
              refreshRankings();
              // 加载完成后自动执行初始搜索
              if (checkApiKey()) {
                  handleSearch("Trending Visual Styles AI Filters");
              }
          }} />}
      </AnimatePresence>
      
      <AnimatedBackground theme={theme} />
      
      {/* 2. MAIN CONTENT (Bento Grid) - Removed Sidebar, Updated Padding */}
      <div className="flex-1 flex flex-col p-6 gap-6 h-full overflow-hidden w-full">
          
          {/* HEADER ISLAND */}
          <header className="h-20 shrink-0 glass-high rounded-[2rem] px-8 flex items-center justify-between z-30 gap-6">
              
              {/* LOGO BRANDING (Updated to Butterfly) - Click to go to COMMAND_CENTER */}
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="p-2 bg-gradient-to-br from-[#BD00FF]/20 to-[#00F0FF]/10 rounded-xl border border-white/10 shadow-[0_5px_15px_rgba(189,0,255,0.2)] backdrop-blur-md">
                    <ButterflyIcon className="text-white w-5 h-5 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-lg font-black italic tracking-tighter text-zinc-900 dark:text-white/90 leading-none drop-shadow-sm transition-colors">
                        TREND
                    </span>
                    <span 
                        className="text-[8px] font-bold tracking-[0.25em] bg-gradient-to-r from-[#00F0FF] via-[#BD00FF] to-[#FF7E5F] text-transparent bg-clip-text"
                        style={{ backgroundSize: '200% auto' }}
                    >
                        PULSE
                    </span>
                </div>
              </button>

              {/* Separator */}
              <div className="h-8 w-px bg-black/10 dark:bg-white/10 hidden md:block shrink-0 transition-colors" />

              {/* Platform Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mask-gradient-r">
                 {PLATFORMS.map((p) => (
                   <button
                       key={p.id}
                       onClick={() => {
                           setActivePlatform(p.id);
                           // If on dashboard/admin page, switch to search page
                           if (currentPage !== 'search') {
                               setCurrentPage('search');
                           }
                       }}
                       className={`
                           flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 shrink-0
                           ${activePlatform === p.id && currentPage === 'search'
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] border-transparent scale-105 font-bold' 
                                : 'bg-transparent border-transparent text-slate-500 hover:text-zinc-900 dark:hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                           }
                       `}
                   >
                       <p.icon size={16} className={activePlatform === p.id && currentPage === 'search' ? 'text-white dark:text-black' : 'currentColor'} />
                       <span className={`text-[10px] font-bold uppercase tracking-wide ${activePlatform === p.id && currentPage === 'search' ? 'block' : 'hidden xl:block'}`}>
                           {p.label}
                       </span>
                   </button>
                 ))}
              </div>

              {/* Tools */}
              <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-black/20 rounded-full border border-black/5 dark:border-white/5 transition-colors">
                      {/* 系统管理按钮 */}
                      <button
                          onClick={() => setCurrentPage('admin')}
                          className={`transition-colors ${currentPage === 'admin' ? 'text-purple-500' : 'text-slate-500 hover:text-zinc-900 dark:hover:text-white'}`}
                          title="System Admin"
                      >
                          <Settings size={18} />
                      </button>
                  </div>
                  <button 
                      onClick={() => setLoadingApp(true)} 
                      disabled={loadingApp}
                      className="w-10 h-10 rounded-full bg-spark/10 hover:bg-spark/20 text-spark flex items-center justify-center transition-all border border-spark/20"
                      title="重新爬取数据"
                  >
                      <RefreshCw size={16} className={loadingApp ? "animate-spin" : ""} />
                  </button>
              </div>
          </header>

          {/* 根据 currentPage 显示不同内容 */}
          {currentPage === 'admin' ? (
              <div className="flex-1 min-h-0 overflow-hidden">
                  <AdminPage onBack={() => setCurrentPage('dashboard')} />
              </div>
          ) : currentPage === 'dashboard' ? (
              <div className="flex-1 overflow-hidden">
                  <Dashboard />
              </div>
          ) : (
          <>
          {/* MAIN GRID */}
          <div className="flex-1 flex gap-6 overflow-hidden">

              {/* FEED ISLAND (Left) */}
              <div className="w-[480px] min-w-[480px] glass-high rounded-[2.5rem] flex flex-col overflow-hidden relative z-10">
                  <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-end bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 transition-colors">
                      <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block">
                              Incoming Stream
                          </span>
                          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
                              {activePlatform === 'ALL' ? 'Global Feed' : activePlatform}
                              <span className="text-sm font-mono text-pulse bg-pulse/10 px-2 py-1 rounded-md border border-pulse/20">
                                  {filteredTrends.length}
                              </span>
                          </h2>
                      </div>
                      <div className="flex gap-2">
                          {/* 视图模式切换 */}
                          <div className="flex bg-black/5 dark:bg-black/20 rounded-xl p-1 border border-black/5 dark:border-white/5 backdrop-blur-sm transition-colors">
                              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-zinc-900 dark:hover:text-white'}`}><List size={16} /></button>
                              <button onClick={() => setViewMode('gallery')} className={`p-2 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-zinc-900 dark:hover:text-white'}`}><Grid size={16} /></button>
                          </div>
                      </div>
                  </div>

                  {/* 趋势流内容 */}
                  <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar mask-gradient-b">
                      <section>
                          <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-spark/10 rounded-lg"><Flame size={18} className="text-spark" /></div>
                              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors">{t.sectionTrending}</h3>
                          </div>
                          {renderTrendSection(trendingNow, 'trending')}
                      </section>
                      <section>
                          <div className="flex items-center gap-3 mb-6 pt-6 border-t border-black/5 dark:border-white/5 transition-colors">
                              <div className="p-2 bg-pulse/10 rounded-lg"><BrainCircuit size={18} className="text-pulse" /></div>
                              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors">{t.sectionOpportunity}</h3>
                          </div>
                          {renderTrendSection(agents, 'agent')}
                      </section>
                      <section>
                          <div className="flex items-center gap-3 mb-6 pt-6 border-t border-black/5 dark:border-white/5 transition-colors">
                              <div className="p-2 bg-yellow-500/10 rounded-lg"><AlertTriangle size={18} className="text-yellow-500" /></div>
                              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors">{t.sectionRisk}</h3>
                          </div>
                          {renderTrendSection(risks, 'risk')}
                      </section>
                      <div className="h-20" />
                  </div>
              </div>

              {/* ANALYSIS ISLAND (Right) */}
              <div className="flex-1 glass-high rounded-[2.5rem] overflow-hidden relative z-10 flex flex-col">
                  <AnalysisPanel trend={selectedTrend} t={t} />
              </div>

          </div>

          {/* FLOATING COMMAND BAR (Bottom) - Centered & Updated Colors */}
          <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
             <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-3xl pointer-events-auto relative px-4">
                
                {/* Suggestions Popover */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-4 left-4 right-4 glass-high border border-indigo-500/20 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.1)] overflow-hidden p-2 backdrop-blur-xl">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => selectSuggestion(s)} className="w-full text-left px-6 py-4 hover:bg-white/5 rounded-2xl hover:text-white text-sm text-indigo-200 transition-colors flex items-center gap-4 group/item font-medium">
                                <ArrowUpLeft size={16} className="text-indigo-400 group-hover/item:text-[#00F0FF]" />
                                {s}
                            </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Pill - REFACTORED FOR DIM -> GLOW INTERACTION */}
                <form 
                  onSubmit={handleManualSubmit} 
                  className="
                    relative group rounded-full flex items-center p-2 pl-6
                    transition-all duration-500 ease-out
                    /* Default State: Dim, glassy, subtle border */
                    bg-black/40 backdrop-blur-md border border-white/5
                    shadow-lg
                    /* Hover/Focus State: Glowing, Gradient, defined border */
                    hover:bg-zinc-900/80 hover:border-white/20 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]
                    focus-within:bg-zinc-900/90 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_50px_rgba(79,70,229,0.5)]
                    focus-within:ring-1 focus-within:ring-indigo-500/50
                  "
                >
                    
                    {/* Ambient Glow behind the bar - Invisible by default, fades in on interaction */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl -z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
                    
                    {/* Search Icon */}
                    <div className="mr-4 text-slate-600 group-hover:text-slate-200 group-focus-within:text-[#00F0FF] transition-colors duration-300">
                        {isScanning ? <Zap size={24} className="animate-pulse text-[#00F0FF]" /> : <Search size={22} />}
                    </div>
                    
                    {/* Input Field & Animated Placeholder */}
                    <div className="flex-1 relative h-14 flex items-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            {searchQuery === "" && !isScanning && (
                                <motion.div 
                                    className="absolute inset-0 flex items-center pointer-events-none"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                >
                                    {t.scanPlaceholder.split('').map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, y: 8, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ 
                                                duration: 0.3,
                                                delay: i * 0.02, // Rapid staggered delay
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 25
                                            }}
                                            className="text-slate-500/50 font-medium text-base font-sans group-hover:text-slate-300 group-focus-within:text-slate-400 transition-colors duration-300"
                                        >
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input 
                            ref={searchInputRef}
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-transparent border-none outline-none text-slate-300 font-sans text-base font-medium tracking-wide selection:bg-[#BD00FF]/30 z-10 relative group-focus-within:text-white transition-colors"
                        />
                    </div>
                    
                    {/* Right Side Actions - CHANGED TO ENTER BUTTON */}
                    <div className="flex items-center gap-2 pr-2">
                        <button 
                            type="submit" 
                            disabled={isScanning} 
                            className="h-10 px-4 rounded-full bg-white/5 border border-white/5 flex items-center gap-3 transition-all group/btn active:scale-95 shadow-none opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:bg-white/10 group-hover:border-white/10 group-hover:shadow-lg"
                        >
                            <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-300 transition-colors tracking-widest">ENTER</span>
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                                <CornerDownLeft size={14} className="text-slate-500 group-hover:text-indigo-300 transition-colors" />
                            </div>
                        </button>
                    </div>
                </form>

             </motion.div>
          </div>
          </>
          )}

      </div>

      {/* 爬虫服务文档模态框 */}
      <SpiderServerDoc isOpen={showSpiderDoc} onClose={() => setShowSpiderDoc(false)} />
    </div>
  );
};

export default App;
