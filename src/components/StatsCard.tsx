import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, className }: StatsCardProps) => {
  return (
    <div className={cn("group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                trend.positive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}% from last week
            </p>
          )}
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors duration-300 border border-emerald-500/20">
          <Icon className="h-6 w-6 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};
