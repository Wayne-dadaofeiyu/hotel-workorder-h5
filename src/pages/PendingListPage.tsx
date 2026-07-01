import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, BellPlus } from 'lucide-react';
import { TabBar } from '../components/pending/TabBar';
import { OrderCard } from '../components/pending/OrderCard';
import { useWorkOrder } from '../context/WorkOrderContext';
import { generateNewOrder } from '../data/mockData';

export function PendingListPage() {
  const { state, dispatch, showToast } = useWorkOrder();
  const [isSimulating, setIsSimulating] = useState(false);
  const [tick, setTick] = useState(0);

  const filteredOrders = state.orders.filter((o) => {
    if (o.status === 'completed') return false;
    return o.type === state.activeTab;
  });

  // Refresh every 60s to update URGENT status
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new order every 30s in demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newOrder = generateNewOrder(state.orders);
        if (newOrder) {
          dispatch({ type: 'ADD_ORDER', payload: newOrder });
          showToast(
            `New ${newOrder.type} request from Room ${newOrder.roomNumber}`,
            'info'
          );
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, showToast]);

  const handleSimulateOrder = () => {
    setIsSimulating(true);
    const newOrder = generateNewOrder(state.orders);
    if (newOrder) {
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      showToast(
        `New ${newOrder.type} request from Room ${newOrder.roomNumber}`,
        'info'
      );
    }
    setTimeout(() => setIsSimulating(false), 1000);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-50/50 to-white">
      {/* Tab Bar */}
      <div className="pt-14">
        <TabBar />
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Header with count */}
        <div className="flex items-center justify-between py-3">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-700">{filteredOrders.length}</span> pending orders
          </p>
          <button
            onClick={handleSimulateOrder}
            disabled={isSimulating}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-500 bg-sky-50 px-3 py-1.5 rounded-2xl hover:bg-sky-100 transition-colors disabled:opacity-50"
          >
            <BellPlus size={13} />
            Simulate New Order
          </button>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-700">All caught up!</p>
            <p className="text-sm text-slate-400 mt-1">No pending {state.activeTab} orders</p>
          </motion.div>
        )}

        {/* Order Cards */}
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
