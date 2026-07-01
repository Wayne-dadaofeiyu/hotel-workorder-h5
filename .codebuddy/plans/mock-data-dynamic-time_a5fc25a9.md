---
name: mock-data-dynamic-time
overview: 将 mock 数据改为基于演示锚点时间计算相对时间，并添加定时自动新增订单功能，确保演示期间数据真实流动。
todos:
  - id: update-mockdata-anchor
    content: 在 mockData.ts 中引入 DEMO_START 锚点时间，minutesAgo/minutesFromNow 基于锚点计算
    status: completed
  - id: remove-orders-persistence
    content: 移除 WorkOrderContext 中 orders 的 localStorage 持久化，每次刷新从 generateMockOrders 重新生成
    status: completed
    dependencies:
      - update-mockdata-anchor
  - id: update-generate-new-order
    content: 修改 generateNewOrder 使 orderedAt 基于锚点时间（设为"刚刚"）
    status: completed
    dependencies:
      - update-mockdata-anchor
  - id: verify-and-deploy
    content: 构建并部署到 GitHub Pages，验证演示效果
    status: completed
    dependencies:
      - remove-orders-persistence
      - update-generate-new-order
---

## 产品概述

优化酒店工单 H5 的 Mock 数据逻辑，使演示期间数据看起来真实流动，无论何时打开、演示多久都保持自然状态。

## 核心功能

- 引入演示锚点时间（demoStartTime），所有相对时间基于此锚点计算，演示期间时间真实流逝
- 锚点时间存入 sessionStorage，同一次演示期间刷新页面不重置状态
- 移除 localStorage 持久化，每次新开页面重新生成"刚发生"状态的 mock 数据
- 保留并优化自动新增订单的模拟推送（已有 30 秒间隔的逻辑，需调整使其基于锚点时间生成 orderedAt）
- generateNewOrder 生成的 orderedAt 需基于锚点时间而非 Date.now()

## 技术栈

- 现有项目：React + TypeScript + Vite
- 状态管理：React Context（WorkOrderContext）
- 持久化：sessionStorage（锚点时间）

## 实现方案

### 核心思路

在 `mockData.ts` 中引入 `getDemoStartTime()` 函数，页面首次加载时生成并缓存锚点时间到 sessionStorage，之后所有 `minutesAgo` / `minutesFromNow` 都基于该锚点计算，而非 `Date.now()`。

这样：

- 同一次演示（同一 session）：时间持续流逝，真实感强
- 关闭页面再打开：锚点重新生成，数据重置为"刚发生"状态

### 修改文件清单

#### 1. `src/data/mockData.ts`

- 新增 `getDemoStartTime(): number` 函数，从 sessionStorage 读取或生成新的锚点时间戳
- 修改 `minutesAgo(min)` → 基于锚点时间减去 min 分钟
- 修改 `minutesFromNow(min)` → 基于锚点时间加上 min 分钟
- 修改 `generateNewOrder()` 中的 `orderedAt` 也基于锚点时间（设为锚点时间，即"刚刚下单"）

#### 2. `src/context/WorkOrderContext.tsx`

- 移除 `loadFromStorage()` 和 `saveToStorage()` 中对 orders 的持久化逻辑
- 初始 orders 直接调用 `generateMockOrders()`，不再从 localStorage 读取
- 保留 operator 的 localStorage 持久化（用户身份需要记住）
- 新增订单推送时，`orderedAt` 使用锚点时间（当前时刻相对于锚点）

#### 3. `src/utils/orderUtils.ts`

- `isUrgent`、`isDeliveryUrgent`、`isCleaningUrgent` 中的 `Date.now()` 改为基于锚点时间的计算
- 新增 `getDemoNow(): number` 导出，返回锚点时间 + 实际流逝时间

#### 4. `src/pages/PendingListPage.tsx`

- 已有 30 秒自动新增订单的逻辑，无需大改，但需确保 `generateNewOrder()` 使用锚点时间

### 锚点时间计算逻辑

```typescript
// mockData.ts
function getDemoStartTime(): number {
  const stored = sessionStorage.getItem('demo-start-time');
  if (stored) return parseInt(stored, 10);
  const now = Date.now();
  sessionStorage.setItem('demo-start-time', now.toString());
  return now;
}

const DEMO_START = getDemoStartTime();

function demoNow(): number {
  // 锚点时间 + 实际流逝时间 = 演示中的"当前时间"
  return DEMO_START + (Date.now() - DEMO_START);
  // 简化：直接返回 Date.now() 即可，因为锚点只在 session 开始时固定
  // 实际上只需要 orderedAt/scheduledAt 基于锚点，显示时仍用真实时间差
}
```

**简化方案**：实际上不需要复杂计算。`orderedAt` 和 `scheduledAt` 在生成时就是基于 `DEMO_START` 的绝对时间戳，显示时计算与 `Date.now()` 的差值即可。同一次 session 中，`Date.now()` 正常流逝，时间差自然增大，真实感强。下次打开 sessionStorage 清空，锚点重置。

### 关于 isUrgent 的计算

`isUrgent` 依赖 `Date.now()` 计算时间差，这正好符合预期：

- 同一次演示：时间差持续增大，URGENT 状态动态变化
- 下次打开：锚点重置，orderedAt 重新变为"几分钟前"，URGENT 状态也重置

**结论**：`orderUtils.ts` 不需要改，`Date.now()` 的使用是正确的。

## 目录结构

```
src/
├── data/
│   └── mockData.ts          [MODIFY] 引入 DEMO_START 锚点，minutesAgo/minutesFromNow 基于锚点
├── context/
│   └── WorkOrderContext.tsx  [MODIFY] 移除 orders 的 localStorage 持久化，保留 operator 持久化
├── utils/
│   └── orderUtils.ts        [无需修改] isUrgent 使用 Date.now() 是正确的
└── pages/
    └── PendingListPage.tsx   [无需修改] 已有自动新增订单逻辑
```

## 关键代码结构

```typescript
// src/data/mockData.ts 新增

const DEMO_START_KEY = 'hotel-demo-start-time';

function getDemoStartTime(): number {
  const stored = sessionStorage.getItem(DEMO_START_KEY);
  if (stored) return parseInt(stored, 10);
  const now = Date.now();
  sessionStorage.setItem(DEMO_START_KEY, now.toString());
  return now;
}

const DEMO_START = getDemoStartTime();

function minutesAgo(min: number): string {
  return new Date(DEMO_START - min * 60000).toISOString();
}

function minutesFromNow(min: number): string {
  return new Date(DEMO_START + min * 60000).toISOString();
}
```