import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateLicenseKey, getApplications, getResellers } from "@/lib/api";
import { Plus, Copy, CheckCircle, RefreshCw, Key, Shield, User, Clock, Zap, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";

interface Application {
  id: number;
  name: string;
}

interface Reseller {
  id: string;
  username: string;
}

interface GeneratedKey {
  license_key: string;
  reseller?: string;
  app_name?: string;
  expires_at?: string;
  created_at: string;
}

export default function LicenseGenerator() {
  const [apps, setApps] = useState<Application[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<GeneratedKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [appId, setAppId] = useState<string>("");
  const [resellerId, setResellerId] = useState<string>("");
  const [durationDays, setDurationDays] = useState(30);
  const [username, setUsername] = useState("");
  const [hwid, setHwid] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [appsData, resellersData] = await Promise.all([
          getApplications(),
          getResellers(),
        ]);
        setApps(appsData || []);
        setResellers(resellersData || []);
      } catch (error: any) {
        toast({
          title: "Failed to load data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [appsData, resellersData] = await Promise.all([
        getApplications(),
        getResellers(),
      ]);
      setApps(appsData || []);
      setResellers(resellersData || []);
      setLastUpdated(new Date());
      toast({ title: "Data refreshed", duration: 2000 });
    } catch (error: any) {
      toast({
        title: "Failed to refresh",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!appId || !durationDays) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateLicenseKey({
        app_id: parseInt(appId),
        duration_days: durationDays,
        reseller_id: resellerId || undefined,
        username: username || undefined,
        hwid: hwid || undefined,
      });

      const selectedApp = apps.find((a) => a.id === parseInt(appId));
      const selectedReseller = resellers.find((r) => r.id === resellerId);

      const newKey: GeneratedKey = {
        license_key: result.license_key || result.key,
        app_name: selectedApp?.name,
        reseller: selectedReseller?.username,
        expires_at: result.expires_at || result.expiry_timestamp,
        created_at: new Date().toISOString(),
      };

      setGeneratedKeys([newKey, ...generatedKeys]);
      toast({
        title: "Success",
        description: "License key generated successfully",
      });

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Failed to generate key",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setAppId("");
    setResellerId("");
    setDurationDays(30);
    setUsername("");
    setHwid("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="License Generator">
        <LoadingSkeletons count={3} variant="card" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="License Generator" subtitle="Generate and manage license keys">


      <div className="space-y-8 transition-all duration-300">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <Key className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Generator Core</p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{generatedKeys.length} Keys Created</h2>
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
              Sync Config
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111]/80 border border-zinc-800/80 p-6 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Applications Available</p>
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-white">{apps.length}</p>
          </div>
          <div className="bg-[#111111]/80 border border-zinc-800/80 p-6 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reseller Partners</p>
              <User className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-black text-white">{resellers.length}</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-12 bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
                Generate New License
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950/98 border-zinc-800 sm:max-w-md backdrop-blur-3xl rounded-xl p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 sm:p-8 bg-zinc-900/50 border-b border-zinc-800/50">
                <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white uppercase">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Key className="h-5 w-5 text-emerald-500" />
                  </div>
                  License Generation
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Application *</Label>
                  <select
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select Target Application</option>
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration (Days) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value))}
                      className="pl-10 bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-lg focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Optional Parameters</p>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reseller Assignment</Label>
                    <select
                      value={resellerId}
                      onChange={(e) => setResellerId(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="">Direct Customer (No Reseller)</option>
                      {resellers.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Username</Label>
                      <Input
                        placeholder="Client ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 h-11 rounded-lg focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">HWID Lock</Label>
                      <Input
                        placeholder="Hardware ID"
                        value={hwid}
                        onChange={(e) => setHwid(e.target.value)}
                        className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-700 h-11 rounded-lg focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                  className="w-full h-12 bg-white hover:bg-emerald-500 text-zinc-950 font-black uppercase tracking-widest text-xs rounded-lg shadow-xl transition-all hover:scale-[1.02] active:scale-95 mt-2"
                >
                  {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2 stroke-[3px]" />}
                  {isGenerating ? "GENERATING..." : "GENERATE SECURE KEY"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Generated Keys List */}
        {generatedKeys.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Session Output Log</h3>
            <div className="space-y-3">
              {generatedKeys.map((key, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[#111111]/80 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-500/30 hover:shadow-lg animate-in fade-in slide-in-from-top-2 duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2">
                      {key.app_name && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Zap className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{key.app_name}</span>
                        </div>
                      )}
                      {key.reseller && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <User className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{key.reseller}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-white bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800/50 tracking-wider">
                        {key.license_key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(key.license_key)}
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all",
                          copiedKey === key.license_key
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        )}
                      >
                        {copiedKey === key.license_key ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-500">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                        <Hash className="h-3 w-3" />
                        Generated: {new Date(key.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Expires</p>
                      <p className="text-sm font-bold text-white font-mono">
                        {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <div className="h-16 w-16 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-6 shadow-inner">
              <Key className="h-8 w-8 text-zinc-700" />
            </div>
            <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest mb-2">Ready to Generate</h3>
            <p className="text-xs text-zinc-600 font-medium max-w-sm text-center">
              Configure parameters above to create cryptographically secure license keys for your applications
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
