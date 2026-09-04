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
  ArrowRight,
  Flame,
  CheckCheck
} from 'lucide-react';

export default function VendorOrders() {
  const { 
    orders, 
    vendorOrderFilter, 
    setVendorOrderFilter, 
    acceptOrder, 
    startPrepOrder,
    rejectOrder, 
    markOrderReady, 
    setVendorTab 
  } = useCampus();

  // Exactly as requested in prompt:
  // ALL, PAID, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED
  const tabs = ['ALL', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  const getStatus = (o) => o.order_status || o.orderStatus || 'PAID';
  const getAmount = (o) => Number(o.total_amount || o.totalAmount || 0);

  const filteredOrders = orders.filter(o => {
    if (vendorOrderFilter === 'ALL') return true;
    return getStatus(o) === vendorOrderFilter;
  });

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>📋 Order Management Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400">Manage order preparation lifecycle connected to Supabase Realtime</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const count = tab === 'ALL' 
            ? orders.length 
            : orders.filter(o => getStatus(o) === tab).length;
          const isSelected = vendorOrderFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setVendorOrderFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
          filteredOrders.map((ord) => {
            const status = getStatus(ord);
            const orderId = ord.id || ord.orderId;
            const orderNum = ord.order_number || ord.orderNumber;
            const studentName = ord.students?.full_name || ord.studentName || 'Student';
            const studentId = ord.students?.student_id || ord.studentId || '21BCS042';
            const items = ord.order_items || ord.items || ord.foodItems || [];
            const amount = getAmount(ord);

            return (
              <div
                key={orderId}
                className={`bg-slate-900 border rounded-3xl p-4 space-y-3 transition ${
                  status === 'PAID'
                    ? 'border-amber-500/50 shadow-md shadow-amber-950/20'
                    : status === 'READY'
                    ? 'border-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-white bg-slate-800 px-2 py-0.5 rounded-md">
                        #{orderNum}
                      </span>
                      <strong className="text-xs font-bold text-slate-100">{studentName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Roll: <strong className="text-slate-300">{studentId}</strong>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'PAID' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                    status === 'ACCEPTED' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' :
                    status === 'PREPARING' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                    status === 'READY' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse' :
                    status === 'COMPLETED' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
                    'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Items List */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 space-y-1.5 text-xs text-slate-300">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-medium">
                        {it.quantity}× {it.food_name_snapshot || it.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        ₹{Number(it.price_snapshot || it.price || 0) * it.quantity}
                      </span>
                    </div>
                  ))}

                  {ord.notes && (
                    <div className="text-[10px] text-amber-300 italic pt-1 border-t border-slate-850">
                      Note: "{ord.notes}"
                    </div>
                  )}
                </div>

                {/* Total & State Transition Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Amount:</span>
                    <span className="text-sm font-black font-mono text-amber-400">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* PAID -> ACCEPTED */}
                    {status === 'PAID' && (
                      <>
                        <button
                          onClick={() => acceptOrder(orderId)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => rejectOrder(orderId, 'Sold out')}
                          className="bg-slate-800 hover:bg-slate-750 text-rose-400 font-bold text-xs px-2.5 py-2 rounded-xl transition border border-slate-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* ACCEPTED -> PREPARING */}
                    {status === 'ACCEPTED' && (
                      <button
                        onClick={() => startPrepOrder(orderId)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {/* PREPARING -> READY */}
                    {status === 'PREPARING' && (
                      <button
                        onClick={() => markOrderReady(orderId)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {/* READY -> SCANNER */}
                    {status === 'READY' && (
                      <button
                        onClick={() => setVendorTab('scan')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>Scan QR & Complete</span>
                      </button>
                    )}

                    {status === 'COMPLETED' && (
                      <span className="text-xs text-blue-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
