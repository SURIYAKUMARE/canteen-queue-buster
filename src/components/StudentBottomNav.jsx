import React from 'react';
import { useCampus } from '../context/CampusContext';
import { Home, UtensilsCrossed, Clock, QrCode, User } from 'lucide-react';

export default function StudentBottomNav() {
  const { studentTab, setStudentTab, cartCount, activeStudentOrder } = useCampus();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders', icon: Clock },
    { id: 'qr', label: 'My QR', icon: QrCode, hasPulse: !!activeStudentOrder },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = studentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setStudentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition relative ${
                isActive ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-orange-400' : 'text-slate-400'}`} />
                {item.hasPulse && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
