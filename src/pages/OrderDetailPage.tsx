import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Package, Sparkles, User, Calendar } from 'lucide-react';
import { useWorkOrder } from '../context/WorkOrderContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { InRoomBadge } from '../components/common/InRoomBadge';
import { isUrgent, formatTimeFull } from '../utils/orderUtils';

export function OrderDetailPage() {
  const { state, dispatch, completeOrder } = useWorkOrder();
  const [showConfirm, setShowConfirm] = useState(false);

  const order = state.orders.find((o) => o.id === state.selectedOrderId);

  if (!order) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-slate-400">Order not found</p>
      </div>
    );
  }

  const isDelivery = order.type === 'delivery';
  const isCompleted = order.status === 'completed';

  const handleComplete = () => {
    completeOrder(order.id);
    dispatch({ type: 'SET_VIEW', payload: { view: 'pending' } });
    setShowConfirm(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-50/30 to-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-100 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'pending' } })}
            className="p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={22} className="text-slate-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">Order Detail</h2>
            <p className="text-[10px] text-slate-400 font-mono">{order.id}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 px-4">
        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-6"
        >
          <div className="flex items-center justify-center gap-0">
            {/* Created */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 mt-1.5">Created</span>
            </div>
            {/* Line */}
            <div className={`h-1 flex-1 mx-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            {/* In Progress / Completed */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-emerald-500' : 'bg-sky-500 animate-pulse'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-white" />
                ) : (
                  <Clock size={20} className="text-white" />
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-1.5 ${
                isCompleted ? 'text-emerald-600' : 'text-sky-500'
              }`}>
                {isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Guest Info Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-5 mb-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Room Number</p>
              <p className="text-5xl font-black text-slate-800 leading-none mt-1">{order.roomNumber}</p>
            </div>
            <InRoomBadge isInRoom={order.isInRoom} orderType={order.type} className="mt-2" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User size={14} />
            <span>Guest: <span className="font-medium text-slate-700">{order.guestName}</span></span>
          </div>
        </motion.div>

        {/* Request Details Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-2xl ${isDelivery ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
              {isDelivery ? <Package size={18} /> : <Sparkles size={18} />}
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {isDelivery ? 'Delivery Request' : 'Cleaning Request'}
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{order.description}</p>
          {order.specialNotes && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Special Notes</p>
              <p className="text-xs text-amber-600">{order.specialNotes}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <Calendar size={12} />
            <span>Ordered: {formatTime(order.orderedAt)}</span>
          </div>
          {/* Expected Cleaning Time (Cleaning only) */}
          {!isDelivery && order.scheduledAt && (
            <div className={`flex items-center gap-2 mt-2 text-xs ${isUrgent(order) ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
              <Calendar size={12} />
              <span>Expected: {formatTimeFull(order.scheduledAt)}</span>
            </div>
          )}
        </motion.div>

        {/* Completion Info */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-5 mb-4 border-l-4 border-emerald-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-emerald-700">Completed</h3>
            </div>
            <p className="text-xs text-slate-500">Operator: <span className="font-semibold text-slate-700">{order.operator}</span></p>
            {order.completedAt && (
              <p className="text-xs text-slate-400 mt-0.5">At: {formatTime(order.completedAt)}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Action Button */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 safe-bottom">
          <div className="max-w-md mx-auto p-4">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-sky-500/25 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 size={20} />
              {isDelivery ? 'Mark as Delivered' : 'Mark as Cleaned'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title={`Confirm ${isDelivery ? 'Delivery' : 'Cleaning'}`}
        description={`Mark order ${order.id} as ${isDelivery ? 'delivered' : 'cleaned'}?`}
        confirmText={isDelivery ? 'Delivered' : 'Cleaned'}
        onConfirm={handleComplete}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
}
