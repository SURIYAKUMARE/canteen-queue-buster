import React, { Component } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import TopBar from './components/TopBar';
import StudentHome from './components/StudentHome';
import StudentMenu from './components/StudentMenu';
import StudentOrders from './components/StudentOrders';
import StudentQRView from './components/StudentQRView';
import StudentProfile from './components/StudentProfile';
import StudentBottomNav from './components/StudentBottomNav';
import VendorDashboard from './components/VendorDashboard';
import VendorOrders from './components/VendorOrders';
import VendorQRScanner from './components/VendorQRScanner';
import VendorMenuManager from './components/VendorMenuManager';
import VendorProfile from './components/VendorProfile';
import VendorBottomNav from './components/VendorBottomNav';
import FoodDetailModal from './components/FoodDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import LiveOrderVendorModal from './components/LiveOrderVendorModal';
import NotificationToaster from './components/NotificationToaster';
import SplitScreenDemo from './components/SplitScreenDemo';
import RoleSelectLogin from './components/RoleSelectLogin';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CampusBite ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="text-3xl">🍛</div>
            <h2 className="text-lg font-bold text-white">CampusBite – Smart College Canteen</h2>
            <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-3 rounded-xl border border-rose-900/40 text-left overflow-auto max-h-32">
              {this.state.error?.message || 'A render error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainView() {
  const { activeRole, studentTab, vendorTab, currentUser, openAuthModal } = useCampus();

  if (!currentUser) {
    return <RoleSelectLogin />;
  }

  if (activeRole === 'split') {
    return <SplitScreenDemo />;
  }

  if (activeRole === 'vendor') {
    return (
      <div className="flex-1 w-full max-w-lg mx-auto py-4">
        {vendorTab === 'dashboard' && <VendorDashboard />}
        {vendorTab === 'orders' && <VendorOrders />}
        {vendorTab === 'scan' && <VendorQRScanner />}
        {vendorTab === 'menu' && <VendorMenuManager />}
        {vendorTab === 'profile' && <VendorProfile />}
        <VendorBottomNav />
      </div>
    );
  }

  // Student Role (Default)
  return (
    <div className="flex-1 w-full max-w-lg mx-auto py-4">
      {studentTab === 'home' && <StudentHome />}
      {studentTab === 'menu' && <StudentMenu />}
      {studentTab === 'orders' && <StudentOrders />}
      {studentTab === 'qr' && <StudentQRView />}
      {studentTab === 'profile' && <StudentProfile />}
      <StudentBottomNav />
    </div>
  );
}

function AppModals() {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    pendingCheckoutOrder,
    handlePaymentCompleted,
    authModalOpen,
    setAuthModalOpen,
    authModalInitialRole,
    supabaseConfigModalOpen,
    setSupabaseConfigModalOpen
  } = useCampus();

  return (
    <>
      <FoodDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        pendingOrder={pendingCheckoutOrder}
        onPaymentSuccess={handlePaymentCompleted}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalInitialRole}
      />
      <SupabaseConfigModal
        isOpen={supabaseConfigModalOpen}
        onClose={() => setSupabaseConfigModalOpen(false)}
      />
      <OrderSuccessModal />
      <LiveOrderVendorModal />
      <NotificationToaster />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CampusProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500 selection:text-slate-950">
          <TopBar />
          <MainView />
          <AppModals />
        </div>
      </CampusProvider>
    </ErrorBoundary>
  );
}
