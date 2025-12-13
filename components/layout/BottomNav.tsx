import React from 'react';
import { Home, PlusSquare, User, Zap } from 'lucide-react';

interface Props {
  activeTab: string;
  onNavigate: (tab: 'home' | 'profile') => void;
}

export function BottomNav({ activeTab, onNavigate }: Props) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-50 safe-area-bottom">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'home' ? 'text-pulse' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <Home size={20} />
        <span className="text-[10px] font-mono uppercase">Missions</span>
      </button>
      
      <button className="relative -top-5 active:scale-95 transition-transform">
        <div className="h-14 w-14 rounded-full bg-background border border-spark/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.3)]">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-spark to-red-600 flex items-center justify-center">
                <PlusSquare size={20} className="text-white" />
            </div>
        </div>
      </button>

      <button 
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'profile' ? 'text-pulse' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <User size={20} />
        <span className="text-[10px] font-mono uppercase">Earnings</span>
      </button>
    </div>
  );
}