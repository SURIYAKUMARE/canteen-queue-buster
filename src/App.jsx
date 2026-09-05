import React, { Component } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import TopBar from './components/TopBar';
import StartScreen from './components/StartScreen';
import StudentLogin from './components/StudentLogin';
import VendorLogin from './components/VendorLogin';
import AdminPortal from './components/AdminPortal';
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
import { ToastProvider } from './components/ui/ToastContext';


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
  const { 
    activeRole, 
    studentTab, 
    vendorTab, 
    currentUser, 
    authFlow, 
    setAuthFlow, 
    handleLogout 
  } = useCampus();

  // If no user is logged in, show isolated start or login screens
  if (!currentUser) {
    if (authFlow === 'student_login') {
      return <StudentLogin onBack={() => setAuthFlow('start')} />;
    }
    if (authFlow === 'vendor_login') {
      return <VendorLogin onBack={() => setAuthFlow('start')} />;
    }
    if (authFlow === 'admin_portal') {
      return <AdminPortal onBack={() => setAuthFlow('start')} />;
    }
    if (authFlow === 'split_demo') {
      return <SplitScreenDemo onBack={() => setAuthFlow('start')} />;
    }
    return <StartScreen onSelectRole={(role) => setAuthFlow(role)} />;
  }


  // System Owner / Admin Portal
  if (currentUser?.profile?.role === 'admin') {
    return <AdminPortal onBack={handleLogout} />;
  }

  // Vendor Application (Strictly Isolated)
  if (activeRole === 'vendor' || currentUser?.profile?.role === 'vendor') {
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

  // Student Application (Strictly Isolated)
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
    currentUser,
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
      {currentUser && <NotificationToaster />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CampusProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500 selection:text-slate-950">
            <TopBar />
            <MainView />
            <AppModals />
          </div>
        </CampusProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

