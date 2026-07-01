import { UserRound, DoorOpen } from 'lucide-react';

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

  const bgClass = highlightGreen
    ? 'bg-emerald-50 ring-emerald-200'
    : 'bg-slate-100 ring-slate-200';
  const iconColor = highlightGreen
    ? 'text-emerald-600'
    : 'text-slate-400';

  return (
    <span
      title={isInRoom ? 'Occupied - Guest in room' : 'Unmanned - Guest out'}
      className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-full ring-1.5 ${bgClass} ${className}`}
    >
      {isInRoom
        ? <UserRound size={17} strokeWidth={2} className={iconColor} />
        : <DoorOpen size={17} strokeWidth={2} className={iconColor} />
      }
    </span>
  );
}
