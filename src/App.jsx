import React from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import Header from './components/Header';
import VivaShowcase from './components/VivaShowcase';
import StudentView from './components/StudentView';
import KitchenDashboard from './components/KitchenDashboard';
import DemandForecast from './components/DemandForecast';
import WalkInNLPModal from './components/WalkInNLPModal';
import NotificationModal from './components/NotificationModal';

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
    <CanteenProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <Header />
        <MainContent />
        <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
          Smart Canteen Pre-Order System • College Queue-Management Project Prototype • React + Tailwind + Express
        </footer>
      </div>
    </CanteenProvider>
  );
}
