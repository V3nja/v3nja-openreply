/**
 * Luxury Glass Stat Card
 */

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, trend, trendUp }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
      {/* Ambient hover glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500" />
      
      <p className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-zinc-300 transition-colors">
        {label}
      </p>
      
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 tracking-tight group-hover:text-orange-400 transition-colors">
        {value}
      </p>
      
      {trend && (
        <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
          <span>{trendUp ? "↑" : "↓"}</span> {trend}
        </p>
      )}
    </div>
  );
}
