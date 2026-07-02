export type OrderType = 'delivery' | 'cleaning';

export type OrderStatus = 'pending' | 'completed';

export interface WorkOrder {
  id: string;
  type: OrderType;
  roomNumber: string;
  guestName: string;
  isInRoom: boolean;
  description: string;
  specialNotes?: string;
  orderedAt: string;
  scheduledAt?: string;
  status: OrderStatus;
  operator?: string;
  completedAt?: string;
}

export interface Operator {
  id: string;
  name: string;
  avatar: string;
}

export type AppView = 'pending' | 'detail' | 'history';

export interface AppState {
  orders: WorkOrder[];
  currentView: AppView;
  selectedOrderId: string | null;
  activeTab: OrderType | 'all';
  operator: string;
  toast: ToastMessage | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}
