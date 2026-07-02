# 酒店工单 H5 管理系统 - 业务逻辑文档

> 技术栈：React 18 + Vite 5 + TypeScript + TailwindCSS + Framer Motion  
> 模拟手机 H5 面板（`max-w-md`），无需后端，纯前端演示系统

---

## 一、产品概述

一个**酒店工作人员使用的移动端工单面板**，用于接收和处理客人的服务请求。  
两大服务类型：
- **Delivery（送物）**：客人需要物品配送（毛巾、水、菜单等）
- **Cleaning（打扫）**：客人需要房间清洁服务

---

## 二、核心业务实体

### 2.1 工单（WorkOrder）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 工单编号，格式 `WO-2024-1xxx` |
| `type` | `'delivery' \| 'cleaning'` | 送物 / 打扫 |
| `roomNumber` | `string` | 房间号，如 `0314` |
| `guestName` | `string` | 客人姓名 |
| `isInRoom` | `boolean` | 客人是否在房内 |
| `description` | `string` | 需求描述 |
| `specialNotes` | `string?` | 特殊备注 |
| `orderedAt` | `string (ISO)` | 下单时间 |
| `scheduledAt` | `string (ISO)?` | 期望完成时间（仅打扫有） |
| `status` | `'pending' \| 'completed'` | 待处理 / 已完成 |
| `operator` | `string?` | 完成人姓名 |
| `completedAt` | `string (ISO)?` | 完成时间 |

### 2.2 操作员（Operator）

系统预设 5 个操作员：Alex、Sam、Jordan、Taylor、Casey，每个有不同 emoji 头像。

---

## 三、三大页面（视图）

### 3.1 待处理列表页 `PendingListPage`

**主要功能：**
- 按 Tab（Delivery / Cleaning）筛选待处理工单
- 每个 Tab 显示未完成数量角标
- 工单卡片显示：房号（大字）、客人状态标签、需求类型/描述、下单时间
- **急单标注**：符合紧急条件的工单卡片左边框变红色 + "URGENT" 标签

**URGENT 判定逻辑**（`orderUtils.ts`）：
| 服务类型 | 触发条件 |
|---------|---------|
| 送物 Delivery | 下单超过 **15 分钟** 未完成 |
| 打扫 Cleaning | 离期望完成时间 **不足 30 分钟** |

> 每 60 秒自动刷新一次，重新判定急单状态。

**模拟新订单**：
- 在 Delivery tab 下，每 30 秒有 50% 概率自动生成一个新工单并弹 Toast 提示
- Cleaning tab 下自动模拟暂停，仅通过切换 tab 触发 0314 演示工单

**空状态**：当筛选后无工单时显示 "All caught up!" 提示

### 3.2 订单详情页 `OrderDetailPage`

点击工单卡片进入，展示该工单完整信息：

**时间线组件**（顶部）：
```
[Created ●] ───── [In Progress ◐ / Completed ●]
```
- 待处理：第二步显示 "In Progress" 带脉冲动画
- 已完成：第二步显示 "Completed" 带绿色对勾

**信息模块**：
1. **Guest Info**：大号房号 + 客人姓名 + 在房/不在房标签
2. **Request Details**：需求类型图标 + 描述文本 + 特殊备注（黄色卡片）+ 下单时间
   - 打扫类型还显示期望完成时间（临近时变红）
3. **Completion Info**（仅已完成）：操作员姓名 + 完成时间

**操作按钮**（底部固定）：
- 送物：点击 "Mark as Delivered" → 弹出确认弹窗
- 打扫：点击 "Mark as Cleaned" → 弹出确认弹窗
- 弹窗中可切换操作员，确认后工单标记为 completed

### 3.3 历史记录页 `HistoryPage`

**顶部统计卡片**：
| 指标 | 含义 |
|------|------|
| Today | 当天完成工单数 |
| Total Done | 累计完成工单数 |
| Avg Time | 平均处理时长 |

**筛选功能**：
- 搜索框：按房间号 / 工单ID / 操作员名称搜索
- 类型筛选项：All / Delivery / Cleaning

**列表展示**：已完成工单列表，显示房号、类型标签、描述、操作员、完成时间。按完成时间倒序排列。

---

## 四、特殊业务规则

### 4.1 客人状态（InRoomBadge）

根据服务类型，颜色语义反转：

| 服务类型 | 客人在房 (Occupied) | 客人不在 (Unmanned) |
|---------|:---:|:---:|
| **送物 Delivery** | 🟢 绿色（好，可以当面交付） | ⬛ 灰色 |
| **打扫 Cleaning** | ⬛ 灰色 | 🟢 绿色（好，方便打扫） |

> 送物希望客人在 → 绿色；打扫希望客人不在 → 绿色

### 4.2 0314 演示样板房

0314 是固定演示样板房，切换到 **Cleaning tab** 时自动注入一条即时打扫工单：
- 客人 `David`，状态「在房」(`isInRoom: true`)
- 特殊备注 `"Guest is waiting in the room"`
- 每次页面生命周期内仅创建一次：检查 `state.orders` 中是否已存在 0314 cleaning（不限状态）
  - 不存在 → 创建（首次加载/刷新后）
  - 已存在（pending 或 completed）→ 不创建
- 完成 0314 后同 session 内不再重建，刷新/重新进入链接则重新开始
- 0314 **不在**随机房号池中，只有通过此机制产生

### 4.3 同类型不重复房间

同一服务类型（送物/打扫）下，**每个房间最多出现 1 条工单**。  
模拟真实场景：客人通常一次把所有需求下单完毕，不会短时间内重复下单同一类型。

---

## 五、数据生成机制

### 5.1 初始 Mock 数据（`generateMockOrders()`）

| 步骤 | 规则 |
|------|------|
| 种子 | 从 `sessionStorage` 取 `hotel-demo-seed`，不存在则生成随机种子 |
| 送物 | 从 27 间房中随机 3-6 间，各生成 1 条，3-40 分钟前 |
| 打扫 | 重新随机 3-6 间房，各生成 1 条，3-40 分钟前 |
| 排序 | 按时间倒序 |
| 总数量 | 6-12 条 |

**数据池规模**：
- 客人姓名：45 个（多国籍）
- 房间号：27 间（10楼 8间 / 11楼 8间 / 12楼 9间 / 13楼 2间）
- 送物描述：20 种
- 打扫描述：20 种
- 特殊备注：12 种（+4 个空）

### 5.2 会话种子（SeededRandom）

基于 Lehmer / Park-Miller LCG 算法的伪随机数生成器。  
同一 session 内数据一致，不同人 / 新标签页打开 → 完全不同数据。  
这样演示时观众各自看到不同数据，更真实。

### 5.3 演示锚点时间

`sessionStorage` 存 `hotel-demo-start-time`（首次加载时的时间戳）。  
所有工单的 `orderedAt` 都基于此锚点计算（如 "3 分钟前" = 锚点时间 - 3 分钟）。  
关闭页面重开 → 锚点重置 → 所有时间回到"刚发生"状态。

---

## 六、状态流转

```
┌─────────┐  点击卡片   ┌──────────┐  点击完成按钮   ┌────────────┐
│ Pending  │ ────────→ │  Detail   │ ────────────→ │  History   │
│  列表    │ ←──────── │  详情页   │   确认操作员    │  历史记录   │
└─────────┘  返回按钮   └──────────┘                └────────────┘
                              │
                              ▼
                       ConfirmModal
                    （选择操作员 → 确认）

BottomNav:
  [Orders] ←──────────→ [History]
    (待处理列表)           (历史记录)
```

### 状态变更 Action 列表

| Action | 触发场景 | 效果 |
|--------|---------|------|
| `SET_VIEW` | 底部导航切换 / 点击卡片 / 返回 | 切换 `currentView` + `selectedOrderId` |
| `SET_TAB` | TabBar 点击 | 切换 `activeTab`（delivery/cleaning/all） |
| `COMPLETE_ORDER` | 确认弹窗确认 | status → completed，记录 operator + completedAt |
| `ADD_ORDER` | 自动模拟 / 手动模拟 | 新工单插入数组头部 |
| `SET_OPERATOR` | 弹窗中选择操作员 | 更新 operator + 存 localStorage |
| `SHOW_TOAST` | 完成/新增/其他事件 | 显示顶部飘入提示，3 秒后自动消失 |
| `HIDE_TOAST` | 自动超时 / 手动点击 | 隐藏当前提示 |

---

## 七、组件树

```
App (WorkOrderProvider 包裹)
├── TopNavBar           # 顶部导航：标题 + 通知铃铛（未完成数） + 当前操作员
├── Toast               # 全局提示（成功/信息/警告），3 秒自动消失
├── PendingListPage     # 待处理列表（currentView === 'pending'）
│   ├── TabBar          #   Delivery / Cleaning 切换标签（含数量角标）
│   └── OrderCard[]     #   工单卡片列表
│       └── InRoomBadge #     在房/不在房标签
├── OrderDetailPage     # 订单详情（currentView === 'detail'）
│   ├── InRoomBadge     #     在房/不在房标签
│   └── ConfirmModal    #     底部滑出确认弹窗（含操作员选择）
├── HistoryPage         # 历史记录（currentView === 'history'）
│                       #     统计卡片 + 搜索 + 类型筛选 + 列表
└── BottomNav           # 底部导航：Orders / History（详情页不显示）
```

---

## 八、文件目录

```
src/
├── main.tsx                         # React 入口
├── App.tsx                          # 主组件（路由 + 布局框架）
├── index.css                        # 全局样式（TailwindCSS）
├── types/
│   └── workOrder.ts                 # 类型定义（OrderType, WorkOrder, AppState 等）
├── context/
│   └── WorkOrderContext.tsx          # 全局状态管理（useReducer + Context）
├── data/
│   └── mockData.ts                  # Mock 数据生成 + 数据池 + 种子机制
├── utils/
│   └── orderUtils.ts                # 急单判定 + 时间格式化
├── components/
│   ├── common/
│   │   ├── ConfirmModal.tsx         # 底部滑出确认弹窗（含操作员选择）
│   │   ├── InRoomBadge.tsx          # 在房/不在房标签（语义反转颜色）
│   │   └── Toast.tsx                # 全局飘入提示
│   ├── layout/
│   │   ├── TopNavBar.tsx            # 顶部导航栏（标题 + 铃铛 + 操作员）
│   │   └── BottomNav.tsx            # 底部导航栏（Orders / History）
│   └── pending/
│       ├── TabBar.tsx               # 服务类型切换标签
│       └── OrderCard.tsx            # 工单卡片（房号 + 急单标识 + 时间）
└── pages/
    ├── PendingListPage.tsx           # 待处理列表页（筛选 + 自动模拟新单）
    ├── OrderDetailPage.tsx           # 订单详情页（时间线 + 信息 + 完成按钮）
    └── HistoryPage.tsx              # 历史记录页（统计 + 搜索 + 筛选 + 列表）
```

---

## 九、部署信息

| 平台 | 地址 | 说明 |
|------|------|------|
| GitHub Pages | `https://wayne-dadaofeiyu.github.io/hotel-workorder-h5/` | 长期稳定，push master 自动部署 |
| CloudStudio | 临时链接（几小时有效） | 快速预览 |

> - GitHub Pages 部署时 `vite.config.ts` 中 `base: '/hotel-workorder-h5/'`
> - CloudStudio 预览时需将 `dist/index.html` 中资源路径 `/hotel-workorder-h5/assets/` 改为 `./assets/`（相对路径）
> - Git 推送需代理：`git config --global http.proxy http://127.0.0.1:7890`
