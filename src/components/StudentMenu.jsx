import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { Search, Filter, Plus, Minus, Star, Clock, Flame } from 'lucide-react';

export default function StudentMenu() {
  const { menu, cart, addToCart, updateCartQty, setSelectedFoodDetail } = useCampus();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Combos'];

  const filtered = menu.filter(item => {
    const matchCat = selectedCat === 'All' || item.category === selectedCat;
    const matchVeg = !vegOnly || item.isVeg;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchVeg && matchSearch;
  });

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">🍽️ Canteen Menu</h2>
        <p className="text-xs text-slate-400">Browse all authentic campus dishes and pre-order</p>
      </div>

      {/* Search & Veg Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search all dishes, chai, combos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Category selector & Veg switch */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  selectedCat === c
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border shrink-0 transition ${
              vegOnly 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            <span>Veg</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            No dishes match your filter.
          </div>
        ) : (
          filtered.map((item) => {
            const cartEntry = cart[item.id];
            const inCartQty = cartEntry ? cartEntry.quantity : 0;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-3.5 flex items-center gap-3.5 transition group"
              >
                <div
                  onClick={() => setSelectedFoodDetail(item)}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-slate-950/80 p-1 rounded-md">
                    <span className={`block w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  </div>
                </div>

                <div
                  onClick={() => setSelectedFoodDetail(item)}
                  className="flex-1 min-w-0 space-y-1 cursor-pointer"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-orange-400 transition">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>{item.prepTimeMinutes}m</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.rating}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <span className="font-mono font-black text-sm text-orange-400">
                    ₹{item.price}
                  </span>

                  {item.available ? (
                    inCartQty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl transition shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white w-3 text-center">{inCartQty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="text-orange-400 hover:text-orange-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-[10px] text-rose-400 font-bold">Sold Out</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
