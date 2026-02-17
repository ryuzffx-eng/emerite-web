import { useEffect, useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeleton";
import { getAdminStats, getLogs, getServerTime } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Package,
  Store,
  Activity,
  Shield,
  Clock,
  Terminal,
  ChevronRight,
  Key,
  Plus,
  Search,
  FileText,
  BarChart3,
  MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn, formatIST } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// --- Types ---

interface Stats {
  total_licenses: number;
  total_users: number;
  total_applications: number;
  total_resellers: number;
  active_licenses: number;
  banned_users: number;
}

interface Log {
  id: number;
  action: string;
  admin_username?: string;
  created_at?: string;
  timestamp?: string;
  details?: string;
}

// --- Components ---

interface Log {
  id: number;
  action: string;
  admin_username?: string;
  username?: string;
  created_at?: string;
  timestamp?: string;
  details?: string;
  pc_name?: string;
  hwid?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) => (
  <div className={cn("relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 p-6 rounded-xl shadow-sm flex flex-col justify-between h-full group hover:border-zinc-700/80 transition-all duration-500", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10 flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700 group-hover:bg-zinc-800 transition-all shadow-inner">
        <Icon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border",
          trend === "up" ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" :
            trend === "down" ? "bg-red-500/5 text-red-500 border-red-500/10" :
              "bg-zinc-500/5 text-zinc-500 border-zinc-500/10"
        )}>
          {trend === "up" ? "↑ 2.4%" : trend === "down" ? "↓ 1.1%" : "• 0%"}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-0.5">{title}</p>
      {description && <p className="text-[10px] text-zinc-600 font-medium truncate">{description}</p>}
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 w-full rounded-xl bg-[#0a0a0a] border border-zinc-800/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all group text-left relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors shrink-0">
      <Icon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{label}</span>
      <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide group-hover:text-zinc-500 transition-colors">Quick Entry</span>
    </div>
  </button>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-zinc-500 font-semibold uppercase mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">
          {payload[0].value} <span className="text-[10px] text-zinc-500 font-medium">Activity</span>
        </p>
      </div>
    );
  }
  return null;
};


export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);

      const [statsData, logsData, timeData] = await Promise.allSettled([
        getAdminStats(),
        getLogs(),
        getServerTime().catch(() => ({ time: new Date().toISOString() }))
      ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (logsData.status === "fulfilled" && Array.isArray(logsData.value)) {
        setLogs(logsData.value.slice(0, 6));
      }
      if (timeData.status === "fulfilled") {
        const t = (timeData.value as any).time || (timeData.value as any).current_time || new Date().toISOString();
        setServerTime(t);
      }

    } catch (error: any) {
      console.error("[Dashboard] Fetch error:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 15000); // Updated to 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  const licenseData = stats ? [
    { name: "Active", value: stats.active_licenses, color: "#10b981" },
    { name: "Unused", value: Math.max(0, stats.total_licenses - stats.active_licenses), color: "#27272a" },
  ] : [];

  const activityTrend = [
    { h: "00:00", active: 45 }, { h: "04:00", active: 30 },
    { h: "08:00", active: 65 }, { h: "12:00", active: 85 },
    { h: "16:00", active: 120 }, { h: "20:00", active: 90 },
    { h: "23:59", active: 55 },
  ];

  if (isLoading && !stats) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading metrics...">
        <DashboardLoadingSkeleton />
      </DashboardLayout>
    );
  }



  return (
    <DashboardLayout
      title="Overview"
      subtitle={`Last sync: ${formatIST(new Date(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} • System operational`}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Active Licenses"
            value={stats?.active_licenses.toLocaleString() || "0"}
            icon={Key}
            description={`of ${stats?.total_licenses || 0} total keys`}
            trend="up"
          />
          <StatCard
            title="Authenticated Users"
            value={(stats?.total_users || 0) - (stats?.banned_users || 0)}
            icon={Users}
            description={`${stats?.total_users || 0} registered total`}
            trend="up"
          />
          <StatCard
            title="Active Modules"
            value={stats?.total_applications || "0"}
            icon={Package}
            description="Verified infrastructure"
          />
          <StatCard
            title="Verified Resellers"
            value={stats?.total_resellers || "0"}
            icon={Store}
            description="Distribution network"
            trend="neutral"
          />
        </div>

        {/* Analytics & Logs Bento */}
        <div className="space-y-6">

          {/* Charts Row */}
          <div className="flex flex-col gap-6">

            {/* Pie Analytics */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-6 shadow-sm flex flex-col h-[320px] group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <h3 className="text-sm font-semibold text-zinc-100">Resource Allocation</h3>
                </div>
                <BarChart3 className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
              </div>

              <div className="flex-1 min-h-[180px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={licenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {licenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {stats ? Math.round((stats.active_licenses / stats.total_licenses) * 100) || 0 : 0}%
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Load</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Idle</span>
                </div>
              </div>
            </div>

            {/* Area Trend */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-6 shadow-sm flex flex-col h-[320px] group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                  <h3 className="text-sm font-semibold text-zinc-100">Network Traffic</h3>
                </div>
                <MousePointer2 className="h-4 w-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} strokeOpacity={0.2} />
                    <XAxis dataKey="h" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Logs & Controls */}
          <div className="flex flex-col gap-6">

            {/* Registry Control */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-5 shadow-sm h-fit group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="relative z-10 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="h-3 w-3" />
                Registry Control
              </h3>
              <div className="relative z-10 space-y-2.5">
                <QuickAction icon={Key} label="Provision License" onClick={() => navigate('/licenses?new=true')} />
                <QuickAction icon={Users} label="Create User Profile" onClick={() => navigate('/users?new=true')} />
                <QuickAction icon={Store} label="Approve Reseller" onClick={() => navigate('/resellers?new=true')} />
              </div>
            </div>

            {/* Event Table (Full Width) */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 rounded-xl shadow-sm flex flex-col h-fit group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Terminal className="h-3 w-3 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Registry Events</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/logs')}
                  className="text-[10px] font-semibold uppercase tracking-widest h-6 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-all border border-zinc-800/50"
                >
                  View Archive <ChevronRight className="ml-1 h-2.5 w-2.5" />
                </Button>
              </div>

              <div className="divide-y divide-zinc-800/30 relative z-10">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={log.id || i} className="group/item px-5 py-3 hover:bg-zinc-800/20 transition-all flex items-start justify-between gap-4 border-l-2 border-transparent hover:border-emerald-500/50">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={cn(
                          "mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all shadow-inner",
                          (!log.username || log.username === "SYSTEM") ? "bg-zinc-900 border-zinc-800" : "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                          <Users className={cn("h-4 w-4", (!log.username || log.username === "SYSTEM") ? "text-zinc-600" : "text-emerald-500")} />
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                              {log.action?.replace(/_/g, " ")}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wide">
                              ID: {log.id}
                            </span>
                          </div>

                          <span className="text-sm font-semibold text-zinc-100 group-hover/item:text-white transition-colors truncate tracking-tight">
                            {log.pc_name || log.username || "System Kernel"}
                          </span>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/30">
                              {log.username || "SYSTEM"}
                            </span>
                            {log.hwid && (
                              <>
                                <span className="text-zinc-800 text-[10px]">•</span>
                                <code className="text-[9px] font-mono text-zinc-600 truncate max-w-[100px]">
                                  {log.hwid.substring(0, 12)}
                                </code>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold font-mono text-zinc-500 group-hover/item:text-zinc-300 transition-colors uppercase tracking-wide">
                          {formatIST(log.created_at || log.timestamp, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover/item:bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(24,24,27,1)] group-hover/item:shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <Terminal className="h-6 w-6 text-zinc-700 mb-2" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registry buffer empty</p>
                  </div>
                )}
              </div>
            </div>

            {/* Network Integrity */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-5 shadow-sm h-fit group hover:border-zinc-700/80 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="relative z-10 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Network Integrity
              </h3>

              <div className="relative z-10 space-y-2.5">
                <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex items-center justify-between group hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">API Node</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">LIVE</span>
                </div>

                <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex items-center justify-between group hover:border-blue-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">Drift Time</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-blue-400 transition-colors overflow-hidden truncate">
                    {formatIST(serverTime || new Date().toISOString(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex items-center justify-between group hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">Relational DB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-zinc-500">SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
