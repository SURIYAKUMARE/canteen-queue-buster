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
  Sparkles
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
    category: 'Lunch',
    price: 60,
    isVeg: true,
    prepTimeMinutes: 5,
    calories: '400 kcal',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
    description: ''
  });

  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Combos'];

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Lunch',
      price: 60,
      isVeg: true,
      prepTimeMinutes: 5,
      calories: '400 kcal',
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
      description: ''
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      prepTimeMinutes: item.prepTimeMinutes,
      calories: item.calories || '350 kcal',
      image: item.image,
      description: item.description
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingItem) {
      updateFoodItem(editingItem.id, formData);
    } else {
      addFoodItem(formData);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 px-4 text-white animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🍛 Canteen Menu Manager</span>
          </h2>
          <p className="text-xs text-slate-400">Update prices, recipes & toggle in-stock availability</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-orange-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food</span>
        </button>
      </div>

      {/* Food Items List */}
      <div className="space-y-3">
        {menu.map((food) => (
          <div
            key={food.id}
            className={`bg-slate-900 border rounded-3xl p-3.5 flex items-center gap-3 transition ${
              food.available ? 'border-slate-800' : 'border-rose-900/40 opacity-75'
            }`}
          >
            <img
              src={food.image}
              alt={food.name}
              className="w-16 h-16 rounded-2xl object-cover shrink-0"
            />

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${food.isVeg ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate">{food.name}</h4>
              </div>

              <div className="text-[11px] font-mono text-orange-400 font-bold">
                ₹{food.price} <span className="text-slate-400 font-normal font-sans">• {food.category}</span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => toggleFoodAvailability(food.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                    food.available
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${food.available ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                  <span>{food.available ? 'IN STOCK' : 'SOLD OUT'}</span>
                </button>
              </div>
            </div>

            {/* Edit & Delete Buttons */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => openEditModal(food)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Edit item details and price"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete "${food.name}" from canteen menu?`)) {
                    deleteFoodItem(food.id);
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
          <div className="bg-slate-900 border border-slate-800 rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">
                {editingItem ? 'Edit Canteen Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Food Item Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Rice or Samosa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Price (₹):</label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Dietary Type:</label>
                  <select
                    value={formData.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="nonveg">Non-Veg</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Prep Time (mins):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value, 10) || 5 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Food Image URL:</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description:</label>
                <textarea
                  rows="2"
                  placeholder="Describe ingredients and meal contents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md active:scale-98"
                >
                  {editingItem ? 'Save Changes' : 'Add Item to Canteen Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
