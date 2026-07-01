import { motion } from 'framer-motion';
import { Package, Sparkles, Clock, AlertCircle, Calendar } from 'lucide-react';
import { InRoomBadge } from '../common/InRoomBadge';
import { useWorkOrder } from '../../context/WorkOrderContext';
import { isUrgent, formatTimeShort } from '../../utils/orderUtils';

interface OrderCardProps {
  order: {
    id: string;
    type: 'delivery' | 'cleaning';
    roomNumber: string;
    guestName: string;
    isInRoom: boolean;
    description: string;
    orderedAt: string;
    scheduledAt?: string;
    status: string;
  };
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMin = Math.floor((now.getTime() - past.getTime()) / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function OrderCard({ order }: OrderCardProps) {
  const { dispatch } = useWorkOrder();
  const isDelivery = order.type === 'delivery';
  const urgent = isUrgent(order);

  const handleClick = () => {
    dispatch({ type: 'SET_VIEW', payload: { view: 'detail', orderId: order.id } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`relative rounded-3xl p-4 mb-3 cursor-pointer transition-all hover:shadow-xl active:scale-[0.99] ${
        urgent
          ? 'bg-white border-l-4 border-red-500 shadow-md shadow-red-500/10 urgent-pulse'
          : 'bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-sky-500/10'
      }`}
      style={{
        boxShadow: urgent ? '0 4px 20px rgba(239, 68, 68, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Row: Room Number + InRoom Badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800">Room {order.roomNumber}</span>
          {urgent && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase">Urgent</span>
            </span>
          )}
        </div>
        <InRoomBadge isInRoom={order.isInRoom} orderType={order.type} />
      </div>

      {/* Type & Description */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-2xl ${isDelivery ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
          {isDelivery ? <Package size={18} /> : <Sparkles size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">{isDelivery ? 'Delivery Request' : 'Cleaning Request'}</p>
          <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{order.description}</p>
        </div>
      </div>

      {/* Bottom Row: Time + Guest */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={13} />
          <span className="text-xs">{timeAgo(order.orderedAt)}</span>
          {/* Cleaning: show expected time */}
          {!isDelivery && order.scheduledAt && (
            <span className={`ml-2 flex items-center gap-1 ${urgent ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
              <Calendar size={12} />
              <span className="text-xs">Exp: {formatTimeShort(order.scheduledAt)}</span>
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">Guest: {order.guestName.split(' ')[0]}</span>
      </div>
    </motion.div>
  );
}
