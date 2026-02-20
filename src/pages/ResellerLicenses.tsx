import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  resellerGetLicenses,
  resellerCreateLicenses,
  resellerResetHwid,
  resellerGetApps,
  getMySubscriptions,
  resellerGetProfile,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Copy, Key, Check, Info, Shield, Search, Filter, X, ChevronRight, Plus, RotateCw, Trash2, Box, Sparkles, UserCog, Wallet, Coins, PlusCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface License {
  id: number;
  license_key: string;
  hwid?: string;
  expiry_timestamp?: string;
  is_active: boolean;
  app_id?: number;
  user_id?: number;
  created_at: string;
  app_name?: string;
}

interface Product {
  id: string;
  name: string;
}

interface Profile {
  credits: string;
}

export default function ResellerLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "used" | "unused" | "active" | "expired">("all");
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const [appId, setAppId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [count, setCount] = useState(1);
  const [durationDays, setDurationDays] = useState(31);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        resellerGetLicenses(),
        resellerGetApps(),
        getMySubscriptions(),
        resellerGetProfile(),
      ]);

      const [licensesResult, appsResult, subsResult, profileResult] = results;

      if (licensesResult.status === "fulfilled") {
        setLicenses(licensesResult.value || []);
      } else {
        console.error("[ResellerLicenses] Failed to fetch licenses:", licensesResult.reason);
        toast({
          title: "Failed to load licenses",
          description: licensesResult.reason.message,
          variant: "destructive",
        });
      }

      if (appsResult.status === "fulfilled") {
        setProducts(appsResult.value || []);
      }
      if (subsResult.status === "fulfilled") {
        setMySubscriptions(subsResult.value || []);
      }
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      }
    } catch (error: any) {
      console.error("[ResellerLicenses] Critical fetch error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    toast({
      title: "Refreshed",
      description: "Licenses data updated successfully",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length === 1 && products[0] && !appId) {
      setAppId(String(products[0].id));
    }
  }, [products, appId]);

  const handleCreate = async () => {
    if (!appId || products.length === 0) {
      toast({
        title: "Error",
        description: products.length === 0 ? "No products assigned to you" : "Select a product",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await resellerCreateLicenses({
        app_id: Number(appId),
        count,
        duration_days: durationDays,
        plan_id: selectedPlanId ?? undefined,
      });
      toast({
        title: "Licenses created",
        description: `Successfully created ${count} license(s)`,
      });
      setDialogOpen(false);
      setAppId("");
      setCount(1);
      setDurationDays(31);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to create licenses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetHwid = async (key: string) => {
    try {
      await resellerResetHwid(key);
      toast({ title: "HWID reset successfully" });
      setInfoOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to reset HWID",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, kind: string = "key", itemId?: number) => {
    if (!text || text.trim() === '') {
      toast({
        title: "Error",
        description: "Nothing to copy",
        variant: "destructive"
      });
      return;
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (!successful) {
        throw new Error("execCommand failed");
      }

      const copyId = `${itemId}-${kind}`;
      setCopiedItems(prev => new Set(prev).add(copyId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(copyId);
          return newSet;
        });
      }, 2000);

      toast({
        title: "✓ Copied!",
        description: "License key copied"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Try copy manually (Ctrl+C)",
        variant: "destructive"
      });
    }
  };

  const openLicenseInfo = (license: License) => {
    setSelectedLicense(license);
    setInfoOpen(true);
  };

  const usedLicenses = licenses.filter(l => l.hwid).length;
  const unusedLicenses = licenses.filter(l => !l.hwid).length;
  const activeLicenses = licenses.filter(l => l.is_active).length;

  const availablePlans = mySubscriptions.filter(s => String(s.app_id) === String(appId));

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch =
      license.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.app_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.hwid?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "used") return !!license.hwid;
    if (filterStatus === "unused") return !license.hwid;
    if (filterStatus === "active") return license.is_active && license.hwid;
    if (filterStatus === "expired") return !license.is_active && license.hwid;

    return true;
  });

  // Mobile Card Component
  const MobileLicenseCard = ({ license }: { license: License }) => {
    const isUsed = !!license.hwid;
    const isActive = license.is_active;
    const expiryDate = license.expiry_timestamp ? new Date(license.expiry_timestamp) : null;
    const isExpired = expiryDate && expiryDate < new Date();

    return (
      <button
        onClick={() => openLicenseInfo(license)}
        className="w-full text-left transition-all active:scale-[0.98] group"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-5 shadow-2xl transition-all duration-500 hover:border-emerald-500/40 hover:shadow-emerald-500/5 group">
          {/* Status Pulse background */}
          {!isUsed ? (
            <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          ) : isActive ? (
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          ) : (
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          )}

          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-14 w-14 rounded-xl flex items-center justify-center border transition-all shadow-inner bg-zinc-950",
                  !isUsed ? "border-zinc-800 group-hover:border-zinc-700" :
                    isActive ? "border-emerald-500/20 group-hover:border-emerald-500/40" :
                      "border-red-500/20 group-hover:border-red-500/40"
                )}>
                  <Key className={cn("h-7 w-7 transition-transform group-hover:scale-110",
                    !isUsed ? "text-zinc-500" : isActive ? "text-emerald-500/80" : "text-red-500/80"
                  )} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate mb-1">
                    {license.app_name || products.find(p => String(p.id) === String(license.app_id))?.name || `Product`}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 text-[7px] font-bold tracking-widest bg-zinc-950 border-zinc-800 text-zinc-500 uppercase px-1.5">ID: #{license.id}</Badge>
                    <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Digital License</span>
                  </div>
                </div>
              </div>

              <div className={cn(
                "py-1 px-3 rounded-md border text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm",
                !isUsed ? "bg-zinc-900 border-zinc-800 text-zinc-500" :
                  isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse",
                  !isUsed ? "bg-zinc-700" : isActive ? "bg-emerald-500" : "bg-red-500"
                )} />
                {!isUsed ? "STOCK" : isActive ? "ACTIVE" : "EXPIRED"}
              </div>
            </div>

            <div className="relative group/key bg-black/40 border border-white/5 rounded-xl p-3.5 flex items-center justify-between transition-all hover:bg-black/60 hover:border-white/10">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">License Key</span>
                <code className="text-[11px] font-mono text-zinc-400 truncate tracking-tight">{license.license_key}</code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(license.license_key, 'key', license.id); }}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 p-0 rounded-lg transition-all",
                    copiedItems.has(`${license.id}-key`) ? "bg-emerald-500 text-black shadow-lg" : "bg-zinc-800/50 text-zinc-500 hover:text-white"
                  )}
                >
                  {copiedItems.has(`${license.id}-key`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Created</span>
                <span className="text-[10px] font-bold text-white mt-0.5">
                  {new Date(license.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                </span>
              </div>

              {expiryDate ? (
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Expires</span>
                  <span className={cn(
                    "text-[10px] font-bold mt-0.5 uppercase tracking-tighter",
                    isExpired ? "text-red-500" : isActive ? "text-emerald-500/80" : "text-zinc-600"
                  )}>
                    {isExpired ? "Expired" : expiryDate.toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-bold text-zinc-500 mt-0.5">LIFETIME</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const columns = [
    {
      key: "license_key",
      header: "License Key",
      render: (license: License) => {
        const isCopied = copiedItems.has(`${license.id}-key`);

        return (
          <div className="flex items-center gap-2 group/key">
            <div className="flex-1 min-w-0">
              <code className="font-mono text-sm bg-black/40 px-4 py-2.5 rounded-lg block break-all text-zinc-300 border border-white/5 group-hover/key:border-white/10 transition-colors">
                {license.license_key}
              </code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 transition-all flex-shrink-0 hover:bg-zinc-800 text-zinc-400 hover:text-white",
                isCopied && "bg-emerald-500/20 text-emerald-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(license.license_key, "key", license.id);
              }}
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
    {
      key: "product",
      header: "Product",
      render: (license: License) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-emerald-500">
              {((license.app_name || products.find(p => String(p.id) === String(license.app_id))?.name) || `A`).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white">
              {license.app_name || products.find(p => String(p.id) === String(license.app_id))?.name || `App #${license.app_id}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (license: License) => {
        const isUsed = !!license.hwid;
        const isActive = license.is_active;

        return (
          <div className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
            !isUsed ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
              isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {!isUsed ? "Unused" : isActive ? "Active" : "Expired"}
          </div>
        );
      },
    },
    {
      key: "expires",
      header: "Expiry",
      render: (license: License) => {
        const expiryDate = license.expiry_timestamp ? new Date(license.expiry_timestamp) : null;
        const isExpired = expiryDate && expiryDate < new Date();
        const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

        return (
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isExpired ? "text-red-400" : "text-zinc-300"
            )}>
              {expiryDate ? expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : "Never"}
            </span>
            {expiryDate && !isExpired && (
              <span className="text-[10px] text-zinc-500">
                {daysLeft} days left
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "created",
      header: "Created",
      render: (license: License) => (
        <span className="text-sm text-zinc-500">
          {new Date(license.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (license: License) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openLicenseInfo(license);
            }}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Info className="h-4 w-4" />
          </Button>
          {license.hwid && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleResetHwid(license.license_key);
              }}
              className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Licenses"
      subtitle="Manage and distribute your product licenses"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">

        {/* ==================== SUMMARY HEADER & CONTROLS ==================== */}
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 transition-transform hover:rotate-12">
                <Key className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">License List</p>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  {licenses.length} Registered Keys
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
              </div>
            </div>


          </div>


        </div>

        {/* ==================== KPI GRID ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Licenses", val: licenses.length, icon: Box, color: "text-blue-500" },
            { label: "Used Licenses", val: usedLicenses, icon: Shield, color: "text-emerald-500" },
            { label: "Active Licenses", val: activeLicenses, icon: Zap, color: "text-purple-500" },
            { label: "Unused Licenses", val: unusedLicenses, icon: Key, color: "text-zinc-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all shadow-xl shadow-black/20 backdrop-blur-md">
              <div>
                <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.val}</p>
              </div>
              <div className={cn("h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search licenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-black/40 border-white/5 h-10 md:h-12 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl transition-all hover:bg-black/60 focus:bg-black/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20 backdrop-blur-md">
            {/* Create Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogOpen(true)}
              className="h-9 md:h-10 w-9 md:w-10 hover:bg-emerald-500/10 hover:text-emerald-400 flex-shrink-0 text-zinc-500 transition-all active:scale-95"
              title="Create licenses"
            >
              <Plus className="h-4.25 w-4.25" />
            </Button>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* Filter */}
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="h-9 md:h-10 border-0 bg-transparent hover:bg-zinc-800/50 px-2 w-auto gap-1 [&>svg]:h-4 [&>svg]:w-4 flex-shrink-0 text-zinc-500 transition-all">
                <Filter className="h-4.25 w-4.25" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-white focus:bg-zinc-800">All</SelectItem>
                <SelectItem value="used" className="text-white focus:bg-zinc-800">Used</SelectItem>
                <SelectItem value="unused" className="text-white focus:bg-zinc-800">Unused</SelectItem>
                <SelectItem value="active" className="text-white focus:bg-zinc-800">Active</SelectItem>
                <SelectItem value="expired" className="text-white focus:bg-zinc-800">Expired</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 md:h-10 w-9 md:w-10 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
            >
              <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* ==================== DATA LIST ==================== */}
        {/* ==================== DATA LIST ==================== */}
        <div className="rounded-xl border border-white/5 overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl">
          <div className="relative z-10">
            {isMobile ? (
              <div className="p-4 grid grid-cols-1 gap-4">
                {isLoading ? (
                  <LoadingSkeletons count={3} variant="card" />
                ) : filteredLicenses.length === 0 ? (
                  <div className="p-16 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
                    <Key className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">No licenses found</p>
                  </div>
                ) : (
                  filteredLicenses.map((license) => <MobileLicenseCard key={license.id} license={license} />)
                )}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredLicenses}
                keyExtractor={(l) => l.id.toString()}
                isLoading={isLoading}
                emptyMessage="No licenses found."
              />
            )}
          </div>
        </div>

        {/* Create New Licenses Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] border-white/10 bg-black/90 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Create Licenses</DialogTitle>
              <DialogDescription className="text-zinc-400">Generate new licenses for your products.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div className="grid gap-2">
                <Label className="text-zinc-300 font-semibold">Product</Label>
                <Select value={appId} onValueChange={setAppId}>
                  <SelectTrigger className="bg-black/40 h-11 border-white/5 rounded-xl text-white focus:ring-emerald-500/20 transition-all font-semibold">
                    <SelectValue placeholder="Select Module" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 rounded-xl">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-zinc-400 focus:bg-emerald-500/10 focus:text-emerald-400">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-zinc-300 font-semibold">Plan</Label>
                <Select
                  value={selectedPlanId?.toString() || "none"}
                  onValueChange={(v) => setSelectedPlanId(v === "none" ? null : Number(v))}
                >
                  <SelectTrigger className="bg-black/40 h-11 border-white/5 rounded-xl text-white focus:ring-emerald-500/20 transition-all font-semibold">
                    <SelectValue placeholder="NONE (STANDARD)" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 rounded-xl">
                    <SelectItem value="none" className="text-zinc-500 focus:bg-emerald-500/10 focus:text-emerald-400">Standard Module</SelectItem>
                    {availablePlans.length > 0 ? (
                      availablePlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.plan_id.toString()} className="text-zinc-400 focus:bg-emerald-500/10 focus:text-emerald-400">
                          {plan.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-plans" disabled className="text-zinc-700">No plans found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-zinc-300 font-semibold">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="bg-black/40 h-11 border-white/5 rounded-xl text-white focus:border-white/10 transition-all font-semibold"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-300 font-semibold">Days</Label>
                  <Input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="bg-black/40 h-11 border-white/5 rounded-xl text-white focus:border-white/10 transition-all font-semibold"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || !appId}
                className="w-full h-12 bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/5 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Generate {count} License{Number(count) > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* License Details Dialog - Updated Style */}
        <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
          <DialogContent className="w-[95vw] sm:w-full rounded-2xl border-white/10 sm:max-w-xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden bg-black/90 backdrop-blur-3xl p-0 shadow-2xl">
            <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[90vh]">
              {/* Tactical Header */}
              <div className="relative p-5 sm:p-8 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50">
                <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03] pointer-events-none">
                  <Key className="h-32 w-32 sm:h-48 sm:w-48 -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 text-white" />
                </div>

                <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                    <Key className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">License Details</DialogTitle>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">ID: <span className="text-emerald-500/80">#{selectedLicense?.id}</span></p>
                  </div>
                </div>
              </div>

              {selectedLicense && (
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar overflow-x-hidden">
                  {/* License Token Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">License Key</h4>
                    <div className="group relative bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between transition-all hover:bg-black/60 hover:border-white/10">
                      <code className="text-sm font-mono text-white truncate mr-4">
                        {selectedLicense.license_key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9 flex-shrink-0 rounded-xl transition-all",
                          copiedItems.has(`${selectedLicense.id}-key`)
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500"
                        )}
                        onClick={() => copyToClipboard(selectedLicense.license_key, "key", selectedLicense.id)}
                      >
                        {copiedItems.has(`${selectedLicense.id}-key`) ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Product & Config Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Target Product</h4>
                      <div className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-all text-left">
                        <div className="h-8 w-8 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-center shrink-0">
                          <Box className="h-4 w-4 text-emerald-500/50" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-tight truncate">{selectedLicense.app_name || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Plan Structure</h4>
                      <div className="flex items-center justify-center h-[50px] bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-zinc-300 font-bold text-[10px] tracking-widest uppercase">
                        {selectedLicense.hwid ? "Premium Node" : "Standard Link"}
                      </div>
                    </div>
                  </div>

                  {/* HWID Section */}
                  {selectedLicense.hwid && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Hardware ID Scan</h4>
                      <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-between transition-all hover:bg-zinc-900 hover:border-zinc-700">
                        <div className="flex-1 min-w-0 mr-3">
                          <code className="text-[11px] font-mono text-zinc-400 block break-all bg-black/20 p-3 rounded-xl border border-zinc-800/30">
                            {selectedLicense.hwid}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 bg-zinc-900 border-zinc-800 hover:text-emerald-500 shrink-0 rounded-xl"
                          onClick={() => handleResetHwid(selectedLicense.license_key)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <Button
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                      onClick={() => setInfoOpen(false)}
                    >
                      Dismiss Registry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
