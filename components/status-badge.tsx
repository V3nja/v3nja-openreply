/**
 * Luxury Glowing Status Badge
 */

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  SENT: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400 animate-pulse",
    label: "Sent",
  },
  FAILED: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    label: "Failed",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400 animate-pulse",
    label: "Pending",
  },
  SKIPPED_DEDUP: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-500",
    label: "Deduped",
  },
  SKIPPED_RATE_LIMIT: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    label: "Rate Limited",
  },
  SKIPPED_PLAN_LIMIT: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    label: "Plan Limit",
  },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
