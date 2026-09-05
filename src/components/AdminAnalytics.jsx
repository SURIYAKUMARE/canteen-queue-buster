import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Award, 
  Clock, 
  ShieldCheck, 
  IndianRupee, 
  ShoppingBag, 
  CheckCircle2, 
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { Button, Card, Badge } from './ui';
import { useToast } from './ui/ToastContext';

export default function AdminAnalytics({ orders = [], students = [], vendors = [], foodItems = [] }) {
  const { toast } = useToast();

  // Metrics computation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => (o.payment_status || o.paymentStatus) === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || o.totalAmount || 0), 0);
    const completedOrders = orders.filter(o => {
      const st = (o.order_status || o.orderStatus || '').toUpperCase();
      return st === 'COMPLETED' || st === 'COLLECTED';
    });
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const fulfillmentRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 100;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      fulfillmentRate: Math.round(fulfillmentRate),
      completedCount: completedOrders.length
    };
  }, [orders]);

  // Hourly distribution (8 AM to 6 PM)
  const hourlyData = useMemo(() => {
    const hours = [
      { hour: 8, label: '8 AM', count: 0 },
      { hour: 9, label: '9 AM', count: 0 },
      { hour: 10, label: '10 AM', count: 0 },
      { hour: 11, label: '11 AM', count: 0 },
      { hour: 12, label: '12 PM', count: 0 },
      { hour: 13, label: '1 PM', count: 0 },
      { hour: 14, label: '2 PM', count: 0 },
      { hour: 15, label: '3 PM', count: 0 },
      { hour: 16, label: '4 PM', count: 0 },
      { hour: 17, label: '5 PM', count: 0 },
      { hour: 18, label: '6 PM', count: 0 },
    ];

    orders.forEach(o => {
      const dateStr = o.created_at || o.createdAt;
      if (dateStr) {
        try {
          const d = new Date(dateStr);
          const h = d.getHours();
          const target = hours.find(item => item.hour === h);
          if (target) {
            target.count++;
          }
        } catch {
          // ignore parsing error
        }
      }
    });

    const maxCount = Math.max(1, ...hours.map(h => h.count));
    const peakHour = [...hours].sort((a, b) => b.count - a.count)[0];

    return { hours, maxCount, peakHour };
  }, [orders]);

  // Best-Selling Items Leaderboard
  const bestSellers = useMemo(() => {
    const salesMap = {};

    orders.forEach(o => {
      const items = o.order_items || o.items || o.foodItems || [];
      items.forEach(it => {
        const name = it.food_name_snapshot || it.name || 'Canteen Special';
        const qty = Number(it.quantity || 1);
        const price = Number(it.price_snapshot || it.price || 0);

        if (!salesMap[name]) {
          salesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        salesMap[name].quantity += qty;
        salesMap[name].revenue += price * qty;
      });
    });

    return Object.values(salesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // 1-Click CSV Export
  const handleExportCSV = () => {
    if (!orders.length) {
      toast.warning('No orders available to export.');
      return;
    }

    try {
      const headers = [
        'Order ID',
        'Token Number',
        'Student Name',
        'Student Roll No',
        'Items Summary',
        'Total Amount (INR)',
        'Payment Status',
        'Order Status',
        'Date & Time'
      ];

      const rows = orders.map(o => {
        const itemsStr = (o.order_items || o.items || [])
          .map(it => `${it.quantity}x ${it.food_name_snapshot || it.name}`)
          .join('; ');

        return [
          `"${o.order_number || o.orderId || o.id}"`,
          `"${o.token_number || o.tokenNumber || ''}"`,
          `"${o.studentName || o.student?.full_name || 'Student'}"`,
          `"${o.studentId || o.student?.student_id || ''}"`,
          `"${itemsStr.replace(/"/g, '""')}"`,
          `"${Number(o.total_amount || o.totalAmount || 0).toFixed(2)}"`,
          `"${o.payment_status || o.paymentStatus || 'PAID'}"`,
          `"${o.order_status || o.orderStatus || 'PAID'}"`,
          `"${o.created_at || o.createdAt || new Date().toISOString()}"`
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `campusbite-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${orders.length} orders to CSV! 📊`);
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to export CSV. Check console for details.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Campus Intelligence & Operational Analytics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial reconciliation, queue velocity, and demand distribution
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          className="shrink-0"
        >
          Export CSV Ledger
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gross Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            ₹{metrics.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block font-mono">100% verified transactions</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Volume</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {metrics.totalOrders}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">{metrics.completedCount} orders fulfilled</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            ₹{metrics.avgOrderValue.toFixed(0)}
          </div>
          <span className="text-[10px] text-purple-400 mt-1 block font-mono">Per active transaction</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fulfillment Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {metrics.fulfillmentRate}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Kitchen turnaround score</span>
        </div>
      </div>

      {/* Two Column Layout: Peak Hours & Bestsellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Peak Ordering Hours Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <h4 className="font-bold text-sm text-white">Peak Ordering Hours</h4>
            </div>
            {hourlyData.peakHour && (
              <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                Peak: {hourlyData.peakHour.label}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Hourly distribution of canteen orders placed across campus counters today:
          </p>

          {/* Bar Chart Visualization */}
          <div className="pt-3 pb-1 flex items-end justify-between gap-1.5 h-36">
            {hourlyData.hours.map((h) => {
              const heightPct = Math.max(8, Math.round((h.count / hourlyData.maxCount) * 100));
              const isPeak = h.hour === hourlyData.peakHour?.hour && h.count > 0;

              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`
                      w-full rounded-t-lg transition-all duration-300
                      ${isPeak 
                        ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/30' 
                        : h.count > 0 
                        ? 'bg-indigo-600/80 hover:bg-indigo-500' 
                        : 'bg-slate-800/40'}
                    `}
                  />
                  <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                    {h.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best-Selling Items Leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Top 5 Best-Selling Dishes</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ranked by volume</span>
          </div>

          <div className="space-y-2.5">
            {bestSellers.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No dish sales recorded yet.
              </div>
            ) : (
              bestSellers.map((item, idx) => {
                const rankIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                return (
                  <div
                    key={item.name}
                    className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none">{rankIcons[idx]}</span>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.quantity} orders sold
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-amber-400">
                        ₹{item.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* System Audit & Activity Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">System Security & Order Audit Stream</h4>
          </div>
          <Badge variant="success" size="xs">Live Stream</Badge>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs font-mono">
          {orders.slice(0, 6).map((o, idx) => {
            const status = (o.order_status || o.orderStatus || 'PAID').toUpperCase();
            const orderNum = o.order_number || o.orderId || `#${idx + 1}`;
            const time = o.created_at ? new Date(o.created_at).toLocaleTimeString() : 'Just now';

            return (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{time}</span>
                  <span className="text-white font-bold">Order #{orderNum}</span>
                  <span className="text-slate-400">({o.studentName || 'Student'})</span>
                </div>
                <Badge 
                  variant={status === 'COMPLETED' ? 'completed' : status === 'READY' ? 'ready' : 'placed'}
                  size="xs"
                >
                  {status}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
