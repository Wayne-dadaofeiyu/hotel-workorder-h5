# 项目记忆

## 项目概述
- 项目名: hotel-workorder-h5
- 技术栈: React 18 + Vite 5 + TypeScript + TailwindCSS + Framer Motion
- 用途: 酒店工单 H5 管理系统

## 技术约定
- 使用英文作为 UI 文案
- 部署方式: EdgeOne Pages（长期链接）+ CloudStudio（微信扫码预览，临时）
- EdgeOne Pages 项目名: `pmsmobileassistant`, 项目ID: `makers-grqcdv0h44if`

## InRoomBadge 颜色逻辑
- 打扫 (cleaning): 客人不在才好 → IN ROOM 灰色, OUT 绿色
- 送物 (delivery): 客人在才好 → IN ROOM 绿色, OUT 灰色
- 组件路径: `src/components/common/InRoomBadge.tsx`
- 参数: `isInRoom: boolean`, `orderType?: 'delivery' | 'cleaning'`

## 演示锚点时间机制 (2026-06-29 fix)
- mockData.ts 引入 DEMO_START 锚点时间，存 sessionStorage
- minutesAgo/minutesFromNow 基于锚点计算，每次打开页面数据重置为"刚发生"状态
- 同一次 session 内刷新不重置锚点，关闭页面再打开则重置
- WorkOrderContext 初始化时显式清除旧 localStorage(hotel-workorders) 残留数据
- 自动新增订单 (generateNewOrder) 使用真实 Date.now()，不受锚点影响
- 自动新增间隔 30 秒，在 PendingListPage.tsx 的 useEffect 中实现

## 随机化 Mock 数据机制 (2026-06-29)
- 会话种子：`sessionStorage.getItem('hotel-demo-seed')`，同一 session 内数据一致，不同人/新标签页重新生成
- SeededRandom 类（`src/data/mockData.ts`）：基于种子的可复现伪随机
- 数据池：45 人名、34 房间号、20 送物描述、20 打扫描述、14 备注
- 1205 演示用房：始终 2-3 条放在最前面，时间 1-8 分钟前
- 其他订单：6-12 条随机，时间 1-40 分钟前
- `generatNewOrder()` 保持使用真实 `Date.now()`，自动新增不受种子影响

## 部署记录
- CloudStudio 沙箱用于快速预览，链接有时效（几小时）
- EdgeOne Pages 预览链接也临时，需绑定自定义域名才能长期
- 上次部署: GitHub Pages, 2026-06-29, 随机化 mock 数据 + 1205 演示用房前置
