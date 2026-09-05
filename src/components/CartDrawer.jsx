import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Tag, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './ui/ToastContext';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItemsArray, 
    updateCartQty, 
    removeFromCart, 
    cartTotal, 
    cartCount,
    clearCart,
    setIsCheckoutOpen
  } = useCampus();
  const { toast } = useToast();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount, label }
  const [pickupTime, setPickupTime] = useState('immediate'); // 'immediate' | '20min' | '40min'

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'CAMPUS20') {
      const discount = Math.round(cartTotal * 0.2);
      setAppliedPromo({ code: clean, discount, label: '20% Campus Student Discount' });
      toast.success(`Promo CAMPUS20 applied! You saved ₹${discount} 🎉`);
    } else if (clean === 'WELCOME') {
      const discount = Math.min(15, cartTotal);
      setAppliedPromo({ code: clean, discount, label: '₹15 First Order Discount' });
      toast.success(`Promo WELCOME applied! You saved ₹${discount} 🎉`);
    } else if (clean === 'SNACK10') {
      const discount = Math.min(10, cartTotal);
      setAppliedPromo({ code: clean, discount, label: '₹10 Snack Voucher' });
      toast.success(`Promo SNACK10 applied! You saved ₹${discount} 🎉`);
    } else {
      toast.error('Invalid voucher code. Try CAMPUS20 or WELCOME');
    }
    setPromoInput('');
  };

  const discountAmount = appliedPromo ? Math.min(appliedPromo.discount, cartTotal) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Your Campus Cart</h3>
              <p className="text-[11px] text-slate-400">{cartCount} items selected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cartItemsArray.length > 0 && (
              <button
                onClick={() => {
                  clearCart();
                  setAppliedPromo(null);
                  toast.info('Cart cleared');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {cartItemsArray.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                🛒
              </div>
              <h4 className="font-bold text-white text-sm">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore delicious breakfast, lunch, and snacks from the canteen menu to pre-order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Pickup Schedule Window */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Window:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Counter Bay 1 & 2</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold font-mono">
                  <button
                    type="button"
                    onClick={() => setPickupTime('immediate')}
                    className={`py-1.5 px-2 rounded-xl border transition ${
                      pickupTime === 'immediate'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🚀 ASAP (5-10m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickupTime('20min')}
                    className={`py-1.5 px-2 rounded-xl border transition ${
                      pickupTime === '20min'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ⏰ In 20 mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickupTime('40min')}
                    className={`py-1.5 px-2 rounded-xl border transition ${
                      pickupTime === '40min'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎒 In 40 mins
                  </button>
                </div>
              </div>

              {/* Items */}
              {cartItemsArray.map((entry) => (
                <div
                  key={entry.food.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <img
                    src={entry.food.image}
                    alt={entry.food.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.food.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <h5 className="font-bold text-xs text-white truncate">{entry.food.name}</h5>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ₹{entry.food.price} each
                    </div>
                    {entry.notes && (
                      <div className="text-[10px] text-amber-300 italic truncate max-w-[160px]">
                        "{entry.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateCartQty(entry.food.id, -1)}
                        className="text-slate-300 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-white w-4 text-center">{entry.quantity}</span>
                      <button
                        onClick={() => updateCartQty(entry.food.id, 1)}
                        className="text-orange-400 hover:text-orange-300 p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-mono text-xs font-bold text-white w-10 text-right">
                      ₹{entry.food.price * entry.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(entry.food.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Promo Code Box */}
              <div className="pt-1">
                {appliedPromo ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-mono font-bold text-xs text-emerald-300">{appliedPromo.code}</span>
                        <span className="text-[10px] text-slate-400 block">{appliedPromo.label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-[10px] text-rose-400 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Promo (try CAMPUS20 / WELCOME)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bill Summary & Proceed button */}
        {cartItemsArray.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">₹{cartTotal}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span>Voucher Savings ({appliedPromo.code})</span>
                  <span className="font-mono">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400">
                <span>Canteen Platform Fee</span>
                <span className="text-emerald-400 font-semibold font-mono">FREE (₹0)</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold text-sm text-white">
                <span>Grand Total</span>
                <span className="font-mono text-amber-400 text-base">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition active:scale-98 flex items-center justify-between px-4 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1 font-mono">
                <span>₹{finalTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
