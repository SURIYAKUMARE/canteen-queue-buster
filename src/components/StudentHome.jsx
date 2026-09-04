import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Search, 
  Sparkles, 
  Clock, 
  Flame, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function StudentHome() {
  const { 
    studentUser, 
    isCanteenOpen, 
    menu, 
    cart, 
    addToCart, 
    updateCartQty, 
    setSelectedFoodDetail, 
    setStudentTab,
    cartCount,
    cartTotal,
    setIsCartOpen
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All Items', icon: '🍽️' },
    { id: 'Breakfast', label: 'Breakfast', icon: '🥞' },
    { id: 'Lunch', label: 'Lunch Meals', icon: '🍱' },
    { id: 'Snacks', label: 'Snacks & Bites', icon: '🥪' },
    { id: 'Drinks', label: 'Hot & Cold Drinks', icon: '☕' },
    { id: 'Combos', label: 'Student Combos', icon: '🔥' },
  ];

  const filteredMenu = (menu || []).filter(item => {
    if (!item) return false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = name.includes(q) || desc.includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredItems = (menu || []).filter(item => item?.tags && item.tags.some(t => t.includes('Special') || t.includes('Best Seller') || t.includes('Combo')));

  const studentFirstName = (studentUser?.name || 'Student').split(' ')[0];

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 px-4 text-white animate-fade-in">
      {/* Top Greeting & Canteen Status Banner */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Welcome to Campus Dining</span>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Hi, {studentFirstName}</span>
              <span className="animate-wiggle">👋</span>
            </h2>
          </div>

          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isCanteenOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCanteenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span>{isCanteenOpen ? 'Canteen OPEN' : 'CLOSED'}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">8:00 AM – 6:30 PM</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search meals, samosa, cold coffee, biryani..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
          />
        </div>
      </div>

      {/* Featured / Popular Carousel Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 rounded-3xl p-4 shadow-xl text-slate-950">
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1 max-w-[210px]">
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full font-mono uppercase">
              POPULAR TODAY
            </span>
            <h3 className="font-black text-base text-slate-950 leading-tight">
              Pre-Order & Skip The 15-Min Rush!
            </h3>
            <p className="text-[11px] text-slate-900 font-medium">
              Order from class. Get your unique QR token.
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white/40 shrink-0 bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80"
              alt="Chicken Biryani"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Food Categories Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Food Categories</h3>
          <button
            onClick={() => setStudentTab('menu')}
            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
          >
            <span>See Full Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-102'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {selectedCategory === 'All' ? 'All Canteen Items' : selectedCategory} ({filteredMenu.length})
          </h3>
          <span className="text-[10px] text-slate-500">Tap item for cooking options</span>
        </div>

        {filteredMenu.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
            No dishes match your search or category filter.
          </div>
        ) : (
          filteredMenu.map((item) => {
            const cartEntry = cart[item.id];
            const inCartQty = cartEntry ? cartEntry.quantity : 0;
            const isVeg = item.isVeg !== false && item.is_veg !== false;
            const isAvailable = item.available !== false && item.is_available !== false;
            const imgUrl = item.image || item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300';
            const prepMins = item.prepTimeMinutes || item.prep_time || 5;
            const rating = item.rating || 4.8;
            const price = Number(item.price || 0);

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-3xl p-3.5 flex items-center gap-3.5 transition group shadow-md"
              >
                {/* Food Image with Veg Dot Badge */}
                <div 
                  onClick={() => setSelectedFoodDetail(item)}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer"
                >
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-sm p-1 rounded-md">
                    <span className={`block w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  </div>
                </div>

                      {/* Details */}
                      <div 
                        onClick={() => setSelectedFoodDetail(item)}
                        className="flex-1 min-w-0 space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-400 transition">
                            {item.name}
                          </h4>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>~{prepMins}m</span>
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

                      {/* Price & Add Controller */}
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
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3 px-4 rounded-2xl shadow-2xl flex items-center justify-between transition active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-950 text-orange-400 flex items-center justify-center text-xs font-mono font-black">
                {cartCount}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-950">View Pre-Order Cart</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-sm">
              <span>₹{cartTotal}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
