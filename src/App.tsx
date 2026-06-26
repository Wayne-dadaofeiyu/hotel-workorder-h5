import { useWorkOrder } from './context/WorkOrderContext';
import { WorkOrderProvider } from './context/WorkOrderContext';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomNav } from './components/layout/BottomNav';
import { Toast } from './components/common/Toast';
import { PendingListPage } from './pages/PendingListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { HistoryPage } from './pages/HistoryPage';

function AppContent() {
  const { state } = useWorkOrder();

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white relative overflow-hidden shadow-2xl">
      <TopNavBar />
      <Toast />
      
      {state.currentView === 'pending' && <PendingListPage />}
      {state.currentView === 'detail' && <OrderDetailPage />}
      {state.currentView === 'history' && <HistoryPage />}
      
      {state.currentView !== 'detail' && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <WorkOrderProvider>
      <AppContent />
    </WorkOrderProvider>
  );
}
