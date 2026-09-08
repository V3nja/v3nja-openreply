/**
 * V3NJA Liquid Glass Stat Card with Folder-Tab Accent
 * Matching Screenshot 1 & 2
 */

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  tabColor?: "pink" | "green" | "orange" | "blue" | "teal" | "purple" | "lime" | "gold";
  trend?: string;
  trendUp?: boolean;
}

const TAB_CLASSES = {
  pink: "folder-tab-pink",
  green: "folder-tab-green",
  orange: "folder-tab-orange",
  blue: "folder-tab-blue",
  teal: "folder-tab-teal",
  purple: "folder-tab-purple",
  lime: "folder-tab-lime",
  gold: "border-t-2 border-yellow-500 bg-yellow-500/10 text-yellow-400",
};

export default function StatCard({
  label,
  value,
  sublabel,
  tabColor = "orange",
  trend,
  trendUp,
}: StatCardProps) {
  const tabClass = TAB_CLASSES[tabColor] || TAB_CLASSES.orange;

  return (
    <div className="glass-card rounded-2xl overflow-hidden relative group transition-all duration-300">
      {/* Folder Tab Header */}
      <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${tabClass}`}>
        <span className="truncate">{label}</span>
        {sublabel && (
          <span className="text-[9px] opacity-75 font-mono">{sublabel}</span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5">
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
          {value}
        </p>

        {trend && (
          <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
            <span>{trendUp ? "↑" : "↓"}</span> {trend}
          </p>
        )}
      </div>
    </div>
  );
}
