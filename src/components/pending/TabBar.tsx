import { Package, Sparkles } from 'lucide-react';
import { useWorkOrder } from '../../context/WorkOrderContext';

export function TabBar() {
  const { state, dispatch } = useWorkOrder();

  const tabs = [
    {
      id: 'delivery' as const,
      label: 'Delivery',
      icon: Package,
      count: state.orders.filter((o) => o.type === 'delivery' && o.status !== 'completed').length,
    },
    {
      id: 'cleaning' as const,
      label: 'Cleaning',
      icon: Sparkles,
      count: state.orders.filter((o) => o.type === 'cleaning' && o.status !== 'completed').length,
    },
  ];

  return (
    <div className="flex gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-semibold text-sm transition-all ${
              isActive
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Icon size={16} fill={isActive ? 'white' : 'none'} />
            <span>{tab.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
