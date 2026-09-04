import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  UtensilsCrossed, 
  ChefHat, 
  TrendingUp, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Clock, 
  Radio,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function Header() {
  const { 
    activeView, 
    setActiveView, 
    simulatedCurrentTime, 
    maxCapacityPerSlot, 
    isConnected,
    simulateRush,
    resetDemo,
    advanceClock
  } = useCanteen();

  const navItems = [
    { id: 'viva', label: 'Project Showcase', icon: Sparkles, badge: 'Viva Demo' },
    { id: 'student', label: 'Student App', icon: UtensilsCrossed, badge: 'Pre-Order' },
    { id: 'kitchen', label: 'Kitchen Hub', icon: ChefHat, badge: 'Ops' },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, badge: 'Moving Avg' },
    { id: 'nlp', label: 'Walk-in NLP', icon: Mic, badge: 'AI Concept' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner with Clock & Live status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 text-xs">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 font-bold text-base">
            🍛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-sm">Smart Canteen System</span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Queue Decoupled
              </span>
            </div>
            <p className="text-slate-400 text-[11px] hidden sm:block">
              College Canteen Queue Management & Demand Forecasting Prototype
            </p>
          </div>
        </div>

        {/* Live Ops Metrics & Clock Controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Simulated Time */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-300">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono font-semibold text-white">{simulatedCurrentTime}</span>
            <button
              onClick={() => advanceClock(5)}
              title="Advance canteen clock by 5 minutes to simulate time passage"
              className="ml-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-1.5 py-0.5 rounded transition"
            >
              +5m
            </button>
          </div>

          {/* Slot Capacity Config indicator */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Cap: <strong className="text-white font-mono">{maxCapacityPerSlot}</strong> items/slot</span>
          </div>

          {/* Live Sync Status */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="hidden sm:inline">{isConnected ? 'Live Sync' : 'Polling'}</span>
          </div>

          {/* Quick Demo Simulator Buttons */}
          <button
            onClick={simulateRush}
            title="Inject simulated student lunch orders across slots"
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-2.5 py-1 rounded-md text-xs shadow-md transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Simulate Rush</span>
          </button>

          <button
            onClick={resetDemo}
            title="Reset system to clean initial state with 3 seed orders"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded-md text-xs transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
