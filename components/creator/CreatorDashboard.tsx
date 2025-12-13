import React, { useState, useEffect } from 'react';
import { Shield, Zap, TrendingUp, DollarSign, MousePointer2, CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingCard } from '../effects/BreathingCard';
import { TrendLine } from '../effects/TrendLine';
import { GlitchTicker } from '../effects/GlitchTicker'; // Updated import

interface Props {
  activeTab: 'home' | 'profile';
}

// Mock User Profile
const USER_BASE = {
  name: "Neo_Kai",
  tier: "Pulse", // Level 2
  levelColor: "#00d4ff", // Pulse Color
  vScore: 840,
  nextLevel: 1000,
  balance: 1240.50
};

// Mock Missions
const MISSIONS = [
  { id: 1, title: "Gemini 2.5 Launch Hype", budget: "$2,000", estYield: "$50-500", type: "Viral Thread", difficulty: "Hard" },
  { id: 2, title: "Cyberpunk Aesthetics Reel", budget: "$800", estYield: "$20-150", type: "Short Video", difficulty: "Medium" },
  { id: 3, title: "React 19 Hot Take", budget: "$1,200", estYield: "$40-300", type: "LinkedIn Post", difficulty: "Easy" },
];

export function CreatorDashboard({ activeTab }: Props) {
  const [claimedTasks, setClaimedTasks] = useState<number[]>([]);
  const [showLinkModal, setShowLinkModal] = useState<number | null>(null);
  
  // Real-time balance simulation
  const [balance, setBalance] = useState(USER_BASE.balance);

  useEffect(() => {
    // Simulate random affiliate clicks adding small revenue
    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const increment = parseFloat((Math.random() * 5).toFixed(2));
            setBalance(prev => prev + increment);
        }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (id: number) => {
    setClaimedTasks(prev => [...prev, id]);
    setShowLinkModal(id);
    setTimeout(() => setShowLinkModal(null), 3000); // Hide after 3s
  };

  const progressPercent = (USER_BASE.vScore / USER_BASE.nextLevel) * 100;

  return (
    <div className="h-full overflow-y-auto pb-20 bg-background/50 relative"> {/* Added transparency for background */}
      
      {/* --- HEADER: USER TIER STATUS --- */}
      <div className="relative p-6 border-b border-white/5 overflow-hidden">
        {/* Ambient Glow based on Tier */}
        <div 
          className="absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-20 pointer-events-none rounded-full"
          style={{ backgroundColor: USER_BASE.levelColor }} 
        />
        
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-bold text-white font-mono tracking-tight">{USER_BASE.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Shield size={14} style={{ color: USER_BASE.levelColor }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: USER_BASE.levelColor }}>
                            Level 2: {USER_BASE.tier}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">V-Score</span>
                    <span className="text-2xl font-bold text-white font-mono">{USER_BASE.vScore}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full relative"
                    style={{ backgroundColor: USER_BASE.levelColor }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                </motion.div>
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-mono text-slate-500 uppercase">
                <span>Current Tier</span>
                <span>{USER_BASE.nextLevel - USER_BASE.vScore} to Surge</span>
            </div>
        </div>
      </div>

      {/* --- VIEW: TASK HUB (HOME) --- */}
      {activeTab === 'home' && (
        <div className="p-4 space-y-4 relative z-10">
           <div className="flex items-center gap-2 mb-2 px-1">
               <Zap size={16} className="text-white" />
               <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">For You</h2>
           </div>

           {MISSIONS.map(mission => {
             const isClaimed = claimedTasks.includes(mission.id);
             return (
               <BreathingCard 
                 key={mission.id} 
                 theme={USER_BASE.levelColor} 
                 intensity="low"
                 className="mb-4"
               >
                 <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[9px] font-mono text-slate-400 uppercase">
                        {mission.type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${mission.difficulty === 'Hard' ? 'text-spark' : 'text-slate-400'}`}>
                        {mission.difficulty}
                    </span>
                 </div>
                 
                 <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                 
                 <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-black/40 rounded border border-white/5">
                    <div>
                        <span className="block text-[10px] text-slate-500 uppercase">Total Budget</span>
                        <span className="text-sm font-mono text-white">{mission.budget}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-500 uppercase">Est. Yield</span>
                        <span className="text-sm font-mono" style={{ color: USER_BASE.levelColor }}>{mission.estYield}</span>
                    </div>
                 </div>

                 <button
                   onClick={() => !isClaimed && handleClaim(mission.id)}
                   disabled={isClaimed}
                   className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
                     isClaimed 
                       ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent' 
                       : `bg-${USER_BASE.tier === 'Pulse' ? 'pulse' : 'white'} text-black hover:brightness-110 border border-transparent`
                   }`}
                   style={{ backgroundColor: !isClaimed ? USER_BASE.levelColor : undefined }}
                 >
                   {isClaimed ? (
                     <>
                        <CheckCircle2 size={14} />
                        Active Mission
                     </>
                   ) : (
                     <>
                        Claim Mission
                        <ArrowRight size={14} />
                     </>
                   )}
                 </button>

                 {/* Link Generation Simulation Modal/Overlay within card */}
                 <AnimatePresence>
                   {showLinkModal === mission.id && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center"
                     >
                        <CheckCircle2 size={32} className="text-green-500 mb-2" />
                        <h4 className="text-white font-bold mb-1">Link Generated!</h4>
                        <div className="bg-black border border-slate-700 p-2 rounded w-full flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-400 truncate font-mono flex-1">https://tr.nd/x9s8...</span>
                            <Copy size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] text-slate-500">Redirecting to clipboard...</p>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </BreathingCard>
             );
           })}
        </div>
      )}

      {/* --- VIEW: EARNINGS PANEL (PROFILE) --- */}
      {activeTab === 'profile' && (
        <div className="p-4 space-y-6 relative z-10">
            
            {/* Balance Card with Glitch Ticker Effect */}
            <div className="relative p-6 rounded border border-slate-800 bg-gradient-to-br from-slate-900/80 to-black/80 overflow-hidden backdrop-blur-sm">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-2">Current Balance</span>
                    <div className="flex items-start gap-1">
                         <span className="text-lg text-slate-500 mt-1">$</span>
                         {/* Glitch Ticker Component */}
                         <GlitchTicker 
                           value={balance} 
                           decimals={2} 
                           className="text-4xl font-bold text-white font-mono" 
                         />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button className="px-4 py-1.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-white/10">History</button>
                        <button className="px-4 py-1.5 rounded bg-white text-black text-[10px] font-bold uppercase hover:bg-slate-200">Cash Out</button>
                    </div>
                </div>
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <MousePointer2 size={14} />
                        <span className="text-[10px] uppercase font-mono">Total Clicks</span>
                    </div>
                    <span className="text-xl font-bold text-white">4,281</span>
                    <span className="text-[10px] text-green-500 block mt-1">↑ 12% vs last week</span>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Shield size={14} className="text-green-500" />
                        <span className="text-[10px] uppercase font-mono">Valid Clicks</span>
                    </div>
                    <span className="text-xl font-bold text-white">3,904</span>
                    <span className="text-[10px] text-slate-500 block mt-1">91.2% Quality Rate</span>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="h-48 w-full bg-black/60 border border-slate-800 rounded p-4 relative backdrop-blur-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                    <TrendingUp size={14} />
                    7-Day Yield
                </h3>
                <div className="absolute inset-x-0 bottom-0 top-10 opacity-50">
                     <TrendLine data={[120, 150, 180, 140, 200, 240, 280, 310, 300, 350]} color={USER_BASE.levelColor} />
                </div>
            </div>

            {/* Recent Activity List */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 px-1">Recent Conversions</h3>
                <div className="space-y-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-900/30 border border-white/5 rounded text-sm backdrop-blur-sm">
                            <div className="flex flex-col">
                                <span className="text-slate-300 font-mono text-xs">Mission #X92-{i}</span>
                                <span className="text-[10px] text-slate-600">Today, 10:42 AM</span>
                            </div>
                            <span className="font-bold text-green-500 font-mono">+$4.20</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      )}
    </div>
  );
}