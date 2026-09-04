import React, { Component } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import Header from './components/Header';
import VivaShowcase from './components/VivaShowcase';
import StudentView from './components/StudentView';
import KitchenDashboard from './components/KitchenDashboard';
import DemandForecast from './components/DemandForecast';
import WalkInNLPModal from './components/WalkInNLPModal';
import NotificationModal from './components/NotificationModal';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="text-3xl">🍛</div>
            <h2 className="text-lg font-bold text-white">Smart Canteen System</h2>
            <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-3 rounded-lg border border-rose-900/40 text-left overflow-auto max-h-32">
              {this.state.error?.message || 'A render error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
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

function MainContent() {
  const { activeView } = useCanteen();

  return (
    <main className="flex-1 pb-16">
      {activeView === 'viva' && <VivaShowcase />}
      {activeView === 'student' && <StudentView />}
      {activeView === 'kitchen' && <KitchenDashboard />}
      {activeView === 'forecast' && <DemandForecast />}
      {activeView === 'nlp' && <WalkInNLPModal />}
      <NotificationModal />
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CanteenProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Header />
          <MainContent />
          <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
            Smart Canteen Pre-Order System • College Queue-Management Project Prototype • React + Tailwind + Express
          </footer>
        </div>
      </CanteenProvider>
    </ErrorBoundary>
  );
}
