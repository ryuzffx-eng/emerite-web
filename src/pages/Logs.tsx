import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/LoadingSkeleton";
import { getLogs } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FileText, RefreshCw, AlertTriangle, CheckCircle, Info, XCircle, Search, Users as UsersIcon, Globe } from "lucide-react";
import { cn, formatIST } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Log {
  id: string;
  type?: string;
  action?: string;
  user_id?: string;
  username?: string;
  ip_address?: string;
  details?: string;
  created_at: string;
  pc_name?: string;
  hwid?: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchLogs = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Failed to load logs",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLogs();
      toast({ title: "Logs refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 15000); // Silent live update every 15s
    return () => clearInterval(interval);
  }, []);

  const getLogTypeBadge = (type?: string) => {
    const safeType = (type || "info").toLowerCase();

    switch (safeType) {
      case "error":
      case "critical":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 w-fit shadow-sm shadow-red-500/5">
            <XCircle className="h-3 w-3 text-red-500" />
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Critical</span>
          </div>
        );
      case "warning":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 w-fit shadow-sm shadow-yellow-500/5">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wide">Warning</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit shadow-sm shadow-emerald-500/5">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Success</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 w-fit shadow-sm px-2.5">
            <Info className="h-3 w-3 text-zinc-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">{safeType}</span>
          </div>
        );
    }
  };

  const MobileLogCard = ({ log }: { log: Log }) => {
    return (
      <div className="bg-[#111111]/80 border border-zinc-800/80 p-4 rounded-xl space-y-4 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{log.username || "Anonymous"}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{log.pc_name || "Unknown Device"}</p>
            </div>
          </div>
          {getLogTypeBadge(log.type)}
        </div>

        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Event</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">{log.action?.replace(/_/g, " ") || "UNSPECIFIED"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Access Point</span>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-zinc-700" />
              <code className="text-[10px] font-mono text-zinc-400">{log.ip_address || "127.0.0.1"}</code>
            </div>
          </div>
        </div>

        {log.details && (
          <div className="p-3 bg-black/20 rounded-xl border border-zinc-800/30">
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed line-clamp-3">
              {log.details}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              {formatIST(log.created_at, { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wide">
              {formatIST(log.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">ID: #{log.id}</span>
        </div>
      </div>
    );
  };



  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (log: Log) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
            {formatIST(log.created_at, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide mt-0.5">
            {formatIST(log.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      key: "identity",
      header: "Device Identity",
      render: (log: Log) => {
        const isSystem = !log.username || log.username === "SYSTEM";
        return (
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center border transition-all shadow-inner shrink-0",
              isSystem ? "bg-zinc-900 border-zinc-800" : "bg-emerald-500/10 border-emerald-500/20"
            )}>
              <UsersIcon className={cn("h-4.5 w-4.5", isSystem ? "text-zinc-600" : "text-emerald-500")} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={cn("font-bold text-sm truncate uppercase tracking-tight", isSystem ? "text-zinc-500" : "text-white")}>
                {log.pc_name || log.username || "System Kernel"}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                  {log.username || "SYS-ROOT"}
                </span>
                {log.hwid && (
                  <>
                    <span className="text-zinc-800 text-[10px]">•</span>
                    <code className="text-[9px] font-mono text-zinc-700 bg-zinc-900/50 px-1 rounded truncate max-w-[80px]">
                      {log.hwid}
                    </code>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Severity",
      render: (log: Log) => getLogTypeBadge(log.type),
    },
    {
      key: "action",
      header: "Event",
      render: (log: Log) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-white uppercase tracking-wide">
            {log.action?.replace(/_/g, " ") || "UNSPECIFIED"}
          </span>
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wide mt-0.5">
            ID: {log.id}
          </span>
        </div>
      ),
    },
    {
      key: "ip",
      header: "Access Point",
      render: (log: Log) => (
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-zinc-700" />
          <code className="text-[10px] font-mono text-zinc-500">
            {log.ip_address || "127.0.0.1"}
          </code>
        </div>
      ),
    },
    {
      key: "details",
      header: "Data Payload",
      render: (log: Log) => (
        <div className="group/payload relative max-w-[240px]">
          <span className="text-[11px] text-zinc-400 font-medium line-clamp-2 leading-relaxed bg-zinc-900/40 px-3 py-2 rounded-xl border border-zinc-800/30 group-hover/payload:border-zinc-700/50 transition-all block" title={log.details}>
            {log.details || "None"}
          </span>
        </div>
      ),
    },
  ];

  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title="System Logs"
      subtitle="Comprehensive event tracking and security audit trail"
    >


      <div className="space-y-6 transition-all duration-300">
        {/* Top Summary Bar - Premium Style */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 ring-1 ring-inset ring-emerald-500/10">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Audit Stream
              </p>
              <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">System Registry</h2>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800 text-[10px] uppercase tracking-wide py-0 h-5">
                  {logs.length} Events
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar & Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search logs, events, or identifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-zinc-900 border-zinc-800 h-10 md:h-12 text-white placeholder:text-zinc-600 rounded-xl transition-all focus:ring-1 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 md:h-10 px-4 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-400 hover:text-white transition-all active:scale-95 group font-bold text-[11px] uppercase tracking-wider gap-2"
            >
              <RefreshCw className={cn("h-4 w-4 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
              Sync
            </Button>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              className="h-9 md:h-10 px-3 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
            </Button>
          </div>
        </div>

        {isMobile ? (
          <div className="grid grid-cols-1 gap-4 pb-10">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <MobileLogCard key={log.id} log={log} />
              ))
            ) : (
              <div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
                <FileText className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-600 uppercase tracking-wide">No Entries Found</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">Registry is currently silent</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-[#111111]/80 backdrop-blur-md shadow-2xl">
            <DataTable
              columns={columns}
              data={filteredLogs}
              keyExtractor={(l) => l.id}
              isLoading={isLoading}
              emptyMessage="No events found within current filter parameters"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
