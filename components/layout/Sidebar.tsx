
import React from 'react';
import { LayoutDashboard, Settings, Zap } from 'lucide-react';

interface Props {
  activePath?: string;
}

export function Sidebar({ activePath = 'dashboard' }: Props) {
  // Only keeping Mission Control as requested
  const menuItems = [
    { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard, color: 'text-pulse' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-4rem)] my-auto ml-6 relative z-20">
      
      {/* Container: Floating Glass Bento Box */}
      <div className="flex-1 glass-high rounded-[2rem] flex flex-col overflow-hidden">
          
          {/* Logo Area */}
          <div className="h-28 flex items-center px-8 border-b border-white/5 relative group">
            {/* Ambient Glow */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 bg-pulse/10 blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 flex items-center gap-4">
                {/* 3D-ish Logo Icon */}
                <div className="p-3 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all duration-500 backdrop-blur-md">
                    <Zap className="text-pulse drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" size={24} fill="currentColor" fillOpacity={0.2} />
                </div>

                <div className="flex flex-col justify-center">
                    <span className="text-xl font-black italic tracking-tighter text-white/90 leading-none drop-shadow-sm">
                        TREND
                    </span>
                    <span 
                        className="text-[10px] font-bold tracking-[0.25em] bg-gradient-to-r from-pulse via-white to-surge text-transparent bg-clip-text"
                        style={{ backgroundSize: '200% auto' }}
                    >
                        PULSE
                    </span>
                </div>
            </div>
          </div>

          {/* Navigation with Huge Whitespace */}
          <nav className="flex-1 py-10 px-6 space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                  activePath === item.id 
                    ? 'bg-white/10 text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] border border-white/10 backdrop-blur-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active Indicator Glow */}
                {activePath === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-pulse to-transparent opacity-80" />
                )}
                
                <item.icon 
                  size={20} 
                  className={`mr-5 relative z-10 transition-colors ${activePath === item.id ? item.color : 'text-slate-500 group-hover:text-slate-200'}`} 
                />
                <span className="font-sans tracking-wide relative z-10 text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-8 border-t border-white/5">
            <button className="flex items-center w-full px-5 py-4 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-2xl group border border-transparent hover:border-white/5">
              <Settings size={20} className="mr-4 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs font-sans font-bold tracking-widest uppercase">System Config</span>
            </button>
          </div>
      </div>
    </aside>
  );
}
