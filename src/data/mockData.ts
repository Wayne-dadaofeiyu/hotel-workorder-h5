import { WorkOrder, Operator } from '../types/workOrder';

let orderCounter = 1000;

export function generateOrderId(): string {
  orderCounter++;
  return `WO-2024-${orderCounter}`;
}

function minutesFromNow(min: number): string {
  return new Date(Date.now() + min * 60000).toISOString();
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60000).toISOString();
}

export function generateMockOrders(): WorkOrder[] {
  return [
    // ============================================================
    //  Delivery orders (6 total)
    //  URGENT: orderedAt > 15 min → #5 (26 min), #6 (36 min)
    //  Normal: #1-#4 within 15 min
    // ============================================================
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '1208',
      guestName: 'James Wilson',
      isInRoom: true,
      description: 'Extra towels (4) and 2 soft pillows',
      specialNotes: 'Guest prefers white towels, please deliver to door if no answer',
      orderedAt: minutesAgo(3),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '1512',
      guestName: 'Robert Chen',
      isInRoom: true,
      description: 'Room service menu and wine glass set',
      specialNotes: 'Guest requested red wine glasses specifically',
      orderedAt: minutesAgo(7),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '2003',
      guestName: 'David Kim',
      isInRoom: false,
      description: 'Iron and ironing board',
      specialNotes: 'Guest will return later, please leave at front desk',
      orderedAt: minutesAgo(9),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '0618',
      guestName: 'Emma Thompson',
      isInRoom: true,
      description: 'Extra blanket and hot water kettle',
      orderedAt: minutesAgo(13),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '1107',
      guestName: 'Lisa Wang',
      isInRoom: true,
      description: 'Toiletries set - toothbrush, toothpaste, shampoo',
      orderedAt: minutesAgo(26),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: '0815',
      guestName: 'Priya Patel',
      isInRoom: false,
      description: 'Late night snack menu and water bottles (6)',
      orderedAt: minutesAgo(36),
      status: 'pending',
    },

    // ============================================================
    //  Cleaning orders (6 total)
    //  URGENT: scheduledAt within 30 min → #5 (26 min ordered, 15 min to scheduled)
    //                                            #6 (36 min ordered, 10 min to scheduled)
    //  Normal: #1-#4 scheduled well ahead
    // ============================================================
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '0905',
      guestName: 'Maria Garcia',
      isInRoom: false,
      description: 'Deep cleaning required - guest checked out',
      specialNotes: 'Please change all linens and sanitize bathroom thoroughly',
      orderedAt: minutesAgo(4),
      scheduledAt: minutesFromNow(90),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '1710',
      guestName: 'Sarah Johnson',
      isInRoom: true,
      description: 'Towel refresh and bed making',
      orderedAt: minutesAgo(8),
      scheduledAt: minutesFromNow(120),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '1302',
      guestName: 'Michael Brown',
      isInRoom: false,
      description: 'Standard room cleaning',
      specialNotes: 'Guest has allergy - use hypoallergenic cleaner only',
      orderedAt: minutesAgo(11),
      scheduledAt: minutesFromNow(60),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '2201',
      guestName: 'Anna Lee',
      isInRoom: false,
      description: 'Bathroom deep clean only',
      orderedAt: minutesAgo(14),
      scheduledAt: minutesFromNow(75),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '1005',
      guestName: 'John Anderson',
      isInRoom: true,
      description: 'Full room cleaning and linen change',
      specialNotes: 'Please clean balcony as well, guest is working from room',
      orderedAt: minutesAgo(26),
      scheduledAt: minutesFromNow(15),
      status: 'pending',
    },
    {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: '2108',
      guestName: 'Tom Davis',
      isInRoom: false,
      description: 'Quick tidy up before next guest arrives',
      orderedAt: minutesAgo(36),
      scheduledAt: minutesFromNow(10),
      status: 'pending',
    },
  ];
}

export const MOCK_OPERATORS: Operator[] = [
  { id: 'op1', name: 'Alex', avatar: '👨‍💼' },
  { id: 'op2', name: 'Sam', avatar: '👩‍💼' },
  { id: 'op3', name: 'Jordan', avatar: '🧑‍💼' },
  { id: 'op4', name: 'Taylor', avatar: '👨‍🔧' },
  { id: 'op5', name: 'Casey', avatar: '👩‍🔧' },
];

export function generateNewOrder(): WorkOrder {
  const deliveryItems = [
    'Extra towels and toiletries',
    'Coffee maker and coffee pods',
    'Extra pillows and blanket',
    'Mini fridge restocking',
    'Laundry bag and detergent',
    'Room service menu and cutlery',
  ];

  const cleaningItems = [
    'Standard room cleaning',
    'Deep cleaning and sanitization',
    'Towel and linen refresh',
    'Bathroom deep clean',
    'Bed making and linen change',
  ];

  const rooms = ['0408', '0512', '0709', '1003', '1415', '1608', '1812', '2105'];
  const guestNames = ['Chris Lee', 'Anna Smith', 'Tom Davis', 'Lucy Liu', 'Mark Taylor', 'Nina Patel'];

  const isDelivery = Math.random() > 0.4;
  const type = isDelivery ? 'delivery' as const : 'cleaning' as const;

  const now = new Date();

  return {
    id: generateOrderId(),
    type,
    roomNumber: rooms[Math.floor(Math.random() * rooms.length)],
    guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
    isInRoom: Math.random() > 0.5,
    description: isDelivery
      ? deliveryItems[Math.floor(Math.random() * deliveryItems.length)]
      : cleaningItems[Math.floor(Math.random() * cleaningItems.length)],
    orderedAt: now.toISOString(),
    scheduledAt: isDelivery ? undefined : (() => {
      const scheduled = new Date(now.getTime() + (1 + Math.random() * 3) * 3600000);
      return scheduled.toISOString();
    })(),
    status: 'pending',
  };
}
