interface InRoomBadgeProps {
  isInRoom: boolean;
  orderType?: 'delivery' | 'cleaning';
  className?: string;
}

export function InRoomBadge({ isInRoom, orderType = 'delivery', className = '' }: InRoomBadgeProps) {
  // delivery (送物): 客人在房才好 → IN ROOM 绿色, OUT 灰色
  // cleaning (打扫): 客人不在才好 → IN ROOM 灰色, OUT 绿色
  const highlightGreen =
    orderType === 'cleaning' ? !isInRoom : isInRoom;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full ${highlightGreen ? 'bg-emerald-500' : 'bg-slate-400'}`}
      />
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider ${highlightGreen ? 'text-emerald-600' : 'text-slate-500'}`}
      >
        {isInRoom ? 'Occupied' : 'Unmanned'}
      </span>
    </div>
  );
}
