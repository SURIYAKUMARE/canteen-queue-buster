import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Sliders, 
  CheckCheck, 
  Flame, 
  Layers, 
  Volume2, 
  Zap,
  TrendingUp,
  PackageCheck,
  Timer
} from 'lucide-react';

export default function KitchenDashboard() {
  const { 
    orders, 
    slotAggregations, 
    maxCapacityPerSlot, 
    updateCapacity, 
    updateOrderStatus, 
    simulatedCurrentTime,
    simulateRush,
    setActiveView
  } = useCanteen();

  const [filterSlot, setFilterSlot] = useState('ALL');

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  // Sorted slot keys
  const slotKeys = Object.keys(slotAggregations || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner & Kitchen Capacity Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
                <ChefHat className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Kitchen Operations Hub</span>
                  <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-md font-mono border border-orange-500/30">
                    LIVE OPS
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Batch preparation pipeline aggregated by 5-minute pickup slots
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Status Counters */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">Active Orders</span>
              <strong className="text-white text-base">{activeOrders.length}</strong>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-amber-400 block text-[10px]">In Prep</span>
              <strong className="text-amber-300 text-base">{preparingOrders.length}</strong>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-emerald-400 block text-[10px]">Ready at Bay</span>
              <strong className="text-emerald-300 text-base">{readyOrders.length}</strong>
            </div>
          </div>
        </div>

        {/* Capacity Slider & Concept Demo Control */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Configurable Kitchen Capacity:</span>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono text-xs border border-blue-500/30">
                {maxCapacityPerSlot} items / 5-min slot
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Optimization logic demo: When a slot reaches {maxCapacityPerSlot} items, incoming orders automatically roll over to the subsequent 5-min window.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">3</span>
            <input
              type="range"
              min="3"
              max="12"
              value={maxCapacityPerSlot}
              onChange={(e) => updateCapacity(parseInt(e.target.value, 10))}
              className="w-36 sm:w-48 accent-orange-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">12</span>

            <button
              onClick={simulateRush}
              className="ml-2 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition active:scale-95 shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Inject Rush</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= SLOT PIPELINE GRID ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Timer className="w-4 h-4 text-orange-400" />
            <span>Scheduled 5-Minute Pickup Slots</span>
          </h3>
          <span className="text-xs text-slate-400">Current Time: <strong className="text-white font-mono">{simulatedCurrentTime}</strong></span>
        </div>

        {slotKeys.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No slot data loaded yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {slotKeys.map((slotTime) => {
              const slotInfo = slotAggregations[slotTime];
              const slotOrders = slotInfo?.orders || [];
              const totalItemsInSlot = slotInfo?.totalItems || 0;
              const capacityPct = Math.min(100, Math.round((totalItemsInSlot / maxCapacityPerSlot) * 100));
              const isFull = totalItemsInSlot >= maxCapacityPerSlot;
              const itemCounts = slotInfo?.itemCounts || {};

              return (
                <div
                  key={slotTime}
                  className={`bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition ${
                    isFull
                      ? 'border-rose-500/60 shadow-lg shadow-rose-950/20'
                      : totalItemsInSlot > 0
                      ? 'border-slate-700 hover:border-slate-600'
                      : 'border-slate-800/60 opacity-75'
                  }`}
                >
                  {/* Slot Header & Capacity Gauge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="font-mono font-bold text-white text-base">{slotTime}</span>
                      </div>

                      {/* Capacity badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isFull
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : capacityPct > 60
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {totalItemsInSlot} / {maxCapacityPerSlot} items {isFull ? '(FULL)' : ''}
                      </span>
                    </div>

                    {/* Capacity Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isFull
                              ? 'bg-rose-500 shadow-sm shadow-rose-500'
                              : capacityPct > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Utilization</span>
                        <span className="font-mono font-semibold text-slate-300">{capacityPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Aggregated Items Needed (Staff Batch Prep Section) */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>Aggregated Batch Prep ({totalItemsInSlot} items):</span>
                    </div>

                    {Object.keys(itemCounts).length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic">
                        No orders scheduled in this slot yet.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(itemCounts).map(([name, count]) => (
                          <span
                            key={name}
                            className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
                          >
                            <strong className="text-orange-400 font-mono">{count}x</strong>
                            <span className="truncate max-w-[140px]">{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orders List inside this Slot */}
                  <div className="space-y-2 flex-1">
                    {slotOrders.length === 0 ? (
                      <div className="text-[11px] text-slate-600 text-center py-4">
                        Waiting for pre-orders...
                      </div>
                    ) : (
                      slotOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-white text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                                  {ord.tokenNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-200">{ord.studentName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Bay: <span className="text-emerald-400">{ord.counterBay || 'Bay 1'}</span> • Placed: {ord.placedAt}
                              </div>
                            </div>

                            {/* Status tag */}
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                                ord.status === 'ready'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : ord.status === 'preparing'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="text-[11px] text-slate-300 space-y-0.5 bg-slate-900/60 p-2 rounded-lg">
                            {ord.items.map((it, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span>{it.quantity}x {it.name}</span>
                                {it.modifiers && it.modifiers.length > 0 && (
                                  <span className="text-[9px] text-amber-300 bg-amber-950/60 px-1 rounded">
                                    {it.modifiers.join(', ')}
                                  </span>
                                )}
                              </div>
                            ))}
                            {ord.notes && (
                              <div className="text-[10px] text-orange-300/90 italic pt-1 border-t border-slate-800">
                                Note: "{ord.notes}"
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for Kitchen Staff */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {ord.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'preparing')}
                                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold py-1.5 px-2 rounded-lg transition active:scale-95"
                              >
                                Start Prep
                              </button>
                            )}

                            {ord.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'ready')}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-black py-1.5 px-2 rounded-lg transition active:scale-95 flex items-center justify-center gap-1 shadow-md"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Mark Ready for Pickup</span>
                              </button>
                            )}

                            {ord.status === 'ready' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'completed')}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1"
                              >
                                <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span>Mark Picked Up / Complete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Demand Forecast Quick Banner Link */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950/40 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Need Predictive Kitchen Planning?</h4>
            <p className="text-xs text-slate-300">
              View the 3-day weighted moving average demand forecast chart across the lunch hour (11:45 AM - 1:30 PM).
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('forecast')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shrink-0"
        >
          Open Forecast
        </button>
      </div>
    </div>
  );
}
