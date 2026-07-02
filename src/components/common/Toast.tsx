import { motion, AnimatePresence } from 'framer-motion';
import { useWorkOrder } from '../../context/WorkOrderContext';
import { X } from 'lucide-react';

export function Toast() {
  const { state, dispatch } = useWorkOrder();
  const { toast } = state;

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-sky-500';
    }
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 ${getBgColor(toast.type)} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%] cursor-pointer`}
          onClick={() => dispatch({ type: 'HIDE_TOAST' })}
        >
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <X size={16} className="opacity-70" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
