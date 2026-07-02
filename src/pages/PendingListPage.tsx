import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import { TabBar } from '../components/pending/TabBar';
import { OrderCard } from '../components/pending/OrderCard';

import { useWorkOrder } from '../context/WorkOrderContext';
import { generateNewOrder, generateOrderId } from '../data/mockData';
import type { WorkOrder } from '../types/workOrder';

const DEMO_ROOM = '0314';
const DEMO_GUEST = 'David';
const DEMO_0314_FIRED_KEY = 'hotel-0314-demo-fired';

export function PendingListPage() {
  const { state, dispatch, showToast } = useWorkOrder();
  const [forceTick, setForceTick] = useState(0);

  const filteredOrders = state.orders.filter((o) => {
    if (o.status === 'completed') return false;
    return o.type === state.activeTab;
  });

  // Refresh every 60s to update URGENT status
  useEffect(() => {
    const interval = setInterval(() => setForceTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Demo: when switching to Cleaning tab, auto-inject Room 0314 order (once per session)
  useEffect(() => {
    if (state.activeTab !== 'cleaning') return;

    // sessionStorage guard — survives React 18 Strict Mode double-mount
    if (sessionStorage.getItem(DEMO_0314_FIRED_KEY)) return;

    // Check if Room 0314 already has a pending cleaning order
    const exists = state.orders.some(
      (o) => o.roomNumber === DEMO_ROOM && o.type === 'cleaning' && o.status !== 'completed'
    );
    if (exists) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      const newOrder: WorkOrder = {
        id: generateOrderId(),
        type: 'cleaning',
        roomNumber: DEMO_ROOM,
        guestName: DEMO_GUEST,
        isInRoom: true,
        description: 'Standard room cleaning - guest request',
        specialNotes: 'Guest is waiting in the room',
        orderedAt: new Date(now).toISOString(),
        scheduledAt: new Date(now + 30 * 60000).toISOString(),
        status: 'pending',
      };
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      sessionStorage.setItem(DEMO_0314_FIRED_KEY, '1');
      showToast(`New cleaning request from Room ${DEMO_ROOM}`, 'success');
    }, 600);

    return () => clearTimeout(timer);
  }, [state.activeTab, state.orders, dispatch, showToast]);

  // Simulate new order every 30s in demo mode (only when on Delivery tab)
  useEffect(() => {
    if (state.activeTab === 'cleaning') return;

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
  }, [state.activeTab, state.orders, dispatch, showToast]);

  return (
    <div data-force-tick={forceTick} className="h-full flex flex-col bg-gradient-to-b from-sky-50/50 to-white">
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
