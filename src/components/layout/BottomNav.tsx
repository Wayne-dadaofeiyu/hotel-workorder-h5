import { Clock, Home } from 'lucide-react';
import { useWorkOrder } from '../../context/WorkOrderContext';

export function BottomNav() {
  const { state, dispatch } = useWorkOrder();

  const tabs = [
    { id: 'pending', label: 'Orders', icon: Home },
    { id: 'history', label: 'History', icon: Clock },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = state.currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: tab.id as 'pending' | 'history' } })}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all relative ${
                isActive ? 'text-sky-500' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-sky-500 rounded-full -mb-3.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
