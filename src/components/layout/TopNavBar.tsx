import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Key, Users, LogOut, Check } from 'lucide-react';
import { useWorkOrder } from '../../context/WorkOrderContext';
import { MOCK_OPERATORS } from '../../data/mockData';

export function TopNavBar() {
  const { state, dispatch, showToast } = useWorkOrder();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleChangePassword = () => {
    setDropdownOpen(false);
  };

  const handleSwitchAccount = () => {
    setDropdownOpen(false);
    setSwitchOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('hotel-operator');
    window.location.reload();
  };

  const handleSelectOperator = (name: string) => {
    dispatch({ type: 'SET_OPERATOR', payload: name });
    setSwitchOpen(false);
    showToast(`Switched to ${name}`, 'success');
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-sky-500 to-blue-600 text-white safe-top">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
          {/* Title */}
          <div>
            <h1 className="text-lg font-bold tracking-tight">Work Orders</h1>
            <p className="text-[10px] text-sky-100 -mt-0.5">Hotel Staff Panel</p>
          </div>

          {/* Operator + Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 bg-white/20 rounded-2xl px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="text-sm font-semibold">{state.operator}</span>
              <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    <Key size={15} className="text-slate-400" />
                    Change Password
                  </button>
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    <Users size={15} className="text-slate-400" />
                    Switch Account
                  </button>
                  <div className="h-px bg-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Switch Account Modal */}
      <AnimatePresence>
        {switchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
            onClick={() => setSwitchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">Switch Account</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select an account to log in</p>
              </div>

              <div className="py-1 max-h-64 overflow-y-auto">
                {MOCK_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => handleSelectOperator(op.name)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors
                      ${op.name === state.operator
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-xl">{op.avatar}</span>
                    <span className="font-medium">{op.name}</span>
                    {op.name === state.operator && (
                      <Check size={16} className="ml-auto text-sky-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-slate-100">
                <button
                  onClick={() => setSwitchOpen(false)}
                  className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
