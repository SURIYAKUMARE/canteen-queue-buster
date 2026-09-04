import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Smartphone, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Search, 
  Filter, 
  Sparkles,
  ArrowLeft,
  Share2,
  BellRing
} from 'lucide-react';

export default function StudentView() {
  const { 
    menu, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    totalCartItems, 
    cartSubtotal, 
    placeOrder, 
    currentStudentOrder,
    setCurrentStudentOrder,
    orderHistory,
    activeTabStudent,
    setActiveTabStudent,
    setNotification,
    maxCapacityPerSlot
  } = useCanteen();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [mobileFrameMode, setMobileFrameMode] = useState(true);

  // Checkout form state
  const [studentName, setStudentName] = useState('Rahul Verma (Roll: 21BCS042)');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState('Campus RFID Wallet');
  const [orderNotes, setOrderNotes] = useState('');

  const categories = ['All', 'Meals', 'South Indian', 'North Indian', 'Quick Bites', 'Beverages'];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesSearch;
  });

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);
    try {
      await placeOrder({
        studentName,
        studentPhone,
        paymentMethod,
        notes: orderNotes
      });
      setIsCartOpen(false);
      setActiveTabStudent('token');
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Controls: Frame Mode Toggle & View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>🎓 Student Pre-Order Portal</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Mobile-First
            </span>
          </h2>
          <p className="text-xs text-slate-400">Order from class or hostel, skip the 15-minute token counter queue.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Internal sub-tabs */}
          <div className="bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTabStudent('menu')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTabStudent === 'menu' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🍽️ Browse Menu
            </button>
            <button
              onClick={() => setActiveTabStudent('token')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeTabStudent === 'token' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎫 Active Token {currentStudentOrder && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>
            <button
              onClick={() => setActiveTabStudent('history')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTabStudent === 'history' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              📜 History ({orderHistory.length})
            </button>
          </div>

          {/* Toggle Device Frame */}
          <button
            onClick={() => setMobileFrameMode(!mobileFrameMode)}
            className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{mobileFrameMode ? 'Desktop Layout' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Container (Responsive or Mobile Device Frame) */}
      <div className={mobileFrameMode ? 'max-w-md mx-auto' : 'w-full'}>
        <div className={mobileFrameMode ? 'bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl p-4 sm:p-5 relative overflow-hidden min-h-[750px] flex flex-col justify-between' : ''}>
          {/* Phone Speaker Notch if in frame mode */}
          {mobileFrameMode && (
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>
          )}

          {/* ================= TAB 1: MENU BROWSING ================= */}
          {activeTabStudent === 'menu' && (
            <div className="space-y-4 flex-1 pb-20">
              {/* Search & Veg Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search dishes, chai, meals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                {/* Category Pills & Veg Switch */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
                  <div className="flex items-center gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setVegOnly(!vegOnly)}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 transition ${
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

              {/* Menu Items List */}
              <div className="space-y-3">
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No canteen items match your search.
                  </div>
                ) : (
                  filteredMenu.map((item) => {
                    const cartEntry = cart[item.id];
                    const qty = cartEntry ? cartEntry.quantity : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-start gap-3 transition"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {item.emoji}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                              <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.name}</h4>
                            </div>
                            <span className="font-mono font-bold text-orange-400 text-xs sm:text-sm shrink-0">
                              ₹{item.price}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                              <Clock className="w-3 h-3 text-orange-400" />
                              <span>~{item.prepTimeMinutes} mins prep</span>
                            </div>

                            {/* Add to cart / Quantity controller */}
                            {qty === 0 ? (
                              <button
                                onClick={() => addToCart(item)}
                                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 shadow-md shadow-orange-500/20"
                              >
                                <Plus className="w-3 h-3" />
                                <span>ADD</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5">
                                <button
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  className="text-slate-300 hover:text-white active:scale-90"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-mono font-bold text-white">{qty}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  className="text-orange-400 hover:text-orange-300 active:scale-90"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: ACTIVE TOKEN & STATUS ================= */}
          {activeTabStudent === 'token' && (
            <div className="space-y-4 flex-1 pb-8">
              {!currentStudentOrder ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 my-auto">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                    🎫
                  </div>
                  <h3 className="font-bold text-white text-sm">No Active Pre-Order</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    You haven't placed an order yet in this session. Add delicious items from the menu and pre-order to skip the line!
                  </p>
                  <button
                    onClick={() => setActiveTabStudent('menu')}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Go to Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Digital Token Pass Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500/50 rounded-2xl p-4 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Digital Token Pass</span>
                        <div className="text-2xl font-black font-mono text-white tracking-wider">
                          {currentStudentOrder.tokenNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Scheduled Slot</span>
                        <div className="text-sm font-bold font-mono text-orange-400">
                          {currentStudentOrder.pickupSlot}
                        </div>
                      </div>
                    </div>

                    {/* QR Code & Pickup Bay */}
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                        {/* Mock QR SVG */}
                        <svg className="w-20 h-20 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-8-8h2v2h-2V6zm2 2h2v2h-2V8zm-2 2h2v2h-2v-2z" />
                        </svg>
                      </div>

                      <div className="flex-1 space-y-1 text-xs">
                        <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block font-medium">Pickup Bay</span>
                          <strong className="text-sm text-emerald-400 font-bold">
                            {currentStudentOrder.counterBay || 'Bay 1 (Express)'}
                          </strong>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Order for: <strong className="text-white">{currentStudentOrder.studentName}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Paid ₹{currentStudentOrder.totalAmount} via {currentStudentOrder.paymentMethod}
                        </div>
                      </div>
                    </div>

                    {/* Live Status Progress Stepper */}
                    <div className="mt-2 pt-3 border-t border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-400">Order Stage:</span>
                        <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          currentStudentOrder.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                            : currentStudentOrder.status === 'preparing'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : currentStudentOrder.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {currentStudentOrder.status === 'ready' ? '🔔 READY FOR PICKUP!' : currentStudentOrder.status}
                        </span>
                      </div>

                      {/* 4-Step Visual Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                        {[
                          { label: 'Confirmed', step: 1 },
                          { label: 'Preparing', step: 2 },
                          { label: 'Ready', step: 3 },
                          { label: 'Picked Up', step: 4 }
                        ].map((s) => {
                          const currentStep = getStatusStepIndex(currentStudentOrder.status);
                          const isDone = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;

                          return (
                            <div key={s.step} className="space-y-1">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isDone
                                    ? s.step === 3
                                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
                                      : 'bg-orange-500'
                                    : 'bg-slate-800'
                                }`}
                              ></div>
                              <span className={`text-[9px] block ${isCurrent ? 'font-bold text-white' : 'text-slate-500'}`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Simulation Notification Trigger Button */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setNotification({
                            type: 'SMS_PREVIEW',
                            token: currentStudentOrder.tokenNumber,
                            slot: currentStudentOrder.pickupSlot,
                            bay: currentStudentOrder.counterBay || 'Bay 1',
                            phone: currentStudentOrder.studentPhone,
                            text: `🔔 Smart Canteen: Token ${currentStudentOrder.tokenNumber} is currently ${currentStudentOrder.status}. Slot: ${currentStudentOrder.pickupSlot} at ${currentStudentOrder.counterBay || 'Bay 1'}.`
                          });
                        }}
                        className="flex items-center gap-1.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-400" />
                        <span>Preview Phone SMS / WhatsApp</span>
                      </button>

                      <span className="text-[10px] text-slate-400">
                        {currentStudentOrder.items.length} items
                      </span>
                    </div>
                  </div>

                  {/* Item summary list */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                    <h5 className="text-xs font-bold text-slate-300">Items in this Pre-Order:</h5>
                    <div className="space-y-1.5">
                      {currentStudentOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span>{item.emoji || '🍽️'}</span>
                            <span className="font-semibold text-white">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </span>
                          <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: ORDER HISTORY ================= */}
          {activeTabStudent === 'history' && (
            <div className="space-y-3 flex-1 pb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Pre-Orders</h4>
              {orderHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No previous orders saved yet.
                </div>
              ) : (
                orderHistory.map((histOrder) => (
                  <div
                    key={histOrder.id}
                    onClick={() => {
                      setCurrentStudentOrder(histOrder);
                      setActiveTabStudent('token');
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{histOrder.tokenNumber}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          Slot: {histOrder.pickupSlot}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {histOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-orange-400">₹{histOrder.totalAmount}</div>
                      <span className="text-[10px] capitalize text-slate-400">{histOrder.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Floating Cart Button (when items are in cart) */}
          {totalCartItems > 0 && activeTabStudent === 'menu' && (
            <div className="absolute bottom-4 left-4 right-4 z-30">
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold py-3 px-4 rounded-2xl shadow-xl flex items-center justify-between transition active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 text-orange-400 flex items-center justify-center text-xs font-mono font-black">
                    {totalCartItems}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-950 font-extrabold">View Pre-Order Cart</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-sm">
                  <span>₹{cartSubtotal}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= CART & CHECKOUT DRAWER / MODAL ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white text-base">Your Canteen Cart</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {Object.values(cart).map((entry) => (
                <div key={entry.item.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {entry.item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-white text-xs truncate">{entry.item.name}</h5>
                    <div className="text-[10px] text-slate-400 font-mono">₹{entry.item.price} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(entry.item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white w-4 text-center">{entry.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(entry.item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(entry.item.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Special instructions */}
              <div className="space-y-1 pt-2">
                <label className="text-[11px] font-semibold text-slate-400">Preparation Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, pack separately"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Simulated Payment Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Select Simulated Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Campus RFID Wallet', label: 'RFID Card', icon: CreditCard, sub: 'Bal: ₹450' },
                    { id: 'UPI (GPay/PhonePe)', label: 'UPI QR', icon: Smartphone, sub: 'Instant' },
                    { id: 'Cash at Counter', label: 'Cash', icon: Banknote, sub: 'At Bay' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === p.id
                          ? 'bg-orange-500/15 border-orange-500 text-orange-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold block">{p.label}</span>
                      <span className="text-[9px] text-slate-500 block">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Scheduling Preview Badge */}
              <div className="bg-blue-950/40 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Earliest Pickup Slot Scheduling</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  System will automatically reserve the earliest 5-minute slot respecting the {maxCapacityPerSlot} items/slot kitchen capacity.
                </p>
              </div>
            </div>

            {/* Drawer Footer / Submit Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total to Pay (Simulated):</span>
                <span className="font-mono text-base font-black text-white">₹{cartSubtotal}</span>
              </div>

              <button
                disabled={isCheckingOut}
                onClick={handleCheckoutSubmit}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-98"
              >
                {isCheckingOut ? 'Generating Token & Assigning Slot...' : `Pay ₹${cartSubtotal} & Reserve Pickup Slot`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
