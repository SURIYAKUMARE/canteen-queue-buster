import React from 'react';
import StudentHome from './StudentHome';
import StudentMenu from './StudentMenu';
import StudentOrders from './StudentOrders';
import StudentQRView from './StudentQRView';
import StudentProfile from './StudentProfile';
import StudentBottomNav from './StudentBottomNav';
import VendorDashboard from './VendorDashboard';
import VendorOrders from './VendorOrders';
import VendorQRScanner from './VendorQRScanner';
import VendorMenuManager from './VendorMenuManager';
import VendorProfile from './VendorProfile';
import VendorBottomNav from './VendorBottomNav';
import { useCampus } from '../context/CampusContext';
import { GraduationCap, ChefHat, Sparkles, ArrowLeft } from 'lucide-react';

export default function SplitScreenDemo({ onBack }) {
  const { studentTab, vendorTab } = useCampus();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Demo Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        {onBack && (
          <button
            onClick={onBack}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Demo</span>
          </button>
        )}

        <div className="text-center flex-1 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-3 py-0.5 rounded-full text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIDE-BY-SIDE HACKATHON & VIVA DEMONSTRATION MODE</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white">
            Real-Time Student Pre-Order & Vendor QR Verification
          </h2>
          <p className="text-xs text-slate-400">
            Order on Student phone (left) $\rightarrow$ updates live on Vendor console (right) $\rightarrow$ scan QR and deliver!
          </p>
        </div>
      </div>


      {/* Dual Phone Frame Containers */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Student Mobile View */}
        <div className="bg-slate-950 border-4 border-slate-800 rounded-[2.8rem] shadow-2xl p-4 sm:p-5 relative min-h-[780px] flex flex-col justify-between overflow-hidden">
          {/* Phone Top Notch */}
          <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-orange-400" />
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">STUDENT APP</span>
            </div>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-mono font-bold">
              Tab: {studentTab.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {studentTab === 'home' && <StudentHome />}
            {studentTab === 'menu' && <StudentMenu />}
            {studentTab === 'orders' && <StudentOrders />}
            {studentTab === 'qr' && <StudentQRView />}
            {studentTab === 'profile' && <StudentProfile />}
          </div>

          <div className="relative pt-12">
            <StudentBottomNav />
          </div>
        </div>

        {/* Right: Vendor Mobile View */}
        <div className="bg-slate-950 border-4 border-slate-800 rounded-[2.8rem] shadow-2xl p-4 sm:p-5 relative min-h-[780px] flex flex-col justify-between overflow-hidden">
          {/* Phone Top Notch */}
          <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-orange-400" />
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">CANTEEN VENDOR CONSOLE</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold">
              Tab: {vendorTab.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {vendorTab === 'dashboard' && <VendorDashboard />}
            {vendorTab === 'orders' && <VendorOrders />}
            {vendorTab === 'scan' && <VendorQRScanner />}
            {vendorTab === 'menu' && <VendorMenuManager />}
            {vendorTab === 'profile' && <VendorProfile />}
          </div>

          <div className="relative pt-12">
            <VendorBottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
