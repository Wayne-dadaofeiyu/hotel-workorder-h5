import { WorkOrder, Operator } from '../types/workOrder';

let orderCounter = 1000;

export function generateOrderId(): string {
  orderCounter++;
  return `WO-2024-${orderCounter}`;
}

// ============================================================
//  会话种子机制：同一 session 内数据保持一致，
//  不同人打开或新标签页打开则生成不同的随机数据。
// ============================================================
const SEED_KEY = 'hotel-demo-seed';

function getSessionSeed(): number {
  const stored = sessionStorage.getItem(SEED_KEY);
  if (stored) return parseInt(stored, 10);
  const seed = Math.floor(Math.random() * 1000000);
  sessionStorage.setItem(SEED_KEY, seed.toString());
  return seed;
}

/** 基于种子的伪随机数生成器（Lehmer / Park-Miller LCG） */
class SeededRandom {
  private s: number;
  constructor(seed: number) { this.s = seed | 0; }
  /** 返回 [0, 1) */
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  /** 返回 [min, max) 的整数 */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
  /** 从数组中随机选取一个元素 */
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length)];
  }
  /** 打乱数组（Fisher-Yates） */
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  /** 返回 true/false，概率为 prob */
  chance(prob: number): boolean {
    return this.next() < prob;
  }
}

// ============================================================
//  演示锚点时间
// ============================================================
const DEMO_START_KEY = 'hotel-demo-start-time';

function getDemoStartTime(): number {
  const stored = sessionStorage.getItem(DEMO_START_KEY);
  if (stored) return parseInt(stored, 10);
  const now = Date.now();
  sessionStorage.setItem(DEMO_START_KEY, now.toString());
  return now;
}

const DEMO_START = getDemoStartTime();

/** 基于锚点时间：N 分钟前 */
function minutesAgo(min: number): string {
  return new Date(DEMO_START - min * 60000).toISOString();
}

/** 基于锚点时间：N 分钟后 */
function minutesFromNow(min: number): string {
  return new Date(DEMO_START + min * 60000).toISOString();
}

// ============================================================
//  数据池（45 人名, 34 房间号, 20 送物描述, 20 打扫描述, 14 备注）
// ============================================================
const GUEST_NAMES = [
  'James Wilson', 'Robert Chen', 'David Kim', 'Emma Thompson', 'Lisa Wang',
  'Priya Patel', 'Maria Garcia', 'Sarah Johnson', 'Michael Brown', 'Anna Lee',
  'John Anderson', 'Tom Davis', 'Chris Baker', 'Sophie Martin', 'Oliver Clark',
  'Yuki Tanaka', 'Mohammed Ali', 'Hannah White', 'Daniel Park', 'Rachel Green',
  'Kevin Hart', 'Grace Kim', 'Oscar Silva', 'Iris Zhang', 'Leo Wang',
  'Julia Fischer', 'Marco Rossi', 'Aiko Sato', 'Frank Murphy', 'Catherine Bell',
  'Ryan Cooper', 'Amanda Lewis', 'Nina Ivanova', 'Pedro Santos', 'Emily Turner',
  'George Hill', 'Zoe Baker', 'Henry Wright', 'Clara Schmidt', 'Felix Weber',
  'Luna Chen', 'Raj Sharma', 'Mia Andersson', 'Thomas Grey', 'Sophia Cruz',
];

const ROOM_NUMBERS = [
  '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008',
  '1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108',
  '1250', '1251', '1252', '1253', '1254', '1255', '1256', '1257', '1258',
  '1350', '1351',
];

const DELIVERY_ITEMS = [
  'Extra towels (4) and 2 soft pillows',
  'Room service menu and wine glass set',
  'Iron and ironing board',
  'Extra blanket and hot water kettle',
  'Toiletries set - toothbrush, toothpaste, shampoo',
  'Late night snack menu and water bottles (6)',
  'Coffee maker and coffee pods',
  'Mini fridge restocking - drinks and snacks',
  'Laundry bag and detergent',
  'Slippers and bathrobe set',
  'Fruit basket and welcome drink',
  'Extension cord and power adapter',
  'Sewing kit and shoe shine',
  'Newspaper and magazine delivery',
  'Spa menu and reservation card',
  'Baby crib and extra bedding',
  'Gym towel and yoga mat',
  'Champagne bucket and glasses',
  'First aid kit and insect repellent',
  'Umbrella and raincoat set',
];

const CLEANING_ITEMS = [
  'Deep cleaning required - guest checked out',
  'Towel refresh and bed making',
  'Standard room cleaning',
  'Bathroom deep clean only',
  'Full room cleaning and linen change',
  'Quick tidy up before next guest arrives',
  'Floor vacuum and dusting',
  'Window cleaning and minibar restock',
  'Turndown service with chocolate',
  'Pet area deep sanitization',
  'Allergy-free deep clean (hypoallergenic)',
  'Post-party room restoration',
  'Linen change and mattress rotation',
  'Carpet steam cleaning',
  'Air purifier filter replacement',
  'Balcony and terrace cleaning',
  'Shoe polishing station setup',
  'Curtain and upholstery refresh',
  'Mold inspection and treatment',
  'Quarterly spring cleaning',
];

const SPECIAL_NOTES_POOL: (string | undefined)[] = [
  'Guest prefers white towels, please deliver to door if no answer',
  'Guest requested red wine glasses specifically',
  'Guest will return later, please leave at front desk',
  'Please change all linens and sanitize bathroom thoroughly',
  'Guest has allergy - use hypoallergenic cleaner only',
  'Please clean balcony as well, guest is working from room',
  'VIP guest - priority handling required',
  'Guest is celebrating anniversary - extra care please',
  'Knock twice and announce yourself loudly',
  'Do not disturb before 10 AM',
  'Guest speaks only French - use translation app',
  'Child in room - be extra quiet',
  undefined,
  undefined,
  undefined,
  undefined,
];


// ============================================================
//  随机生成 Mock 数据
//  规则：同一服务类型下，每个房号最多出现 1 次
// ============================================================

export function generateMockOrders(): WorkOrder[] {
  const seed = getSessionSeed();
  const rng = new SeededRandom(seed);

  const orders: WorkOrder[] = [];

  // --- 每个房间在每个服务类型下最多 1 条 ---
  const deliveryCount = rng.int(3, 7);  // 3~6 条送物
  const cleaningCount = rng.int(3, 7);  // 3~6 条打扫

  // 送物：从打乱的房间池中取不重复的房间
  const deliveryRooms = rng.shuffle([...ROOM_NUMBERS]).slice(0, deliveryCount);
  for (const room of deliveryRooms) {
    const ago = rng.int(3, 40);
    const note = rng.pick(SPECIAL_NOTES_POOL);
    const order: WorkOrder = {
      id: generateOrderId(),
      type: 'delivery',
      roomNumber: room,
      guestName: rng.pick(GUEST_NAMES),
      isInRoom: rng.chance(0.7),
      description: rng.pick(DELIVERY_ITEMS),
      orderedAt: minutesAgo(ago),
      status: 'pending',
    };
    if (note) order.specialNotes = note;
    orders.push(order);
  }

  // 打扫：重新打乱房间池，取不重复的房间
  const cleaningRooms = rng.shuffle([...ROOM_NUMBERS]).slice(0, cleaningCount);
  for (const room of cleaningRooms) {
    const ago = rng.int(3, 40);
    const note = rng.pick(SPECIAL_NOTES_POOL);
    const order: WorkOrder = {
      id: generateOrderId(),
      type: 'cleaning',
      roomNumber: room,
      guestName: rng.pick(GUEST_NAMES),
      isInRoom: rng.chance(0.3), // 打扫时客人多半不在房
      description: rng.pick(CLEANING_ITEMS),
      orderedAt: minutesAgo(ago),
      scheduledAt: minutesFromNow(rng.int(20, 120)),
      status: 'pending',
    };
    if (note) order.specialNotes = note;
    orders.push(order);
  }

  // 按时间倒序排列
  return orders.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
}

export const MOCK_OPERATORS: Operator[] = [
  { id: 'op1', name: 'Alex', avatar: '👨‍💼' },
  { id: 'op2', name: 'Sam', avatar: '👩‍💼' },
  { id: 'op3', name: 'Jordan', avatar: '🧑‍💼' },
  { id: 'op4', name: 'Taylor', avatar: '👨‍🔧' },
  { id: 'op5', name: 'Casey', avatar: '👩‍🔧' },
];

export function generateNewOrder(existingOrders?: WorkOrder[]): WorkOrder | null {
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

  // 复用全局 ROOM_NUMBERS，避免重复定义
  const guestNames = ['Chris Lee', 'Anna Smith', 'Tom Davis', 'Lucy Liu', 'Mark Taylor', 'Nina Patel'];

  const isDelivery = Math.random() > 0.4;
  const type = isDelivery ? 'delivery' as const : 'cleaning' as const;

  // 排除已有同类型待处理工单的房间
  const usedRooms = new Set(
    (existingOrders || [])
      .filter((o) => o.type === type && o.status !== 'completed')
      .map((o) => o.roomNumber)
  );
  const availableRooms = ROOM_NUMBERS.filter((r) => !usedRooms.has(r));

  // 无可选房间时跳过
  if (availableRooms.length === 0) return null;

  const now = Date.now();

  return {
    id: generateOrderId(),
    type,
    roomNumber: availableRooms[Math.floor(Math.random() * availableRooms.length)],
    guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
    isInRoom: Math.random() > 0.5,
    description: isDelivery
      ? deliveryItems[Math.floor(Math.random() * deliveryItems.length)]
      : cleaningItems[Math.floor(Math.random() * cleaningItems.length)],
    orderedAt: new Date(now).toISOString(),
    scheduledAt: isDelivery ? undefined : (() => {
      const scheduled = new Date(now + (1 + Math.random() * 3) * 3600000);
      return scheduled.toISOString();
    })(),
    status: 'pending',
  };
}
