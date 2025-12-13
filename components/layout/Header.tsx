
import React, { useState } from 'react';
import { Search, Command, Zap } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export const Header: React.FC<Props> = ({ onSearch, loading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSearch(input);
  };

  return (
    <div className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center px-6 gap-6 shrink-0 z-20 shadow-xl">
       {/* Branding */}
       <div className="flex items-center gap-3 w-[300px]">
            <div className="w-8 h-8 bg-pulse/20 rounded flex items-center justify-center border border-pulse/30">
                <Zap size={18} className="text-pulse fill-pulse" />
            </div>
            <div>
                <h1 className="text-lg font-black text-white tracking-tighter leading-none">TREND PULSE</h1>
                <span className="text-[8px] font-mono text-slate-500 tracking-[0.3em] uppercase block mt-0.5">Intelligence Ops</span>
            </div>
       </div>

       {/* Search Bar */}
       <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative group">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pulse transition-colors" />
           <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Initialize Scan Target (e.g., 'DeepSeek', 'Sustainable Fashion', 'Crypto')..." 
              className="w-full h-10 bg-[#050505] border border-slate-800 rounded-full pl-12 pr-12 text-sm text-white font-mono focus:outline-none focus:border-pulse/50 focus:shadow-[0_0_15px_rgba(0,212,255,0.1)] transition-all placeholder:text-slate-600"
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
               <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">ENTER</span>
           </div>
       </form>

       {/* Status Indicators */}
       <div className="flex-1 flex justify-end items-center gap-4">
           {loading && (
               <div className="flex items-center gap-2 text-xs font-mono text-pulse animate-pulse">
                   <Command size={12} className="animate-spin" />
                   SCANNING NETWORK...
               </div>
           )}
           <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/10">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-mono text-slate-400">GEMINI_UPLINK: ONLINE</span>
           </div>
       </div>
    </div>
  );
};
