import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { WorkOrder, AppState, AppView, ToastMessage } from '../types/workOrder';
import { generateMockOrders, MOCK_OPERATORS } from '../data/mockData';

const STORAGE_KEY = 'hotel-workorders';
const OPERATOR_KEY = 'hotel-operator';

type Action =
  | { type: 'SET_ORDERS'; payload: WorkOrder[] }
  | { type: 'SET_VIEW'; payload: { view: AppView; orderId?: string | null } }
  | { type: 'SET_TAB'; payload: 'delivery' | 'cleaning' | 'all' }
  | { type: 'COMPLETE_ORDER'; payload: { orderId: string; operator: string } }
  | { type: 'SET_OPERATOR'; payload: string }
  | { type: 'ADD_ORDER'; payload: WorkOrder }
  | { type: 'SHOW_TOAST'; payload: ToastMessage }
  | { type: 'HIDE_TOAST' };

function loadOperatorFromStorage(): string {
  try {
    return localStorage.getItem(OPERATOR_KEY) || 'Alex';
  } catch {
    return 'Alex';
  }
}

const initialState: AppState = {
  orders: [],
  currentView: 'pending',
  selectedOrderId: null,
  activeTab: 'delivery',
  operator: 'Alex',
  toast: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload.view,
        selectedOrderId: action.payload.orderId ?? null,
      };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'COMPLETE_ORDER': {
      const newOrders = state.orders.map((o) =>
        o.id === action.payload.orderId
          ? { ...o, status: 'completed' as const, operator: action.payload.operator, completedAt: new Date().toISOString() }
          : o
      );
      return { ...state, orders: newOrders };
    }
    case 'SET_OPERATOR': {
      localStorage.setItem(OPERATOR_KEY, action.payload);
      return { ...state, operator: action.payload };
    }
    case 'ADD_ORDER': {
      const newOrders = [action.payload, ...state.orders];
      return { ...state, orders: newOrders };
    }
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

interface WorkOrderContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  completeOrder: (orderId: string) => void;
  addOrder: (order: WorkOrder) => void;
  showToast: (message: string, type: ToastMessage['type']) => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | null>(null);

export function WorkOrderProvider({ children }: { children: React.ReactNode }) {
  // 清除旧版本遗留的 localStorage 数据，避免累积旧订单
  localStorage.removeItem(STORAGE_KEY);

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    orders: generateMockOrders(),
    operator: loadOperatorFromStorage(),
  });

  const completeOrder = useCallback(
    (orderId: string) => {
      dispatch({ type: 'COMPLETE_ORDER', payload: { orderId, operator: state.operator } });
      showToast('Order completed successfully!', 'success');
    },
    [state.operator]
  );

  const addOrder = useCallback((order: WorkOrder) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString();
    dispatch({ type: 'SHOW_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  }, []);

  return (
    <WorkOrderContext.Provider value={{ state, dispatch, completeOrder, addOrder, showToast }}>
      {children}
    </WorkOrderContext.Provider>
  );
}

export function useWorkOrder() {
  const ctx = useContext(WorkOrderContext);
  if (!ctx) throw new Error('useWorkOrder must be used within WorkOrderProvider');
  return ctx;
}
