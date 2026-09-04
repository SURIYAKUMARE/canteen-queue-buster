import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  TrendingUp, 
  Clock, 
  BarChart3, 
  AlertCircle, 
  Sparkles, 
  ChefHat, 
  Info, 
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function DemandForecast() {
  const { forecastData, simulateRush } = useCanteen();
  const { buckets = [], metrics } = forecastData;

  const [selectedBucket, setSelectedBucket] = useState(null);

  // Maximum value for scaling the bar chart
  const maxVal = Math.max(...buckets.map(b => Math.max(b.predicted, b.actual, 1)), 40);

  const activeBucket = selectedBucket || buckets.find(b => b.isPeak) || buckets[6];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Lunch Hour Demand Forecasting</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  Moving Average
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Predictive order volume per 5-minute bucket across the 11:45 AM - 1:20 PM college lunch rush
              </p>
            </div>
          </div>

          <button
            onClick={simulateRush}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-md"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Simulate Rush Orders</span>
          </button>
        </div>

        {/* Forecast Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Predicted</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{metrics.totalPredicted}</div>
              <span className="text-[10px] text-slate-500">Across 20 time buckets</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Actual Live</span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">{metrics.totalActual}</div>
              <span className="text-[10px] text-slate-500">Recorded today</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Peak Surge Slot</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{metrics.peakBucket?.time}</div>
              <span className="text-[10px] text-rose-400/80 font-mono">{metrics.peakBucket?.predicted} orders expected</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Model Accuracy</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{metrics.accuracyPct}%</div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Based on 3-day baseline</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span>Predicted vs. Actual Orders per 5-Minute Bucket</span>
            </h3>
            <p className="text-xs text-slate-400">Click on any time column to inspect calculation breakdown</p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400"></span>
              <span className="text-slate-300">Predicted (Moving Avg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-slate-300">Actual Live Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-rose-400 text-[11px]">Peak Surge Window</span>
            </div>
          </div>
        </div>

        {/* SVG / CSS Bar Chart Container */}
        <div className="pt-8 pb-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[700px] h-64 flex items-end justify-between gap-2 border-b border-slate-800 px-2 pb-2 relative">
            {/* Horizontal reference grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            {buckets.map((bucket) => {
              const predHeight = Math.round((bucket.predicted / maxVal) * 100);
              const actHeight = Math.round((bucket.actual / maxVal) * 100);
              const isSelected = activeBucket?.time === bucket.time;

              return (
                <div
                  key={bucket.time}
                  onClick={() => setSelectedBucket(bucket)}
                  className={`flex-1 flex flex-col items-center justify-end group cursor-pointer p-1 rounded-xl transition ${
                    isSelected ? 'bg-slate-800/90 ring-2 ring-orange-500/50' : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Peak surge star badge */}
                  {bucket.isPeak && (
                    <span className="text-[10px] text-rose-400 font-bold mb-1 animate-bounce">
                      ★
                    </span>
                  )}

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Predicted Bar */}
                    <div
                      title={`Predicted: ${bucket.predicted}`}
                      className="w-2.5 sm:w-3.5 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${predHeight}%` }}
                    ></div>

                    {/* Actual Bar */}
                    <div
                      title={`Actual: ${bucket.actual}`}
                      className="w-2.5 sm:w-3.5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${actHeight}%` }}
                    ></div>
                  </div>

                  {/* Time label */}
                  <span className={`text-[10px] font-mono mt-2 block whitespace-nowrap transition ${
                    isSelected ? 'text-orange-400 font-bold' : 'text-slate-400'
                  }`}>
                    {bucket.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Bucket Detail Inspector */}
        {activeBucket && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Selected Time Slot:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-base font-mono font-bold text-white">{activeBucket.time}</span>
                {activeBucket.isPeak && (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    PEAK RUSH
                  </span>
                )}
              </div>
              {activeBucket.surgeReason && (
                <p className="text-amber-300/90 text-[11px] pt-1">
                  Reason: <strong>{activeBucket.surgeReason}</strong>
                </p>
              )}
            </div>

            <div className="space-y-1 font-mono">
              <span className="text-slate-400 text-[11px] block font-sans">Historical 3-Day Sample:</span>
              <div className="text-slate-300">Day - 1 (Yesterday): <strong className="text-white">{activeBucket.day1}</strong> orders</div>
              <div className="text-slate-300">Day - 2: <strong className="text-white">{activeBucket.day2}</strong> orders</div>
              <div className="text-slate-300">Day - 3: <strong className="text-white">{activeBucket.day3}</strong> orders</div>
            </div>

            <div className="space-y-1 font-mono">
              <span className="text-slate-400 text-[11px] block font-sans">Weighted Calculation:</span>
              <div className="text-amber-300 font-semibold">
                0.5({activeBucket.day1}) + 0.3({activeBucket.day2}) + 0.2({activeBucket.day3}) = <strong className="text-white text-sm">{activeBucket.predicted}</strong>
              </div>
              <div className="text-blue-400 pt-0.5">
                Today's Actual: <strong className="text-white">{activeBucket.actual}</strong> ({activeBucket.actual >= activeBucket.predicted ? 'Over' : 'Under'} forecast)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Viva Explainer & Kitchen Action Advisory */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Math explanation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Forecasting Methodology (Viva Ready)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than relying on black-box heavy deep learning models for an in-canteen deployment, this prototype utilizes an 
            <strong className="text-white"> Exponentially Weighted Moving Average (EWMA)</strong>.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
            Predicted_t = 0.50 × Day1_t + 0.30 × Day2_t + 0.20 × Day3_t
          </div>

          <p className="text-xs text-slate-400">
            Higher weight is placed on the most recent school day, capturing periodic lunch surges (e.g. 12:00 PM lecture dismissals) with minimal computational overhead.
          </p>
        </div>

        {/* Kitchen Action Advisory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ChefHat className="w-4 h-4 text-orange-400" />
            <span>Automated Kitchen Prep Recommendations</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-0.5">12:15 PM Peak Window:</strong>
              Forecast indicates peak requirement of ~34 orders. Recommend pre-cooking 25x Veg Thali gravies and pre-portioning 20x samosas by 12:00 PM.
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <strong className="text-blue-400 block mb-0.5">12:30 PM Secondary Wave:</strong>
              Management batch break causes sandwich & beverage rush. Keep cold coffee mixer ready and sandwich grill heated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
