import React from 'react';
import { LayoutDashboard, Megaphone, Users, Settings, Zap, Database } from 'lucide-react';

interface Props {
  activePath?: string;
}

export function Sidebar({ activePath = 'dashboard' }: Props) {
  const menuItems = [
    { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard, color: 'text-pulse' },
    { id: 'campaigns', label: 'Active Ops', icon: Megaphone, color: 'text-spark' },
    // Removed 'Agents' to focus on Data Dashboard context
    { id: 'data', label: 'Neural Lake', icon: Database, color: 'text-alpha' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-card/50 border-r border-white/5 backdrop-blur-xl relative">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative overflow-hidden group">
        {/* Ambient Breath Glow */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 bg-pulse/10 blur-[50px] rounded-full animate-pulse pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
            {/* Logo Icon Container */}
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 shadow-[0_0_15px_rgba(0,212,255,0.1)] backdrop-blur-md group-hover:border-pulse/30 transition-colors duration-500">
                <Zap className="text-pulse drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] animate-[pulse_3s_ease-in-out_infinite]" size={20} fill="currentColor" fillOpacity={0.1} />
            </div>

            {/* Typography */}
            <div className="flex flex-col justify-center">
                <span className="text-lg font-black italic tracking-tighter text-white leading-none drop-shadow-md">
                    TREND
                </span>
                <span 
                    className="text-[10px] font-bold tracking-[0.15em] bg-gradient-to-r from-[#00d4ff] via-[#818cf8] to-[#a855f7] text-transparent bg-clip-text animate-[pulse_4s_ease-in-out_infinite]"
                    style={{ backgroundSize: '200% auto' }}
                >
                    Spot & Creat
                </span>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
              activePath === item.id 
                ? 'bg-white/5 text-white shadow-[0_0_20px_rgba(0,212,255,0.05)] border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {activePath === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-pulse shadow-[0_0_10px_#00d4ff]" />
            )}
            <item.icon 
              size={18} 
              className={`mr-3 transition-colors ${activePath === item.id ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} 
            />
            <span className="font-mono tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5">
        <button className="flex items-center w-full px-3 py-2 text-slate-500 hover:text-white transition-colors">
          <Settings size={18} className="mr-3" />
          <span className="text-sm font-mono">SYSTEM_CONFIG</span>
        </button>
      </div>
    </aside>
  );
}