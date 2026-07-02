import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, TrendingUp, Clock, User } from 'lucide-react';
import { useWorkOrder } from '../context/WorkOrderContext';

export function HistoryPage() {
  const { state } = useWorkOrder();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'delivery' | 'cleaning'>('all');

  const completedOrders = useMemo(() => {
    return state.orders
      .filter((o) => o.status === 'completed')
      .filter((o) => {
        if (filter !== 'all') return o.type === filter;
        return true;
      })
      .filter((o) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          o.roomNumber.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.operator?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [state.orders, search, filter]);

  const todayCount = state.orders.filter((o) => {
    if (o.status !== 'completed' || !o.completedAt) return false;
    const today = new Date().toDateString();
    return new Date(o.completedAt).toDateString() === today;
  }).length;

  const avgMinutes = useMemo(() => {
    const times = completedOrders
      .filter((o) => o.orderedAt && o.completedAt)
      .map((o) => (new Date(o.completedAt!).getTime() - new Date(o.orderedAt).getTime()) / 60000);
    if (times.length === 0) return '--';
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    if (avg < 60) return `${avg}m`;
    return `${Math.floor(avg / 60)}h ${avg % 60}m`;
  }, [completedOrders]);

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
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-50/50 to-white">
      {/* Search */}
      <div className="pt-14 px-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room or order ID..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-4 pb-3 flex gap-2">
        {(['all', 'delivery', 'cleaning'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-2xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-3xl p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sky-500 mb-1">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-xl font-black text-slate-800">{todayCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Today</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <TrendingUp size={16} />
            </div>
            <p className="text-xl font-black text-slate-800">{completedOrders.length}</p>
            <p className="text-[10px] text-slate-400 font-medium">Total Done</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Clock size={16} />
            </div>
            <p className="text-xl font-black text-slate-800">{avgMinutes}</p>
            <p className="text-[10px] text-slate-400 font-medium">Avg Time</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {completedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No completed orders yet</p>
            <p className="text-xs text-slate-400 mt-1">Completed orders will appear here</p>
          </div>
        )}

        {completedOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card rounded-2xl p-4 mb-3 flex items-center gap-3"
          >
            {/* Check Icon */}
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-slate-800">Room {order.roomNumber}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  order.type === 'delivery'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-sky-50 text-sky-600'
                }`}>
                  {order.type === 'delivery' ? 'Delivery' : 'Cleaning'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{order.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <User size={10} /> {order.operator || 'Unknown'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {order.completedAt ? formatTime(order.completedAt) : ''}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
