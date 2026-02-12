import { cn } from "@/lib/utils/cn";
import type { ProspectStatus } from "@/types";

const statusStyles: Record<ProspectStatus, string> = {
  queued: "bg-neutral-800 text-neutral-300 border-neutral-700",
  analyzing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  generated: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  sent: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface BadgeProps {
  status: ProspectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
