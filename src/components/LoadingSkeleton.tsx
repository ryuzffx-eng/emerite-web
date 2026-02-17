import { RefreshCw } from "lucide-react";

export const LoadingOverlay = ({ message = "Loading...", submessage = "" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-700 border-l-emerald-700 animate-spin" style={{ animationDirection: 'reverse' }} />
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-emerald-300 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-semibold text-lg">{message}</p>
        {submessage && <p className="text-zinc-400 text-sm">{submessage}</p>}
      </div>
    </div>
  </div>
);

export const LoadingSkeletons = ({ count = 4, variant = "card" }: { count?: number; variant?: "card" | "row" }) => (
  <div className={variant === "card" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4" : "space-y-4"}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className={variant === "card" ? "skeleton-card h-32" : "skeleton rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 h-16"} />
    ))}
  </div>
);

export const DashboardLoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-card h-24" />
      ))}
    </div>

    {/* Metrics Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="skeleton-card h-48" />
      ))}
    </div>

    {/* System Info Skeleton */}
    <div className="skeleton-card h-32" />
  </div>
);
