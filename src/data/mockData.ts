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

/** 基于种子的伪随机数生成器（Mulberry32 算法变体） */
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
  '0401', '0408', '0505', '0512', '0603', '0618', '0709', '0802',
  '0815', '0901', '0905', '1003', '1005', '1107', '1201', '1203',
  '1206', '1208', '1210', '1302', '1305', '1415', '1508', '1512',
  '1608', '1703', '1710', '1812', '1905', '2003', '2008', '2105',
  '2108', '2201', '2207',
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
//  1205 演示用房 - 专用数据池
// ============================================================
const DEMO_ROOM = '1205';
const DEMO_GUEST_NAMES = [
  'James Wilson', 'Sarah Johnson', 'Robert Chen',
  'Emma Thompson', 'Maria Garcia', 'Michael Brown',
];

const DEMO_DELIVERY_ITEMS = [
  'Extra towels (4) and 2 soft pillows',
  'Room service menu and wine glass set',
  'Toiletries set - toothbrush, toothpaste, shampoo',
  'Coffee maker and coffee pods',
  'Fruit basket and welcome drink',
  'Baby crib and extra bedding',
];

const DEMO_CLEANING_ITEMS = [
  'Standard room cleaning',
  'Towel refresh and bed making',
  'Turndown service with chocolate',
  'Full room cleaning and linen change',
];

// ============================================================
//  随机生成 Mock 数据
// ============================================================

/** 生成一条随机的非 1205 房订单 */
function randomOrder(rng: SeededRandom, minutesAgoMin: number, minutesAgoMax: number): WorkOrder {
  const isDelivery = rng.chance(0.55);
  const type = isDelivery ? 'delivery' as const : 'cleaning' as const;
  const orderedMin = rng.int(minutesAgoMin, minutesAgoMax);

  const base: WorkOrder = {
    id: generateOrderId(),
    type,
    roomNumber: rng.pick(ROOM_NUMBERS),
    guestName: rng.pick(GUEST_NAMES),
    isInRoom: rng.chance(0.7),
    description: isDelivery
      ? rng.pick(DELIVERY_ITEMS)
      : rng.pick(CLEANING_ITEMS),
    orderedAt: minutesAgo(orderedMin),
    status: 'pending',
  };

  const note = rng.pick(SPECIAL_NOTES_POOL);
  if (note) base.specialNotes = note;

  if (!isDelivery) {
    // cleaning: scheduledAt = orderedAt + 15~120 min
    const scheduleIn = rng.int(15, 120);
    base.scheduledAt = minutesFromNow(scheduleIn - orderedMin);
  }

  return base;
}

/** 生成一条 1205 演示用房订单（时间较新，显眼） */
function demoOrder(rng: SeededRandom, orderType: 'delivery' | 'cleaning', minutesAgoVal: number): WorkOrder {
  const items = orderType === 'delivery' ? DEMO_DELIVERY_ITEMS : DEMO_CLEANING_ITEMS;
  const base: WorkOrder = {
    id: generateOrderId(),
    type: orderType,
    roomNumber: DEMO_ROOM,
    guestName: rng.pick(DEMO_GUEST_NAMES),
    isInRoom: true,
    description: rng.pick(items),
    orderedAt: minutesAgo(minutesAgoVal),
    status: 'pending',
  };

  if (orderType === 'cleaning') {
    const scheduleIn = rng.int(20, 60);
    base.scheduledAt = minutesFromNow(scheduleIn - minutesAgoVal);
  }

  return base;
}

export function generateMockOrders(): WorkOrder[] {
  const seed = getSessionSeed();
  const rng = new SeededRandom(seed);

  // --- 1205 演示用房：2~3 条，时间较新，排在最前面 ---
  const demoCount = rng.int(2, 4); // 2~3
  const demoOrders: WorkOrder[] = [];
  for (let i = 0; i < demoCount; i++) {
    const orderType = rng.chance(0.5) ? 'delivery' : 'cleaning';
    const ago = rng.int(1, 8); // 1~8 分钟前
    demoOrders.push(demoOrder(rng, orderType, ago));
  }

  // --- 其他房间：6~12 条 ---
  const otherCount = rng.int(6, 13); // 6~12
  const otherOrders: WorkOrder[] = [];
  for (let i = 0; i < otherCount; i++) {
    // 时间分布在 1~40 分钟前，制造急单/普通单的混搭效果
    otherOrders.push(randomOrder(rng, 1, 40));
  }

  // 1205 房排最前，其他按时间倒序（越新的越前）
  const allOrders = [
    ...demoOrders,
    ...otherOrders.sort(
      (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    ),
  ];

  return allOrders;
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

  const now = Date.now();

  return {
    id: generateOrderId(),
    type,
    roomNumber: rooms[Math.floor(Math.random() * rooms.length)],
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
