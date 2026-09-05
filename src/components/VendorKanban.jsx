import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { normalizeOrder } from '../utils/orderUtils.js';
import { useToast } from './ui/ToastContext';
import { Badge, Button, Card } from './ui';
import { 
  Flame, 
  CheckCheck, 
  Clock, 
  CheckCircle2, 
  ScanLine, 
  AlertTriangle, 
  User, 
  ShoppingBag,
  ArrowRight,
  GripVertical
} from 'lucide-react';

export default function VendorKanban() {
  const { 
    orders, 
    currentUser, 
    vendorUser, 
    acceptOrder, 
    startPrepOrder, 
    markOrderReady, 
    completeOrderHandover,
    setVendorTab
  } = useCampus();
  const { toast } = useToast();

  const [draggedOrderId, setDraggedOrderId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Update clock every 15 seconds to recalculate order aging
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const currentVendorId = currentUser?.vendor?.id || vendorUser?.id;
  const currentVendorCode = currentUser?.vendor?.vendor_id || 'VEN001';

  // Filter vendor orders
  const vendorOrders = (orders || []).filter(o => {
    const vId = o.vendor_id || o.vendorId;
    return !vId || vId === currentVendorId || vId === currentVendorCode;
  });

  const getStatus = (o) => (o.order_status || o.orderStatus || 'PAID').toUpperCase();

  // Columns definition
  const columns = [
    {
      id: 'COL_NEW',
      title: 'New Orders',
      subtitle: 'Awaiting Kitchen',
      color: 'border-amber-500/40 text-amber-400',
      headerBg: 'bg-amber-950/20 text-amber-300 border-amber-500/30',
      icon: Clock,
      targetStatuses: ['PAID', 'ACCEPTED', 'PLACED'],
      nextActionName: 'Start Prep',
      nextAction: (id) => {
        startPrepOrder(id);
        toast.info('Order sent to kitchen prep');
      }
    },
    {
      id: 'COL_PREP',
      title: 'In Preparation',
      subtitle: 'Cooking in Progress',
      color: 'border-sky-500/40 text-sky-400',
      headerBg: 'bg-sky-950/20 text-sky-300 border-sky-500/30',
      icon: Flame,
      targetStatuses: ['PREPARING'],
      nextActionName: 'Mark Ready',
      nextAction: (id) => {
        markOrderReady(id);
        toast.success('Order marked ready for pickup!');
      }
    },
    {
      id: 'COL_READY',
      title: 'Ready for Pickup',
      subtitle: 'Awaiting Student',
      color: 'border-emerald-500/40 text-emerald-400',
      headerBg: 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30',
      icon: CheckCheck,
      targetStatuses: ['READY'],
      nextActionName: 'Hand Over',
      nextAction: (id) => {
        completeOrderHandover(id);
        toast.success('Order delivered to student');
      }
    }
  ];

  // Helper for order aging
  const getOrderAgeMinutes = (order) => {
    const dateStr = order.created_at || order.createdAt;
    if (!dateStr) return 0;
    try {
      const created = new Date(dateStr).getTime();
      if (isNaN(created)) return 0;
      return Math.max(0, Math.floor((now - created) / 60000));
    } catch {
      return 0;
    }
  };

  const getAgingBadge = (minutes) => {
    if (minutes >= 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/60 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>{minutes}m (Delayed)</span>
        </span>
      );
    }
    if (minutes >= 5) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{minutes}m ago</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{minutes}m ago</span>
      </span>
    );
  };

  // Drag & Drop handlers
  const handleDragStart = (e, orderId) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (!orderId) return;

    if (targetColId === 'COL_PREP') {
      startPrepOrder(orderId);
      toast.info(`Order #${orderId} moved to Preparation`);
    } else if (targetColId === 'COL_READY') {
      markOrderReady(orderId);
      toast.success(`Order #${orderId} marked Ready`);
    } else if (targetColId === 'COL_NEW') {
      toast.warning('Order cannot be reverted to New');
    }
    setDraggedOrderId(null);
  };

  return (
    <div className="space-y-4">
      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const Icon = col.icon;
          const colOrders = vendorOrders.filter(o => 
            col.targetStatuses.includes(getStatus(o))
          );
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`
                flex flex-col bg-slate-900/60 rounded-3xl border transition-all duration-200 min-h-[380px]
                ${isOver ? 'border-amber-400/80 bg-slate-800/60 shadow-xl shadow-amber-500/10 scale-[1.01]' : 'border-slate-800/80'}
              `}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b border-slate-800/80 rounded-t-3xl flex items-center justify-between ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900/60 flex items-center justify-center border border-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs tracking-tight text-white">{col.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{col.subtitle}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-slate-900/80 text-white border border-white/10">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Body / Orders Stack */}
              <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[540px]">
                {colOrders.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/60 rounded-2xl text-slate-500">
                    <Icon className="w-6 h-6 mb-1 text-slate-600 opacity-60" />
                    <span className="text-xs font-medium">No orders in this stage</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Drag orders here to update</span>
                  </div>
                ) : (
                  colOrders.map((rawOrd) => {
                    const ord = normalizeOrder(rawOrd);
                    const orderId = ord.id || ord.orderId;
                    const orderNum = ord.order_number || ord.orderNumber || orderId;
                    const tokenNum = ord.token_number || ord.tokenNumber || 'TKN';
                    const studentName = ord.studentName || 'Student';
                    const studentId = ord.studentId || 'STU001';
                    const items = ord.items || [];
                    const amount = Number(ord.total_amount || ord.totalAmount || 0);
                    const ageMinutes = getOrderAgeMinutes(ord);

                    return (
                      <div
                        key={orderId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, orderId)}
                        onDragEnd={() => setDraggedOrderId(null)}
                        className={`
                          bg-slate-900/90 hover:bg-slate-900 border rounded-2xl p-3 space-y-2.5 shadow-md
                          transition-all cursor-grab active:cursor-grabbing hover:border-slate-700
                          ${draggedOrderId === orderId ? 'opacity-40 border-dashed border-amber-400' : 'border-slate-800'}
                        `}
                      >
                        {/* Header & Aging */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="font-mono font-bold text-xs bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700">
                              #{orderNum}
                            </span>
                            <span className="font-mono font-bold text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              {tokenNum}
                            </span>
                          </div>
                          {getOrderAgeMinutes(ord) !== undefined && getAgingBadge(ageMinutes)}
                        </div>

                        {/* Customer */}
                        <div className="text-[11px] text-slate-300 flex items-center justify-between border-b border-slate-850 pb-1.5">
                          <span className="font-semibold text-white flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {studentName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{studentId}</span>
                        </div>

                        {/* Line Items List */}
                        <div className="bg-slate-950/60 rounded-xl p-2 space-y-1 text-xs text-slate-300 border border-slate-850">
                          {items.slice(0, 3).map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className="truncate pr-1">
                                <strong className="text-amber-400 font-mono">{it.quantity}×</strong> {it.food_name_snapshot || it.name}
                              </span>
                              <span className="font-mono text-slate-400 text-[10px] shrink-0">
                                ₹{Number(it.price_snapshot || it.price || 0) * it.quantity}
                              </span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="text-[10px] text-slate-500 italic pt-0.5">
                              +{items.length - 3} more items...
                            </div>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between pt-1 gap-2">
                          <div className="text-xs font-mono font-bold text-amber-400">
                            ₹{amount.toFixed(2)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {col.id === 'COL_READY' && (
                              <button
                                onClick={() => setVendorTab('scan')}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1"
                                title="Scan QR pass"
                              >
                                <ScanLine className="w-3 h-3 text-emerald-400" />
                                <span>Scan</span>
                              </button>
                            )}

                            <button
                              onClick={() => col.nextAction(orderId)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <span>{col.nextActionName}</span>
                              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
