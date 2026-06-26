---
name: urgent-logic-and-mock-data
overview: 重构 URGENT 标签逻辑：送物按提交时间自动标记紧急（>15分钟），打扫按期望打扫时间标记紧急，并更新模拟数据。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Modern
    - Clean
    - Card-based
    - Blue sky theme
  fontSystem:
    fontFamily: Inter
    heading:
      size: 16px
      weight: 700
    subheading:
      size: 14px
      weight: 600
    body:
      size: 12px
      weight: 400
  colorSystem:
    primary:
      - "#0EA5E9"
      - "#F59E0B"
    background:
      - "#F8FAFC"
      - "#FFFFFF"
    text:
      - "#1E293B"
      - "#64748B"
    functional:
      - "#EF4444"
      - "#10B981"
      - "#F59E0B"
todos:
  - id: update-types
    content: 更新 WorkOrder 类型定义：移除 priority 字段，增加 scheduledAt 可选字段
    status: completed
  - id: add-urgent-utils
    content: 新增 src/utils/orderUtils.ts，实现送物和打扫的 URGENT 动态计算函数
    status: completed
    dependencies:
      - update-types
  - id: update-ordercard
    content: 更新 OrderCard 组件：动态计算 URGENT，打扫类型显示期望时间
    status: completed
    dependencies:
      - add-urgent-utils
  - id: update-detail-page
    content: 更新 OrderDetailPage：打扫类型显示期望打扫时间
    status: completed
    dependencies:
      - update-types
  - id: update-mock-data
    content: 更新 Mock 数据：送物 5 条、打扫 6 条，含 scheduledAt 字段
    status: completed
    dependencies:
      - update-types
  - id: cleanup-priority
    content: 全局清理 priority 字段引用，更新 generateNewOrder 函数
    status: completed
    dependencies:
      - update-mock-data
  - id: build-deploy
    content: 构建项目并部署到 EdgeOne Pages 和 CloudStudio
    status: completed
    dependencies:
      - cleanup-priority
---

## 需求概述

将送物（delivery）和打扫（cleaning）的 URGENT 标签逻辑分开处理，从静态字段改为前端动态计算。

## 核心功能

1. **送物（delivery）URGENT 逻辑**：无预约时间，按 `orderedAt` 提交时间计算。正常 15 分钟内应送达，提交越早（超过 10 分钟）越紧急，自动标记 URGENT。
2. **打扫（cleaning）URGENT 逻辑**：增加 `scheduledAt`（期望打扫时间）字段，列表显示该时间。离期望时间越近（小于 30 分钟）越紧急，自动计算 URGENT。
3. **Mock 数据调整**：

- 送物模拟数据 5 条，其中 1-2 条提交时间较早（> 10 分钟），自动标记为 URGENT
- 打扫模拟数据 5-6 条，包含 `scheduledAt` 字段，其中 1 条离期望时间最近（< 30 分钟），标记为 URGENT

4. **列表卡片更新**：打扫类型卡片需显示「期望打扫时间」
5. **详情页更新**：打扫类型详情页需显示「期望打扫时间」
6. **移除静态 priority 字段**：`WorkOrder` 接口中移除 `priority: OrderPriority` 字段，改为前端根据类型动态计算 `isUrgent`

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- Lucide React（图标）

## 实现方案

### 1. 类型定义更新（`src/types/workOrder.ts`）

- `WorkOrder` 接口：
- 移除 `priority: OrderPriority` 字段
- 增加 `scheduledAt?: string` 字段（仅打扫类型使用，ISO 8601 字符串）
- 保留 `OrderPriority` 类型定义（避免其他地方引用报错，或全局搜索移除）

### 2. URGENT 动态计算逻辑（新增 `src/utils/orderUtils.ts`）

```typescript
// 送物：超过 10 分钟未处理标记 URGENT
export function isDeliveryUrgent(orderedAt: string): boolean {
  const diffMin = (Date.now() - new Date(orderedAt).getTime()) / 60000;
  return diffMin > 10;
}

// 打扫：离期望时间小于 30 分钟且未过时标记 URGENT
export function isCleaningUrgent(scheduledAt?: string): boolean {
  if (!scheduledAt) return false;
  const diffMin = (new Date(scheduledAt).getTime() - Date.now()) / 60000;
  return diffMin >= 0 && diffMin < 30;
}
```

### 3. OrderCard 组件更新（`src/components/pending/OrderCard.tsx`）

- 接口 `OrderCardProps.order` 移除 `priority` 字段
- 引入 `isDeliveryUrgent` / `isCleaningUrgent` 动态计算 `isUrgent`
- 打扫类型：在卡片底部时间区域增加显示「期望打扫时间」（使用 Calendar 图标 + 格式化时间）
- 紧急时期望时间文字变红色

### 4. OrderDetailPage 更新（`src/pages/OrderDetailPage.tsx`）

- 打扫类型：在「Request Details Block」中 `orderedAt` 下方增加显示 `scheduledAt`（格式化为可读时间，如 "Jun 26, 3:00 PM"）

### 5. Mock 数据更新（`src/data/mockData.ts`）

- `generateMockOrders()`：
- 送物 5 条：`orderedAt` 分别为 5分钟前、12分钟前、25分钟前、40分钟前、68分钟前（后三条 > 10 分钟，自动 URGENT）
- 打扫 6 条：增加 `scheduledAt` 字段，设为今天不同时段（如 10:00、11:00、13:00、15:00、17:00、19:00），其中 15:00 那条离当前时间最近（< 30 分钟），自动 URGENT
- `generateNewOrder()`：打扫类型随机生成未来 1-4 小时内的 `scheduledAt`；移除 `priority` 字段

### 6. Context 和其他引用更新

- `src/context/WorkOrderContext.tsx`：检查是否有 `priority` 引用，移除
- 全局搜索 `priority` 引用并清理

## 实现注意事项

- **性能**：URGENT 计算在渲染时进行，轻量无性能问题
- **实时更新**：URGENT 状态依赖当前时间，组件挂载后不会自动更新。可考虑：
- 在 PendingListPage 中用 `setInterval` 每分钟强制刷新一次（通过 state 变更触发重渲染）
- 或在 OrderCard 中用 `useEffect` + `setInterval` 局部刷新
- **向后兼容**：localStorage 中旧数据可能含 `priority` 字段，加载时忽略即可（不去读取该字段）

## 设计风格

保持现有设计风格不变，仅增加显示内容。

### 打扫类型卡片增加「期望打扫时间」显示

在 OrderCard 组件底部时间区域（现有 Clock 图标 + 提交时间那一行），打扫类型增加：

- 左侧保留现有提交时间显示
- 右侧新增：Calendar 图标（lucide-react）+ 格式化期望时间，如 "Exp: 3:00 PM"
- 紧急时（离期望时间 < 30 分钟）文字变为红色（text-red-500）

### 详情页增加「期望打扫时间」

在打扫类型的「Request Details Block」中，`orderedAt` 下方增加一行：

- 图标：Calendar
- 标题：Expected Cleaning Time
- 内容：格式化后的 scheduledAt（如 "Jun 26, 3:00 PM"）
- 紧急时整行背景变红色淡底（bg-red-50）

## 风格关键词

现有风格：现代、简洁、卡片化、蓝色主色调（sky-500），送物用琥珀色（amber-50/amber-600），打扫用天蓝色（sky-50/sky-600）

## Agent Extensions

### Integration

- **eop**（EdgeOne Pages）：部署前端项目到 EdgeOne Pages，获得长期有效链接
- **cloudStudio**：部署到 CloudStudio，用于微信扫码预览

### 用法

- 构建完成后，同时使用 [integration:eop] 和 [integration:cloudStudio] 部署