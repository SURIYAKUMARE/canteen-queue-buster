import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Star, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  UtensilsCrossed 
} from 'lucide-react';
import { EmptyState } from './ui';
import { useToast } from './ui/ToastContext';

const FAVORITES_STORAGE_KEY = 'CAMPUSBITE_FAVORITES_V2';

export default function StudentMenu() {
  const { 
    menu, 
    cart, 
    cartCount, 
    cartTotal, 
    addToCart, 
    updateCartQty, 
    setSelectedFoodDetail, 
    initiateCheckout 
  } = useCampus();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (itemId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(itemId);
      const next = isFav ? prev.filter(id => id !== itemId) : [...prev, itemId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed saving favorites to localStorage:', err);
      }
      if (!isFav) {
        toast.success('Added to your Favorites! ❤️');
      } else {
        toast.info('Removed from Favorites');
      }
      return next;
    });
  };

  const categories = ['All', 'Favorites', 'Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Combos'];

  const filtered = (menu || []).filter(item => {
    if (!item) return false;
    
    // Category match or Favorites filter
    let matchCat = true;
    if (selectedCat === 'Favorites') {
      matchCat = favorites.includes(item.id);
    } else if (selectedCat !== 'All') {
      matchCat = item.category === selectedCat;
    }

    const isVegItem = item.isVeg !== false && item.is_veg !== false;
    const matchVeg = !vegOnly || isVegItem;
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const q = (search || '').toLowerCase();
    const matchSearch = name.includes(q) || desc.includes(q);
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
            {categories.map((c) => {
              const isFavCat = c === 'Favorites';
              const isSelected = selectedCat === c;

              return (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isFavCat && <Heart className={`w-3 h-3 ${isSelected ? 'fill-slate-950 text-slate-950' : 'text-rose-400'}`} />}
                  <span>{c}</span>
                  {isFavCat && favorites.length > 0 && (
                    <span className="text-[10px] px-1 bg-black/20 rounded-full font-mono">
                      {favorites.length}
                    </span>
                  )}
                </button>
              );
            })}
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
          <EmptyState
            icon={selectedCat === 'Favorites' ? Heart : UtensilsCrossed}
            title={selectedCat === 'Favorites' ? 'No favorites saved yet' : 'No dishes match your filter'}
            description={
              selectedCat === 'Favorites'
                ? 'Tap the heart icon on any dish card to bookmark your campus favorites for 1-tap reordering.'
                : 'Try adjusting your search query or selecting another food category.'
            }
          />
        ) : (
          filtered.map((item) => {
            const cartEntry = cart[item.id];
            const inCartQty = cartEntry ? cartEntry.quantity : 0;

            const isVeg = item.isVeg !== false && item.is_veg !== false;
            const isAvailable = item.available !== false && item.is_available !== false;
            const imgUrl = item.image || item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300';
            const prepMins = item.prepTimeMinutes || item.prep_time || 5;
            const rating = item.rating || 4.8;
            const price = Number(item.price || 0);
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-3.5 flex items-center gap-3.5 transition group relative"
              >
                <div
                  onClick={() => setSelectedFoodDetail(item)}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer"
                >
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-slate-950/80 p-1 rounded-md">
                    <span className={`block w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/70 backdrop-blur-sm text-slate-300 hover:text-white transition active:scale-90"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-400'}`} />
                  </button>
                </div>

                <div
                  onClick={() => setSelectedFoodDetail(item)}
                  className="flex-1 min-w-0 space-y-1 cursor-pointer"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-400 transition">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{prepMins}m</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{rating}</span>
                    </span>
                    {!isAvailable && (
                      <span className="text-rose-400 font-bold ml-auto">SOLD OUT</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <span className="font-mono font-black text-sm text-amber-400">
                    ₹{price.toFixed(2)}
                  </span>

                  {isAvailable ? (
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

      {/* Sticky Book Food Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 z-30 px-4 max-w-md mx-auto animate-scaleUp">
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-amber-500 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between backdrop-blur-lg">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-amber-400" />
                {cartCount} item{cartCount > 1 ? 's' : ''} added
              </span>
              <div className="text-xl font-black font-mono text-amber-400">
                ₹{cartTotal.toFixed(2)}
              </div>
            </div>

            <button
              id="book-food-btn"
              onClick={() => {
                initiateCheckout();
              }}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Book Food</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
