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
  AlertCircle,
  Database,
  QrCode
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function VendorDashboard() {
  const { 
    orders, 
    isCanteenOpen, 
    toggleCanteenStatus, 
    setVendorTab, 
    setVendorOrderFilter,
    acceptOrder,
    startPrepOrder,
    markOrderReady,
    vendorUser,
    setSupabaseConfigModalOpen
  } = useCampus();

  const getStatus = (o) => o.order_status || o.orderStatus || 'PAID';
  const getAmount = (o) => Number(o.total_amount || o.totalAmount || 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => getStatus(o) === 'PAID' || getStatus(o) === 'PENDING_PAYMENT');
  const preparingOrders = orders.filter(o => getStatus(o) === 'ACCEPTED' || getStatus(o) === 'PREPARING');
  const readyOrders = orders.filter(o => getStatus(o) === 'READY');
  const completedOrders = orders.filter(o => getStatus(o) === 'COMPLETED');

  const todayRevenue = orders
    .filter(o => (o.payment_status === 'PAID' || o.paymentStatus === 'PAID') && getStatus(o) !== 'CANCELLED')
    .reduce((sum, o) => sum + getAmount(o), 0);

  const recentIncoming = orders.filter(o => getStatus(o) !== 'COMPLETED' && getStatus(o) !== 'CANCELLED').slice(0, 3);

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fadeIn">
      {/* Canteen Vendor Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">{vendorUser?.name || 'Campus Central Kitchen'}</h2>
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
            <span>{isCanteenOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>
        </div>

        {/* Supabase connection badge */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Source:</span>
            <strong className="text-slate-300">{isSupabaseConfigured ? 'Live Supabase Cloud' : 'Local Supabase Engine'}</strong>
          </span>
          <button
            onClick={() => setSupabaseConfigModalOpen(true)}
            className="text-sky-400 hover:text-sky-300 underline font-medium"
          >
            Settings
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
            ₹{todayRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">From {orders.length} database orders</span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {totalOrders}
          </div>
          <span className="text-[10px] text-indigo-400 font-mono">{completedOrders.length} collected</span>
        </div>
      </div>

      {/* Live Order Pipeline Counters */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Database Order Breakdown
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <div 
            onClick={() => {
              setVendorOrderFilter('PAID');
              setVendorTab('orders');
            }}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition"
          >
            <div className="text-base font-black font-mono text-amber-400">{pendingOrders.length}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Pending</div>
          </div>

          <div 
            onClick={() => {
              setVendorOrderFilter('PREPARING');
              setVendorTab('orders');
            }}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition"
          >
            <div className="text-base font-black font-mono text-sky-400">{preparingOrders.length}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Preparing</div>
          </div>

          <div 
            onClick={() => {
              setVendorOrderFilter('READY');
              setVendorTab('orders');
            }}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition"
          >
            <div className="text-base font-black font-mono text-emerald-400">{readyOrders.length}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Ready</div>
          </div>

          <div 
            onClick={() => {
              setVendorOrderFilter('COMPLETED');
              setVendorTab('orders');
            }}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition"
          >
            <div className="text-base font-black font-mono text-indigo-400">{completedOrders.length}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Collected</div>
          </div>
        </div>
      </div>

      {/* QR Scanner Quick Action Card */}
      <div 
        onClick={() => setVendorTab('scan')}
        className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/40 rounded-3xl p-4 shadow-xl flex items-center justify-between cursor-pointer hover:border-indigo-400 transition group"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Scan Student QR Pass</h3>
            <p className="text-[11px] text-indigo-200/80">Camera scanner to verify token & deliver food</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition" />
      </div>

      {/* Incoming Orders Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Kitchen Queue ({recentIncoming.length})
          </h3>
          <button
            onClick={() => setVendorTab('orders')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentIncoming.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              Kitchen queue is all caught up! No active orders.
            </div>
          ) : (
            recentIncoming.map(order => {
              const status = getStatus(order);
              const orderNum = order.order_number || order.orderNumber;
              const items = order.order_items || order.items || order.foodItems || [];

              return (
                <div 
                  key={order.id || order.orderId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-white">#{orderNum}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {order.students?.full_name || order.studentName || 'Student'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 truncate">
                    {items.map(i => `${i.quantity}× ${i.food_name_snapshot || i.name}`).join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 font-mono">₹{getAmount(order).toFixed(2)}</span>
                    <div className="flex gap-1.5">
                      {status === 'PAID' && (
                        <button
                          onClick={() => acceptOrder(order.id || order.orderId)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold"
                        >
                          Accept Order
                        </button>
                      )}
                      {status === 'ACCEPTED' && (
                        <button
                          onClick={() => startPrepOrder(order.id || order.orderId)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold"
                        >
                          Start Prep
                        </button>
                      )}
                      {status === 'PREPARING' && (
                        <button
                          onClick={() => markOrderReady(order.id || order.orderId)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                        >
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
