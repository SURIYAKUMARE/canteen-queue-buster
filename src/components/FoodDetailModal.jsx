import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { X, Clock, Flame, Star, Plus, Minus, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useToast } from './ui/ToastContext';

export default function FoodDetailModal() {
  const { selectedFoodDetail, setSelectedFoodDetail, addToCart, menu } = useCampus();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [cookingNotes, setCookingNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);


  if (!selectedFoodDetail) return null;
  const food = selectedFoodDetail;

  const handleAdd = () => {
    addToCart(food, qty, cookingNotes);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setSelectedFoodDetail(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-white">
        
        {/* Large Food Image with Close Button */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-800">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30"></div>

          <button
            onClick={() => setSelectedFoodDetail(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tags */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              food.isVeg ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
              {food.isVeg ? '● Pure Veg' : '▲ Non-Veg'}
            </span>
            <span className="bg-slate-900/80 text-amber-400 font-semibold px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border border-slate-700">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{food.rating}</span>
            </span>
            {food.tags && food.tags[0] && (
              <span className="bg-orange-500/90 text-white font-semibold px-2.5 py-0.5 rounded-full text-xs">
                {food.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{food.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>~{food.prepTimeMinutes} mins prep</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{food.calories}</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-300">{food.category}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Price</span>
              <span className="text-2xl font-black font-mono text-orange-400">₹{food.price}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            {food.description}
          </p>

          {/* Custom cooking instructions input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Special Cooking Instructions (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, pack chutney separately, no onion"
              value={cookingNotes}
              onChange={(e) => setCookingNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Frequently Paired With / Smart Upsell */}
          {(() => {
            const pairings = (menu || [])
              .filter(m => m.id !== food.id && (m.available !== false && m.is_available !== false))
              .filter(m => {
                if (food.category === 'Drinks') return m.category === 'Snacks' || m.category === 'Breakfast';
                return m.category === 'Drinks' || m.category === 'Snacks';
              })
              .slice(0, 2);

            if (pairings.length === 0) return null;

            return (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Frequently Paired Together:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pairings.map(p => (
                    <div key={p.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-bold text-white truncate">{p.name}</h5>
                        <span className="text-[10px] font-mono text-amber-400">₹{p.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(p, 1);
                          toast.success(`Added ${p.name} to cart!`);
                        }}
                        className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-[10px] font-bold shrink-0 transition active:scale-95 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">

            <span className="text-xs font-bold text-slate-300">Select Quantity:</span>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-base w-6 text-center text-white">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 flex items-center justify-center transition active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleAdd}
            disabled={!food.available}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between transition shadow-xl active:scale-98 ${
              food.available 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-orange-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{addedAnimation ? 'Added to Cart ✓' : food.available ? 'Add to Cart' : 'Currently Sold Out'}</span>
            </div>
            <span className="font-mono font-black text-base">₹{food.price * qty}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
