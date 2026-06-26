import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useWorkOrder } from '../../context/WorkOrderContext';
import { MOCK_OPERATORS } from '../../data/mockData';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ isOpen, title, description, confirmText, onConfirm, onClose }: ConfirmModalProps) {
  const { state, dispatch } = useWorkOrder();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-4 pb-8 safe-bottom"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-6">{description}</p>

            {/* Operator Selector */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Operator</p>
              <div className="flex gap-2 flex-wrap">
                {MOCK_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => dispatch({ type: 'SET_OPERATOR', payload: op.name })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all ${
                      state.operator === op.name
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span>{op.avatar}</span>
                    <span className="text-sm font-medium">{op.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/25 transition-all"
              >
                <Check size={18} />
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
