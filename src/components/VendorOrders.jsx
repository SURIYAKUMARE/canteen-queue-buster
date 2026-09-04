import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ScanLine, 
  X, 
  Check, 
  User, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export default function VendorOrders() {
  const { 
    orders, 
    vendorOrderFilter, 
    setVendorOrderFilter, 
    acceptOrder, 
    rejectOrder, 
    markOrderReady, 
    setVendorTab 
  } = useCampus();

  const tabs = ['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'];

  const filteredOrders = orders.filter(o => {
    if (vendorOrderFilter === 'ALL') return true;
    return o.orderStatus === vendorOrderFilter;
  });

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>📋 Order Management Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400">Accept incoming orders, track preparation & deliver</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const count = tab === 'ALL' ? orders.length : orders.filter(o => o.orderStatus === tab).length;
          const isSelected = vendorOrderFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setVendorOrderFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs bg-slate-900/50 rounded-3xl border border-slate-800">
            No orders found under {vendorOrderFilter} status.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.orderId}
              className={`bg-slate-900 border rounded-3xl p-4 space-y-3 transition ${
                ord.orderStatus === 'PENDING'
                  ? 'border-amber-500/50 shadow-md shadow-amber-950/20'
                  : ord.orderStatus === 'READY'
                  ? 'border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-white bg-slate-800 px-2 py-0.5 rounded-md">
                      #{ord.orderId}
                    </span>
                    <strong className="text-xs font-bold text-slate-100">{ord.studentName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Roll: <strong className="text-slate-300">{ord.studentId}</strong> • Placed: {ord.createdAt}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    ord.orderStatus === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : ord.orderStatus === 'PREPARING'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : ord.orderStatus === 'READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : ord.orderStatus === 'COMPLETED'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {ord.orderStatus}
                </span>
              </div>

              {/* Items List */}
              <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                {ord.foodItems.map((it, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-orange-400">{it.quantity}x</span>
                      <span className="truncate">{it.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">₹{it.price * it.quantity}</span>
                  </div>
                ))}
                {ord.notes && (
                  <div className="text-[10px] text-amber-300 italic pt-1 border-t border-slate-800/80">
                    Note: "{ord.notes}"
                  </div>
                )}
              </div>

              {/* Footer & Action Controls */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Amount Paid</span>
                  <span className="font-mono font-bold text-sm text-white">₹{ord.totalAmount}</span>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  {ord.orderStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => rejectOrder(ord.orderId)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition"
                        title="Reject Order"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => acceptOrder(ord.orderId)}
                        className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Prep</span>
                      </button>
                    </>
                  )}

                  {ord.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => markOrderReady(ord.orderId)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Mark Ready for Pickup 🔔</span>
                    </button>
                  )}

                  {ord.orderStatus === 'READY' && (
                    <button
                      onClick={() => setVendorTab('scan')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-1"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>Scan QR to Deliver</span>
                    </button>
                  )}

                  {ord.orderStatus === 'COMPLETED' && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivered ✓</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
