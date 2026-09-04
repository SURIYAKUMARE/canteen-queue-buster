import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  ScanLine, 
  ShoppingBag, 
  TrendingUp, 
  Store, 
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';

export default function VendorDashboard() {
  const { 
    orders, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    setVendorTab, 
    setVendorOrderFilter,
    acceptOrder,
    markOrderReady,
    menu
  } = useCampus();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');
  const preparingOrders = orders.filter(o => o.orderStatus === 'PREPARING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const completedOrders = orders.filter(o => o.orderStatus === 'COMPLETED');

  const todayRevenue = orders
    .filter(o => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fade-in">
      {/* Canteen Vendor Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Central Canteen Ops</h2>
              <p className="text-[11px] text-slate-400 font-mono">Counter: Bay 1 & Bay 2</p>
            </div>
          </div>

          <button
            onClick={toggleCanteenStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isCanteenOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span>{isCanteenOpen ? 'Canteen OPEN' : 'CLOSED'}</span>
          </button>
        </div>
      </div>

      {/* Revenue & Total Orders Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            ₹{todayRevenue}
          </div>
          <span className="text-[10px] text-slate-500">From {orders.length} digital orders</span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-orange-950/40 border border-orange-500/30 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {totalOrders}
          </div>
          <span className="text-[10px] text-orange-400 font-mono">{completedOrders.length} delivered</span>
        </div>
      </div>

      {/* Live Order Pipeline Counters */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Live Kitchen Queue Status
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <div 
            onClick={() => { setVendorOrderFilter('PENDING'); setVendorTab('orders'); }}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl text-center cursor-pointer transition active:scale-95"
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Pending</span>
            <strong className="text-xl font-black font-mono text-slate-200">{pendingOrders.length}</strong>
            <span className="text-[9px] text-amber-400 font-bold block mt-0.5">Needs action</span>
          </div>

          <div 
            onClick={() => { setVendorOrderFilter('PREPARING'); setVendorTab('orders'); }}
            className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/50 p-3 rounded-2xl text-center cursor-pointer transition active:scale-95"
          >
            <span className="text-[10px] text-amber-400 block font-semibold">Preparing</span>
            <strong className="text-xl font-black font-mono text-amber-300">{preparingOrders.length}</strong>
            <span className="text-[9px] text-slate-400 block mt-0.5">In kitchen</span>
          </div>

          <div 
            onClick={() => { setVendorOrderFilter('READY'); setVendorTab('orders'); }}
            className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/50 p-3 rounded-2xl text-center cursor-pointer transition active:scale-95"
          >
            <span className="text-[10px] text-emerald-400 block font-semibold">Ready</span>
            <strong className="text-xl font-black font-mono text-emerald-300">{readyOrders.length}</strong>
            <span className="text-[9px] text-emerald-400/80 block mt-0.5">At counter</span>
          </div>

          <div 
            onClick={() => { setVendorOrderFilter('COMPLETED'); setVendorTab('orders'); }}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl text-center cursor-pointer transition active:scale-95"
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Done</span>
            <strong className="text-xl font-black font-mono text-blue-400">{completedOrders.length}</strong>
            <span className="text-[9px] text-slate-500 block mt-0.5">Collected</span>
          </div>
        </div>
      </div>

      {/* Main Action Banner: Scan Student QR */}
      <div 
        onClick={() => setVendorTab('scan')}
        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-3xl p-4 cursor-pointer shadow-xl transition flex items-center justify-between text-slate-950 active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-orange-400 flex items-center justify-center shadow-lg">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base">Scan Student's QR Code</h3>
            <p className="text-[11px] font-semibold text-slate-900">
              Verify digital token pass & confirm pickup
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-950 shrink-0" />
      </div>

      {/* Recent Orders in Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Incoming & Active Orders
          </h3>
          <button
            onClick={() => { setVendorOrderFilter('ALL'); setVendorTab('orders'); }}
            className="text-[11px] font-bold text-orange-400 hover:text-orange-300"
          >
            View All ({orders.length}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {orders.slice(0, 3).map((ord) => (
            <div
              key={ord.orderId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-white bg-slate-800 px-1.5 py-0.5 rounded">
                      #{ord.orderId}
                    </span>
                    <strong className="text-xs font-bold text-slate-200">{ord.studentName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Roll No: {ord.studentId} • Placed: {ord.createdAt}
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
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ord.orderStatus}
                </span>
              </div>

              {/* Items summary */}
              <div className="text-xs text-slate-300 bg-slate-950/70 p-2 rounded-xl">
                {ord.foodItems.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-mono text-slate-400">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Quick Action button */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-xs text-orange-400">Total: ₹{ord.totalAmount}</span>

                {ord.orderStatus === 'PENDING' && (
                  <button
                    onClick={() => acceptOrder(ord.orderId)}
                    className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl transition"
                  >
                    Accept (Start Prep)
                  </button>
                )}

                {ord.orderStatus === 'PREPARING' && (
                  <button
                    onClick={() => markOrderReady(ord.orderId)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl transition"
                  >
                    Mark Ready 🔔
                  </button>
                )}

                {ord.orderStatus === 'READY' && (
                  <button
                    onClick={() => setVendorTab('scan')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <ScanLine className="w-3 h-3" />
                    <span>Scan QR</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
