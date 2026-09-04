import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  Users, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Cpu, 
  ChefHat, 
  TrendingUp, 
  Mic, 
  ShieldCheck, 
  Layers,
  Zap,
  Play
} from 'lucide-react';

export default function VivaShowcase() {
  const { setActiveView, simulateRush, orders, slotAggregations, maxCapacityPerSlot } = useCanteen();

  const totalActive = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Viva & Prototype Demonstration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smart Canteen <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Pre-Order System</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminating the traditional 15+ minute canteen bottleneck by decoupling 
            <strong className="text-white"> food ordering</strong>, 
            <strong className="text-white"> payment</strong>, and 
            <strong className="text-white"> counter pickup</strong> into scheduled 5-minute capacity-balanced batches.
          </p>

          {/* Quick Action Walkthrough Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('student')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-orange-500/25 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Student View</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('kitchen')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-5 py-2.5 rounded-xl text-sm border border-slate-700 transition"
            >
              <ChefHat className="w-4 h-4 text-orange-400" />
              <span>Kitchen Ops Dashboard</span>
            </button>

            <button
              onClick={simulateRush}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Simulate Lunch Rush</span>
            </button>
          </div>
        </div>

        {/* Live System Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Active Queue Orders</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{totalActive}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Live in Kitchen pipeline</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Slot Capacity Limit</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{maxCapacityPerSlot}</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Items per 5-min slot</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Avg. Wait Time</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">45 sec</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Reduced from 16+ mins</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Peak Prediction</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">12:15 PM</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">34 orders forecasted</div>
          </div>
        </div>
      </div>

      {/* Before vs After Queue Comparison (Viva Core Concept) */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Core Bottleneck Analysis: Why Single Queues Fail
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Comparison between the college canteen's current single-counter process and our decoupled pre-order architecture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional Bottleneck Card */}
          <div className="bg-slate-900/80 border-2 border-rose-900/40 rounded-2xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  ✕
                </div>
                <h3 className="font-bold text-white text-base">Traditional Single Token Counter</h3>
              </div>
              <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                15 - 22 Min Wait
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sequential Serial Bottleneck:</strong>
                  Single staff member takes oral order $\rightarrow$ enters POS $\rightarrow$ handles physical cash/change $\rightarrow$ prints paper token.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Zero Advance Visibility for Kitchen:</strong>
                  Kitchen only finds out how many rotis or thalis are needed when tokens are handed to the cook.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Overcrowded Pickup Counter:</strong>
                  50+ students cluster around the delivery window shouting token numbers.
                </div>
              </div>
            </div>

            <div className="bg-rose-950/40 border border-rose-800/40 p-3 rounded-lg text-rose-200 text-xs text-center font-mono">
              Throughput: ~25-30 orders/hour max (Human bottleneck)
            </div>
          </div>

          {/* Smart Pre-Order Decoupled Architecture */}
          <div className="bg-slate-900/80 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <h3 className="font-bold text-white text-base">Smart Pre-Order System (Decoupled)</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                &lt; 1 Min Pickup
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Stage 1: Remote Pre-Order & Digital Pay:</strong>
                  Placed from classroom or hostel. Cashless, instantaneous, asynchronous.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Stage 2: Capacity-Balanced 5-Min Slots:</strong>
                  Orders automatically scheduled into 5-minute slots capped at 6 items. Prevents kitchen overload.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Stage 3: Express Staggered Pickup:</strong>
                  Students arrive precisely at their scheduled slot or when notified. Walk up $\rightarrow$ show token $\rightarrow$ collect.
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-lg text-emerald-200 text-xs text-center font-mono">
              Throughput: ~90-110 orders/hour (Parallelized pickup)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Pillars of the System */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Interactive Modules To Demonstrate in Viva</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Student Pre-Order */}
          <div 
            onClick={() => setActiveView('student')}
            className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-500/50 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">1. Student Pre-Order App</h3>
              <p className="text-xs text-slate-400 mt-1">
                Browse 10 college meals, mock UPI/RFID payment, live token tracker with real-time status updates.
              </p>
            </div>
            <div className="text-xs font-semibold text-orange-400 flex items-center gap-1 group-hover:underline">
              <span>Open Student View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Kitchen Operations Dashboard */}
          <div 
            onClick={() => setActiveView('kitchen')}
            className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">2. Kitchen Hub (Key Demo)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Orders grouped by 5-min slot with aggregated item counts ("4x Thali, 2x Chai") & instant "Ready" toggle.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:underline">
              <span>Open Kitchen Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. Demand Forecasting */}
          <div 
            onClick={() => setActiveView('forecast')}
            className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">3. Demand Forecast Panel</h3>
              <p className="text-xs text-slate-400 mt-1">
                3-day weighted moving average predicted vs actual orders across lunch hour with surge alert recommendations.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:underline">
              <span>View Forecast Chart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. Walk-in NLP Demo */}
          <div 
            onClick={() => setActiveView('nlp')}
            className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">4. Walk-in NLP Extractor</h3>
              <p className="text-xs text-slate-400 mt-1">
                Demonstrates free-text order extraction ("veg thali no onion and a chai") with modifier detection into structured JSON.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:underline">
              <span>Try NLP Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Viva Presentation Flow Checklist */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <span>Recommended 3-Minute Viva Demonstration Script</span>
        </h3>

        <div className="grid sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-mono text-orange-400 font-bold">Step 1: Student Pre-Order</span>
            <p className="text-slate-300">
              Open Student App $\rightarrow$ add 2x Veg Thali Deluxe and 1x Masala Chai $\rightarrow$ Click "Pay Now" $\rightarrow$ Note the assigned pickup slot and token number.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-mono text-blue-400 font-bold">Step 2: Capacity Throttling</span>
            <p className="text-slate-300">
              Click "Simulate Rush" $\rightarrow$ Observe how the 12:05 slot reaches 6 items capacity and automatically bumps subsequent orders to 12:10 PM.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-mono text-emerald-400 font-bold">Step 3: Kitchen Batching</span>
            <p className="text-slate-300">
              Switch to Kitchen Hub $\rightarrow$ Observe aggregate counts $\rightarrow$ Click "Mark Ready" $\rightarrow$ Notice real-time audio chime and student notification!
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-mono text-purple-400 font-bold">Step 4: NLP & Analytics</span>
            <p className="text-slate-300">
              Open Walk-In NLP Terminal $\rightarrow$ Type "veg thali no onion and a chai" $\rightarrow$ Show structured modifier extraction $\rightarrow$ Review lunch forecast chart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
