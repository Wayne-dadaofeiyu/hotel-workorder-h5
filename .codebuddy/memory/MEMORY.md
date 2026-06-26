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

## 部署记录
- CloudStudio 沙箱用于快速预览，链接有时效（几小时）
- EdgeOne Pages 预览链接也临时，需绑定自定义域名才能长期
