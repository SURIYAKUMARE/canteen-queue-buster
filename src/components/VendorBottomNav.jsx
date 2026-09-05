import React from 'react';
import { useCampus } from '../context/CampusContext';
import { LayoutDashboard, Clock, ScanLine, UtensilsCrossed, User } from 'lucide-react';

export default function VendorBottomNav() {
  const { vendorTab, setVendorTab, orders } = useCampus();

  const pendingCount = orders.filter(o => o.orderStatus === 'PENDING').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Clock, badge: pendingCount },
    { id: 'scan', label: 'Scan QR', icon: ScanLine, isPrimary: true },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = vendorTab === item.id;

          return (
            <button
              key={item.id}
              id={`vendor-tab-${item.id}`}
              onClick={() => setVendorTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition relative ${
                isActive ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.isPrimary ? (
                  <div className={`p-2 rounded-xl transition ${
                    isActive ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-orange-400' : 'text-slate-400'}`} />
                )}

                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
              {isActive && !item.isPrimary && (
                <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
