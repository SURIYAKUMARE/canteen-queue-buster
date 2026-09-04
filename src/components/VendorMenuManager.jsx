import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  IndianRupee, 
  Clock, 
  Flame, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Package,
  Image as ImageIcon
} from 'lucide-react';

export default function VendorMenuManager() {
  const { 
    menu, 
    addFoodItem, 
    updateFoodItem, 
    deleteFoodItem, 
    toggleFoodAvailability 
  } = useCampus();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Lunch',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 40,
    is_available: true
  });

  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Combos'];

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Lunch',
      price: 60,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      stock_quantity: 40,
      is_available: true
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || 'Lunch',
      price: item.price,
      image_url: item.image_url || item.image || '',
      stock_quantity: item.stock_quantity || 40,
      is_available: item.is_available !== false && item.available !== false
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingItem) {
      await updateFoodItem(editingItem.id, formData);
    } else {
      await addFoodItem(formData);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🍛 Canteen Menu Manager</span>
          </h2>
          <p className="text-xs text-slate-400">Manage catalog, pricing & stock live in Supabase</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dish</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="space-y-3">
        {menu.map((item) => {
          const isAvailable = item.is_available !== false && item.available !== false;
          const img = item.image_url || item.image;
          const price = Number(item.price || 0);

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-3xl p-3.5 flex items-center justify-between gap-3 transition ${
                isAvailable ? 'border-slate-800' : 'border-rose-950/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={img}
                  alt={item.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 bg-slate-800 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                    ₹{price.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Stock: {item.stock_quantity || 40} units
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFoodAvailability(item.id)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition ${
                    isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isAvailable ? 'In Stock' : 'Sold Out'}
                </button>

                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Edit item"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.name}" from canteen menu?`)) {
                      deleteFoodItem(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950 transition"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleUp text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Food Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Masala Dosa Deluxe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short appetizing description"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Price (₹):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Stock Quantity:</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Availability:</label>
                  <select
                    value={formData.is_available ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Image URL:
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30"
              >
                {editingItem ? 'Save Updates to Database' : 'Publish Dish to Canteen Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
