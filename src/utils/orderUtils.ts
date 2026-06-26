/**
 * URGENT 动态计算工具函数
 * - 送物：下单超过 15 分钟未处理 → urgent
 * - 打扫：离期望打扫时间小于 30 分钟 → urgent
 */

export function isUrgent(order: { type: string; orderedAt: string; scheduledAt?: string }): boolean {
  if (order.type === 'delivery') {
    return isDeliveryUrgent(order.orderedAt);
  }
  if (order.type === 'cleaning') {
    return isCleaningUrgent(order.scheduledAt);
  }
  return false;
}

/** 送物：下单超过 15 分钟 → urgent */
export function isDeliveryUrgent(orderedAt: string): boolean {
  const diffMin = (Date.now() - new Date(orderedAt).getTime()) / 60000;
  return diffMin > 15;
}

/** 打扫：离期望时间小于 30 分钟且未过时 → urgent */
export function isCleaningUrgent(scheduledAt?: string): boolean {
  if (!scheduledAt) return false;
  const diffMin = (new Date(scheduledAt).getTime() - Date.now()) / 60000;
  return diffMin >= 0 && diffMin < 30;
}

/** 格式化时间为可读字符串，如 "3:00 PM" */
export function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** 格式化完整时间，如 "Jun 26, 3:00 PM" */
export function formatTimeFull(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
