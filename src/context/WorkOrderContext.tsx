import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { WorkOrder, AppState, AppView, ToastMessage } from '../types/workOrder';
import { generateMockOrders, MOCK_OPERATORS, generateNewOrder } from '../data/mockData';

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

function loadFromStorage(): Partial<AppState> {
  try {
    const orders = localStorage.getItem(STORAGE_KEY);
    const operator = localStorage.getItem(OPERATOR_KEY);
    return {
      orders: orders ? JSON.parse(orders) : undefined,
      operator: operator || 'Alex',
    };
  } catch {
    return { orders: undefined, operator: 'Alex' };
  }
}

function saveToStorage(orders: WorkOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
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
      saveToStorage(newOrders);
      return { ...state, orders: newOrders };
    }
    case 'SET_OPERATOR': {
      localStorage.setItem(OPERATOR_KEY, action.payload);
      return { ...state, operator: action.payload };
    }
    case 'ADD_ORDER': {
      const newOrders = [action.payload, ...state.orders];
      saveToStorage(newOrders);
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
  const stored = loadFromStorage();
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    orders: stored.orders || generateMockOrders(),
    operator: stored.operator || 'Alex',
  });

  useEffect(() => {
    if (stored.orders === null) {
      saveToStorage(state.orders);
    }
  }, []);

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
