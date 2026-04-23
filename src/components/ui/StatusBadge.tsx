import { cn } from "@/lib/utils";
import { theme, type StatusKey } from "@/config/theme";

interface StatusBadgeProps {
  status:    StatusKey;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text, label } = theme.status[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        className
      )}
      style={{ background: bg, color: text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: text }}
      />
      {label}
    </span>
  );
}
