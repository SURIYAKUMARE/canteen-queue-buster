import React, { useState, useEffect } from 'react';
import { databaseService } from '../lib/databaseService';
import { 
  ShieldCheck, 
  Users, 
  ChefHat, 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Check, 
  X, 
  QrCode, 
  Sparkles, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminPortal({ onBack }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'vendors' | 'food'

  // Data states
  const [students, setStudents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [foodModalOpen, setFoodModalOpen] = useState(false);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    fullName: '',
    password: '',
    department: 'Computer Science',
    year: '1st Year',
    section: 'A',
    email: '',
    phone: ''
  });

  // New Vendor Form
  const [newVendor, setNewVendor] = useState({
    vendorId: '',
    vendorName: '',
    canteenName: '',
    password: '',
    phone: '',
    email: '',
    canteenDetails: 'Bay 1 (Hot Meals)',
    upiId: '',
    upiQrUrl: ''
  });

  // New Food Form
  const [newFood, setNewFood] = useState({
    vendorId: '',
    name: '',
    description: '',
    price: '',
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    isAvailable: true
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [stuList, venList, foodList] = await Promise.all([
        databaseService.getStudents(),
        databaseService.getVendors(),
        databaseService.getFoodItems()
      ]);
      setStudents(stuList || []);
      setVendors(venList || []);
      setFoodItems(foodList || []);
      if (venList?.length > 0 && !newFood.vendorId) {
        setNewFood(prev => ({ ...prev, vendorId: venList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAllData();
    }
  }, [isAdminAuthenticated]);

  const handleAdminPasscodeSubmit = (e) => {
    e.preventDefault();
    if (adminPasscode === 'admin123' || adminPasscode === 'admin') {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin passcode. Default demo passcode is: admin123');
    }
  };

  // Student Actions
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await databaseService.createStudentAccount(newStudent);
      setFormSuccess(`Student account ${newStudent.studentId} created successfully!`);
      setStudentModalOpen(false);
      setNewStudent({
        studentId: '',
        fullName: '',
        password: '',
        department: 'Computer Science',
        year: '1st Year',
        section: 'A',
        email: '',
        phone: ''
      });
      loadAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to create student account');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student account?')) return;
    try {
      await databaseService.deleteStudent(id);
      loadAllData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Vendor Actions
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await databaseService.createVendorAccount(newVendor);
      setFormSuccess(`Vendor ${newVendor.vendorId} created successfully!`);
      setVendorModalOpen(false);
      setNewVendor({
        vendorId: '',
        vendorName: '',
        canteenName: '',
        password: '',
        phone: '',
        email: '',
        canteenDetails: 'Bay 1 (Hot Meals)',
        upiId: '',
        upiQrUrl: ''
      });
      loadAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to create vendor account');
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor account?')) return;
    try {
      await databaseService.deleteVendor(id);
      loadAllData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleUpdateVendorQr = async (vendorId, currentQr) => {
    const newUrl = prompt('Enter new GPay/UPI QR Image URL for this vendor:', currentQr || '');
    if (newUrl !== null) {
      try {
        await databaseService.updateVendor(vendorId, { upi_qr_url: newUrl.trim() });
        loadAllData();
      } catch (err) {
        alert('Failed to update QR: ' + err.message);
      }
    }
  };

  // Food Actions
  const handleCreateFood = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await databaseService.addFoodItem(
        {
          name: newFood.name,
          description: newFood.description,
          price: parseFloat(newFood.price),
          category: newFood.category,
          image_url: newFood.imageUrl,
          is_available: newFood.isAvailable
        },
        newFood.vendorId || vendors[0]?.id
      );
      setFormSuccess(`Food item ${newFood.name} added!`);
      setFoodModalOpen(false);
      setNewFood({
        vendorId: vendors[0]?.id || '',
        name: '',
        description: '',
        price: '',
        category: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      });
      loadAllData();
    } catch (err) {
      setFormError(err.message || 'Failed to add food item');
    }
  };

  const handleDeleteFood = async (id) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await databaseService.deleteFoodItem(id);
      loadAllData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // 1. Passcode Protection Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 text-white animate-fadeIn">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition py-1 px-2 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Admin Access
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">System Owner Portal</h2>
            <p className="text-xs text-slate-400">
              Enter admin passcode to manage student & vendor credentials.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminPasscodeSubmit} className="space-y-4">
            <input
              id="admin-passcode-input"
              type="password"
              required
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="Enter passcode (admin123)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest transition"
            />
            <button
              id="admin-unlock-btn"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
            >
              Unlock Administration Portal
            </button>
          </form>

          <p className="text-[11px] text-slate-500 font-mono">
            Demo passcode: <strong>admin123</strong>
          </p>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-white animate-fadeIn pb-24">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="admin-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
            title="Return to Start Screen"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-black text-white">System Owner & User Management</h1>
            </div>
            <p className="text-xs text-slate-400">
              Create, configure, and isolate student and vendor credentials
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAdminAuthenticated(false);
            onBack();
          }}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 transition"
        >
          Exit Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          id="admin-students-tab"
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'students' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students ({students.length})</span>
        </button>

        <button
          id="admin-vendors-tab"
          onClick={() => setActiveTab('vendors')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'vendors' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Vendors ({vendors.length})</span>
        </button>

        <button
          id="admin-food-tab"
          onClick={() => setActiveTab('food')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'food' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food Catalog ({foodItems.length})</span>
        </button>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {formSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{formSuccess}</span>
          </div>
          <button onClick={() => setFormSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{formError}</span>
          </div>
          <button onClick={() => setFormError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. STUDENTS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Student Accounts</h3>
              <p className="text-xs text-slate-400">Only authorized students can log in and place food pre-orders.</p>
            </div>
            <button
              id="create-student-btn"
              onClick={() => {
                setFormError('');
                setStudentModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Student Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map((stu) => (
              <div
                key={stu.id || stu.student_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 text-xs">
                    {stu.student_id}
                  </span>
                  <button
                    onClick={() => handleDeleteStudent(stu.id || stu.student_id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-white text-sm">{stu.full_name || 'Student ' + stu.student_id}</h4>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 font-mono">
                  <div>Dept: <span className="text-slate-200">{stu.department || 'CS'}</span></div>
                  <div>Year: <span className="text-slate-200">{stu.year || '3rd Year'}</span></div>
                  <div>Sec: <span className="text-slate-200">{stu.section || 'A'}</span></div>
                  <div>Phone: <span className="text-slate-200">{stu.phone || 'N/A'}</span></div>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Email: <span className="text-slate-200">{stu.college_email}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                  Password: <span className="text-amber-300 font-bold">{stu.password || 'student123'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. VENDORS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Canteens & Vendors</h3>
              <p className="text-xs text-slate-400">Configure canteen credentials and custom GPay/UPI payment QRs.</p>
            </div>
            <button
              id="create-vendor-btn"
              onClick={() => {
                setFormError('');
                setVendorModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vendor Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendors.map((ven) => (
              <div
                key={ven.id || ven.vendor_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-indigo-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20 text-xs">
                    {ven.vendor_id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateVendorQr(ven.id, ven.upi_qr_url)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-indigo-950/40 transition"
                      title="Update GPay QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(ven.id || ven.vendor_id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{ven.canteen_name || ven.vendor_name}</h4>
                  <p className="text-xs text-slate-400">{ven.canteen_details || 'Campus Food Counter'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Phone: <span className="text-slate-200">{ven.phone || 'N/A'}</span></div>
                  <div>UPI ID: <span className="text-indigo-300">{ven.upi_id || 'canteen@upi'}</span></div>
                </div>

                {/* Configured GPay QR Preview */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white p-1 rounded-xl shrink-0 border border-slate-700 flex items-center justify-center">
                    {ven.upi_qr_url ? (
                      <img src={ven.upi_qr_url} alt="Vendor GPay QR" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-8 h-8 text-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Configured GPay QR</span>
                    <p className="text-[11px] text-slate-300 truncate">
                      {ven.upi_qr_url ? 'Custom image loaded' : 'Dynamic UPI generator'}
                    </p>
                    <button
                      onClick={() => handleUpdateVendorQr(ven.id, ven.upi_qr_url)}
                      className="text-[10px] text-indigo-400 hover:underline font-bold"
                    >
                      Change Payment QR →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FOOD CATALOG TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'food' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Food Catalog</h3>
              <p className="text-xs text-slate-400">Manage dishes, pricing, and live availability.</p>
            </div>
            <button
              id="create-food-btn"
              onClick={() => {
                setFormError('');
                setFoodModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-950 relative">
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.is_available !== false ? 'bg-emerald-500/80 text-slate-950' : 'bg-rose-500/80 text-white'
                    }`}>
                      {item.is_available !== false ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-black text-amber-400 font-mono">₹{Number(item.price).toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteFood(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE STUDENT */}
      {/* ============================================================= */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create Student Account</h3>
              <button onClick={() => setStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU002"
                    value={newStudent.studentId}
                    onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya R"
                    value={newStudent.fullName}
                    onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. CS / ECE"
                    value={newStudent.department}
                    onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Year"
                    value={newStudent.year}
                    onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. B"
                    value={newStudent.section}
                    onChange={e => setNewStudent({ ...newStudent, section: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">College Email</label>
                  <input
                    type="email"
                    placeholder="e.g. stu002@college.edu"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43211"
                    value={newStudent.phone}
                    onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Set Password *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. student123"
                  value={newStudent.password}
                  onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE VENDOR */}
      {/* ============================================================= */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Create Vendor Account</h3>
              <button onClick={() => setVendorModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vendor ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VEN002"
                    value={newVendor.vendorId}
                    onChange={e => setNewVendor({ ...newVendor, vendorId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vendor / Staff Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Express"
                    value={newVendor.vendorName}
                    onChange={e => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Canteen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Central Canteen"
                  value={newVendor.canteenName}
                  onChange={e => setNewVendor({ ...newVendor, canteenName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ven002@college.edu"
                    value={newVendor.email}
                    onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00002"
                    value={newVendor.phone}
                    onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Canteen Details / Bay</label>
                <input
                  type="text"
                  placeholder="e.g. Bay 2 (Fresh Juice & Hot Snacks)"
                  value={newVendor.canteenDetails}
                  onChange={e => setNewVendor({ ...newVendor, canteenDetails: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vendor UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. canteen@okhdfcbank"
                    value={newVendor.upiId}
                    onChange={e => setNewVendor({ ...newVendor, upiId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Set Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="vendor123"
                    value={newVendor.password}
                    onChange={e => setNewVendor({ ...newVendor, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">GPay/UPI QR Image URL (Configurable)</label>
                <input
                  type="url"
                  placeholder="https://... (or leave blank to auto-generate from UPI ID)"
                  value={newVendor.upiQrUrl}
                  onChange={e => setNewVendor({ ...newVendor, upiQrUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Students will see this exact GPay/UPI QR on the payment screen.
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black shadow-md"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD FOOD ITEM */}
      {/* ============================================================= */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add Food Item to Canteen</h3>
              <button onClick={() => setFoodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Canteen / Vendor *</label>
                <select
                  value={newFood.vendorId}
                  onChange={e => setNewFood({ ...newFood, vendorId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.canteen_name || v.vendor_name} ({v.vendor_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masala Dosa"
                    value={newFood.name}
                    onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 50"
                    value={newFood.price}
                    onChange={e => setNewFood({ ...newFood, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Crispy crepe with spiced potato filling..."
                  value={newFood.description}
                  onChange={e => setNewFood({ ...newFood, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newFood.category}
                    onChange={e => setNewFood({ ...newFood, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newFood.imageUrl}
                    onChange={e => setNewFood({ ...newFood, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFoodModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow-md"
                >
                  Add Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
