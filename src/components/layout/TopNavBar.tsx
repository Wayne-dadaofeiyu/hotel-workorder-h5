import { Bell, ChevronDown } from 'lucide-react';
import { useWorkOrder } from '../../context/WorkOrderContext';

export function TopNavBar() {
  const { state } = useWorkOrder();
  const pendingCount = state.orders.filter((o) => o.status !== 'completed').length;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-sky-500 to-blue-600 text-white safe-top">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold tracking-tight">Work Orders</h1>
          <p className="text-[10px] text-sky-100 -mt-0.5">Hotel Staff Panel</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-1.5">
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          {/* Operator */}
          <button className="flex items-center gap-1.5 bg-white/20 rounded-2xl px-3 py-1.5 backdrop-blur-sm">
            <span className="text-sm font-semibold">{state.operator}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
