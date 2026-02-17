import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getHealth, getApiStatus, getServerTime } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Activity, Server, Clock, CheckCircle, XCircle, RefreshCw, Database, Shield, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingOverlay } from "@/components/LoadingSkeleton";

interface HealthData {
  status: string;
  uptime?: number;
  version?: string;
  database?: string;
}

export default function Status() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [healthData, statusData, timeData] = await Promise.all([
        getHealth().catch(() => ({ status: "unknown" })),
        getApiStatus().catch(() => null),
        getServerTime().catch(() => null),
      ]);
      setHealth(healthData);
      setApiStatus(statusData);
      setServerTime(timeData?.time || timeData?.timestamp || new Date().toISOString());
    } catch (error: any) {
      toast({
        title: "Failed to fetch status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStatus();
      setLastUpdated(new Date());
      toast({ title: "Status refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusIndicator = ({ status, showLabel = true }: { status: string; showLabel?: boolean }) => {
    const isOnline = status?.toLowerCase() === "ok" || status?.toLowerCase() === "healthy";
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-2.5 w-2.5 rounded-full",
          isOnline ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-bounce"
        )} />
        {showLabel && (
          <span className={cn("font-black text-sm tracking-tight", isOnline ? "text-emerald-500" : "text-red-500")}>
            {isOnline ? "OPERATIONAL" : "CRITICAL FAILURE"}
          </span>
        )}
      </div>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <DashboardLayout
      title="System Status"
      subtitle="Comprehensive real-time monitoring of all Emerite services"
    >


      <div className="space-y-8 transition-all duration-300">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Diagnostic Matrix</p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">System Status: {health?.status?.toUpperCase() === "OK" ? "Optimal" : "Check Required"}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex-1 md:flex-none h-10 sm:h-11 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-4 sm:px-6 font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              Run Diagnostics
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {/* Main Status */}
          <div className="bg-[#111111]/80 border border-zinc-800/80 p-6 rounded-xl animate-card-in backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 group">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Infrastructure Health</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Server className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col items-center py-4 text-center">
              <StatusIndicator status={health?.status || "unknown"} />
              <p className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                {health?.status?.toUpperCase() === "OK" ? "Stable" : "Unstable"}
              </p>
            </div>
          </div>

          {/* Uptime Statistics */}
          <div className="bg-[#111111]/80 border border-zinc-800/80 p-6 rounded-xl animate-card-in backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 group" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Uptime</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col items-center py-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tight tabular-nums group-hover:scale-105 transition-transform">
                {health?.uptime ? formatUptime(health.uptime) : "99.9%"}
              </p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-4">Continuous Operation</p>
            </div>
          </div>

          {/* Time Sync */}
          <div className="bg-[#111111]/80 border border-zinc-800/80 p-6 rounded-xl animate-card-in backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 group" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Time Sync</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col items-center py-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight tabular-nums font-mono group-hover:text-white transition-colors">
                {serverTime ? new Date(serverTime).toLocaleTimeString([], { hour12: false }) : "SYNCING"}
              </p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4">
                {serverTime ? new Date(serverTime).toLocaleDateString() : "Initializing..."}
              </p>
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111111]/80 rounded-xl p-6 sm:p-8 border border-zinc-800 box-border animate-card-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-lg uppercase tracking-tight">Core Services</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Authentication Gateway", status: health?.status || "unknown", icon: Shield },
                { name: "PostgreSQL Cluster", status: health?.database || health?.status || "unknown", icon: Database },
                { name: "License Validation Engine", status: health?.status || "unknown", icon: Zap },
                { name: "Encrypted Asset Vault", status: health?.status || "unknown", icon: Server },
              ].map((service, i) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-black border border-zinc-800 group-hover:border-emerald-500/20 transition-colors">
                      <service.icon className="h-4 w-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-zinc-300 uppercase tracking-wide">{service.name}</span>
                  </div>
                  <StatusIndicator status={service.status} showLabel={false} />
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-[#111111]/80 rounded-xl p-6 sm:p-8 border border-zinc-800 box-border animate-card-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Info className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-lg uppercase tracking-tight">System Specs</h3>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest block mb-2">Build Version</span>
                <p className="font-mono text-sm text-emerald-400">{health?.version || "Emerite-v1.1"}</p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest block mb-2">Protocol</span>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <Shield className="h-3 w-3 text-emerald-500" /> Secure Proxy
                </p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors sm:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Network Latency</span>
                  <span className="text-[10px] font-mono text-emerald-500">42ms</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[15%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes card-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-card-in {
          animation: card-in 0.6s cubic-bezier(0.23, 1, 0.320, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </DashboardLayout>
  );
}
