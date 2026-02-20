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
  getLicenses,
  createLicenses,
  deleteLicense,
  resetHwid,
  getApplications,
  getSubscriptionPlans,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Plus, RefreshCw, Trash2, Copy, Key, Check, Info, Shield, AlertTriangle, Search, Filter, X, ChevronRight, Box, PlusCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface License {
  id: number;
  license_key: string;
  hwid?: string;
  expiry_timestamp?: string;
  is_active: boolean;
  app_id: number;
  plan_id?: number;
  plan_name?: string | null;
  user_id?: number;
  created_at: string;
  app_name?: string;
}

interface Application {
  id: string;
  name: string;
}

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [plans, setPlans] = useState<{ id: number; app_id: number; name: string; level: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [deleteMode, setDeleteMode] = useState<"all" | "unused" | "used" | "">("");
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const [appId, setAppId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [count, setCount] = useState<number | string>(1);
  const [durationDays, setDurationDays] = useState<number | string>(31);
  const [prefix, setPrefix] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "used" | "unused" | "active" | "expired">("all");

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
      console.log("[Licenses] Fetching data...");
      const results = await Promise.allSettled([
        getLicenses(),
        getApplications(),
        getSubscriptionPlans(),
      ]);

      const [licensesResult, appsResult, plansResult] = results;

      if (licensesResult.status === "fulfilled") {
        setLicenses(licensesResult.value || []);
      } else {
        console.error("[Licenses] Failed to fetch licenses:", licensesResult.reason);
        toast({
          title: "Failed to load licenses",
          description: licensesResult.reason.message,
          variant: "destructive",
        });
      }

      if (appsResult.status === "fulfilled") {
        setApplications(appsResult.value || []);
      }

      if (plansResult.status === "fulfilled") {
        setPlans(plansResult.value || []);
      }

      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("[Licenses] Critical error fetching data:", error);
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
    console.log("[Licenses] Component mounted, fetching data...");
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!appId) {
      toast({
        title: "Select an application",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createLicenses({
        app_id: Number(appId),
        count: Number(count) || 1,
        duration_days: Number(durationDays) || 31,
        prefix: prefix || undefined,
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
      setPrefix("");
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

  const handleDelete = async (id: string | number) => {
    try {
      await deleteLicense(id.toString());
      toast({ title: "License deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!deleteMode) {
      toast({
        title: "Select a deletion mode",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Import the bulk delete function
      const { deleteLicensesBulk } = await import("@/lib/api");

      console.log(`[Bulk Delete] Deleting mode: ${deleteMode}`);

      // Call the bulk delete API endpoint
      const result = await deleteLicensesBulk(deleteMode as "all" | "unused" | "used");

      toast({
        title: "Success",
        description: result.message || "Licenses deleted successfully",
      });

      setBulkDeleteOpen(false);
      setDeleteMode("");
      // Refresh the list
      await fetchData();
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Failed to delete",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetHwid = async (key: string) => {
    try {
      await resetHwid(key);
      toast({ title: "HWID reset successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to reset HWID",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, kind: "key" | "hwid" = "key", itemId?: number) => {
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
        description: kind === "key" ? "License key copied" : "HWID copied"
      });
    } catch (error) {
      console.error("Copy error:", error);
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

  const getDeleteCount = () => {
    if (deleteMode === "all") return licenses.length;
    if (deleteMode === "unused") return unusedLicenses;
    if (deleteMode === "used") return usedLicenses;
    return 0;
  };

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
    const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <button
        onClick={() => openLicenseInfo(license)}
        className="w-full text-left group"
      >
        <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-md p-5 space-y-4 transition-all duration-300 hover:border-emerald-500/40 shadow-xl group-active:scale-[0.98]">
          {/* Header: Product + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/5">
                <Box className="h-5 w-5 text-emerald-500/80" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-tight truncate leading-none">
                  {license.app_name || applications.find(p => String(p.id) === String(license.app_id))?.name || `App #${license.app_id}`}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0 h-4">
                    ID: {license.id}
                  </Badge>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-2 rounded-lg border",
              !isUsed ? "bg-zinc-900 text-zinc-600 border-zinc-800" :
                isActive ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" :
                  "bg-red-500/5 text-red-500 border-red-500/20"
            )}>
              {isActive ? <Check className="h-3.5 w-3.5" /> : !isUsed ? <Key className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </div>
          </div>

          {/* License Key Section */}
          <div className="relative group/key bg-black/40 border border-zinc-800/50 rounded-xl p-3 flex items-center justify-between transition-colors hover:border-zinc-700">
            <code className="text-[11px] font-mono text-zinc-300 truncate tracking-tight pr-4">
              {license.license_key}
            </code>
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="p-1.5 rounded-lg text-zinc-700 transition-colors group-hover/key:text-zinc-400"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(license.license_key, 'key', license.id);
                }}
              >
                {copiedItems.has(`${license.id}-key`) ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-800 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Timing & Flow Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Entry Date</span>
              <span className="text-[10px] font-bold text-white mt-0.5">
                {new Date(license.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {expiryDate && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Expiration</span>
                <span className={cn(
                  "text-[10px] font-bold mt-0.5",
                  isExpired ? "text-red-500" : "text-emerald-500"
                )}>
                  {isExpired ? "DEACTIVATED" : `${Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} DAYS`}
                </span>
              </div>
            )}
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
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <code className="font-mono text-sm bg-black/40 px-4 py-2.5 rounded-lg block break-all text-zinc-300">
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
                copyToClipboard(license.license_key, 'key', license.id);
              }}
              title="Copy license key"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
    {
      key: "app",
      header: "Application",
      render: (license: License) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-emerald-400">
              {((license.app_name || applications.find(a => String(a.id) === String(license.app_id))?.name) || `App #${license.app_id}`).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-white">{license.app_name || applications.find(a => String(a.id) === String(license.app_id))?.name || `App #${license.app_id}`}</span>
            {license.plan_name && <span className="text-xs text-zinc-500">Plan: {license.plan_name}</span>}
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
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="View details"
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
              className="h-9 w-9 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              title="Reset HWID"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(license.id.toString());
            }}
            className="h-9 w-9 text-destructive hover:bg-red-500/10"
            title="Delete license"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="License Management"
      subtitle="Create, manage, and track your application licenses"
    >


      <div className="space-y-8 transition-all duration-300">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Key className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Inventory Control</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{licenses.length} Registered Keys</h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Asset", value: licenses.length, icon: Key, color: "zinc", delay: '0ms' },
            { label: "Used Nodes", value: usedLicenses, icon: Shield, color: "emerald", delay: '75ms' },
            { label: "Active Links", value: activeLicenses, icon: Check, color: "blue", delay: '150ms' },
            { label: "Stock Reserve", value: unusedLicenses, icon: Key, color: "zinc", delay: '225ms' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-xl animate-card-in backdrop-blur-md hover:border-white/10 transition-all duration-300 shadow-xl shadow-black/20"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate mr-1">{stat.label}</p>
                <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 opacity-60 flex-shrink-0", `text-${stat.color}-500`)} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">{stat.value}</p>
              <div className="mt-3 sm:mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={cn("h-full opacity-40", `bg-${stat.color}-500`)}
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          ))}
        </div>

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

          <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20">
            {/* Create Button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 md:h-10 w-9 md:w-10 hover:bg-emerald-500/10 hover:text-emerald-400 flex-shrink-0 text-zinc-500 transition-all active:scale-95"
                  title="Create licenses"
                >
                  <Plus className="h-4.25 w-4.25" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-white/10 bg-black/90 backdrop-blur-2xl">
                <ErrorBoundary>
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Create Licenses</DialogTitle>
                    <DialogDescription className="text-zinc-400">Application Provisioning: Define a new tier for your application access.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div className="grid gap-2">
                      <Label className="text-zinc-300 font-semibold">Target Application</Label>
                      <Select value={appId} onValueChange={(val) => setAppId(String(val || ""))}>
                        <SelectTrigger className="bg-black/40 h-11 border-zinc-800 rounded-xl text-white focus:ring-emerald-500/20 transition-all">
                          <SelectValue placeholder="Select Application" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 rounded-xl">
                          {applications.map((app) => (
                            <SelectItem key={app.id} value={String(app.id)} className="text-zinc-400 focus:bg-emerald-500/10 focus:text-emerald-400">
                              {app.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-zinc-300 font-semibold">Subscription Plan</Label>
                      <Select value={selectedPlanId == null ? "none" : String(selectedPlanId)} onValueChange={(val) => setSelectedPlanId(val === "none" ? null : Number(val))}>
                        <SelectTrigger className="bg-black/40 h-11 border-zinc-800 rounded-xl text-white focus:ring-emerald-500/20 transition-all">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 rounded-xl">
                          <SelectItem value="none" className="text-zinc-500 focus:bg-emerald-500/10 focus:text-emerald-400">No Plan (Default)</SelectItem>
                          {plans.filter(p => String(p.app_id) === String(appId)).map((plan) => (
                            <SelectItem key={plan.id} value={String(plan.id)} className="text-zinc-400 focus:bg-emerald-500/10 focus:text-emerald-400">
                              {plan.name} (Lvl {plan.level})
                            </SelectItem>
                          ))}
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
                          onChange={(e) => setCount(e.target.value)}
                          className="bg-black/40 h-11 border-zinc-800 rounded-xl text-white focus:border-emerald-500 transition-all font-semibold"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-zinc-300 font-semibold">Days</Label>
                        <Input
                          type="number"
                          min={1}
                          value={durationDays}
                          onChange={(e) => setDurationDays(e.target.value)}
                          className="bg-black/40 h-11 border-zinc-800 rounded-xl text-white focus:border-emerald-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-zinc-300 font-semibold">Key Prefix</Label>
                      <Input
                        placeholder="Optional prefix..."
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="bg-black/40 h-11 border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 transition-all font-semibold uppercase"
                      />
                    </div>

                    <Button
                      onClick={handleCreate}
                      disabled={isCreating || !appId}
                      className="w-full h-12 bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/5 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Generate {count} License{Number(count) > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </ErrorBoundary>
              </DialogContent>
            </Dialog>

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
              onClick={fetchData}
              disabled={isLoading}
              className="h-9 md:h-10 w-9 md:w-10 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
            >
              <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-emerald-500 transition-colors", isLoading && "animate-spin")} />
            </Button>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* Delete */}
            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 md:h-10 w-9 md:w-10 hover:bg-red-500/10 hover:text-red-400 flex-shrink-0 text-zinc-500 transition-all active:scale-95"
                  title="Delete licenses"
                >
                  <Trash2 className="h-4.25 w-4.25" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl border-zinc-800 sm:max-w-md bg-zinc-950/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Delete License(s)</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">Deletion Mode</Label>
                    <Select value={deleteMode} onValueChange={(value: any) => setDeleteMode(value)}>
                      <SelectTrigger className="bg-black/40 h-11 border-zinc-800 text-white transition-all">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="all" className="text-white focus:bg-zinc-800">
                          Delete All ({licenses.length})
                        </SelectItem>
                        <SelectItem value="unused" className="text-white focus:bg-zinc-800">
                          Delete Unused ({unusedLicenses})
                        </SelectItem>
                        <SelectItem value="used" className="text-white focus:bg-zinc-800">
                          Delete Used ({usedLicenses})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {deleteMode && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400 font-medium">
                          This will permanently delete {getDeleteCount()} license(s). This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setBulkDeleteOpen(false);
                        setDeleteMode("");
                      }}
                      variant="outline"
                      className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkDelete}
                      disabled={isDeleting || !deleteMode}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isDeleting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterStatus !== "all") && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-zinc-500">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                <Search className="h-3 w-3" />
                {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterStatus !== "all" && (
              <Badge variant="secondary" className="gap-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                <Filter className="h-3 w-3" />
                {filterStatus}
                <button onClick={() => setFilterStatus("all")} className="ml-1 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Content - Mobile Cards or Desktop Table */}
        {isMobile ? (
          <div className="space-y-3">
            {isLoading ? (
              <LoadingSkeletons count={3} variant="card" />
            ) : filteredLicenses.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-md p-8 text-center">
                <p className="text-zinc-400 text-sm">No licenses found. Create your first license to get started!</p>
              </div>
            ) : (
              filteredLicenses.map((license) => (
                <MobileLicenseCard key={license.id} license={license} />
              ))
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden bg-black/40 backdrop-blur-md">
            <DataTable
              columns={columns}
              data={filteredLicenses}
              keyExtractor={(l) => l.id.toString()}
              isLoading={isLoading}
              emptyMessage="No licenses found. Create your first license to get started!"
            />
          </div>
        )}
      </div>

      {/* License Info Dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="w-[95vw] sm:w-full rounded-[1.5rem] sm:rounded-[2.5rem] border-white/10 sm:max-w-xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden bg-black/90 backdrop-blur-3xl p-0 shadow-2xl">
          <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[90vh]">
            {/* Tactical Header */}
            <div className="relative p-5 sm:p-8 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50">
              <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03] pointer-events-none">
                <Key className="h-32 w-32 sm:h-48 sm:w-48 -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 text-white" />
              </div>

              <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">License Entry</DialogTitle>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Registry ID: <span className="text-emerald-500/80">#{selectedLicense?.id}</span></p>
                </div>
              </div>
            </div>
            {selectedLicense && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar overflow-x-hidden">
                {/* License Key Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Activation Token</h4>
                  <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between transition-all hover:bg-zinc-900 hover:border-zinc-700">
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
                      onClick={() => copyToClipboard(selectedLicense.license_key, 'key', selectedLicense.id)}
                    >
                      {copiedItems.has(`${selectedLicense.id}-key`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Application Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Target Module</h4>
                  <div className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl sm:rounded-[1.5rem] hover:bg-zinc-900/50 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Box className="h-5 w-5 text-emerald-500/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white uppercase tracking-tight truncate">
                        {selectedLicense.app_name || applications.find(a => String(a.id) === String(selectedLicense.app_id))?.name || `App #${selectedLicense.app_id}`}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Application Core</p>
                    </div>
                  </div>
                </div>

                {/* Status & Timing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Security Status</h4>
                    <div className={cn(
                      "flex items-center justify-center h-12 rounded-xl border font-bold text-[10px] uppercase tracking-[0.2em]",
                      !selectedLicense.hwid ? "bg-zinc-900/50 text-zinc-500 border-zinc-800/50" :
                        selectedLicense.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" :
                          "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                    )}>
                      {!selectedLicense.hwid ? "Available" : (selectedLicense.is_active ? "Active Link" : "Link Expired")}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Manifest Date</h4>
                    <div className="flex items-center justify-center h-12 rounded-xl bg-zinc-900/30 border border-zinc-800/50 text-white font-bold text-[10px] tracking-widest">
                      {new Date(selectedLicense.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* HWID Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Node Identity (HWID)</h4>
                  {selectedLicense.hwid ? (
                    <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-between transition-all hover:bg-zinc-900 hover:border-zinc-700">
                      <div className="flex-1 min-w-0 mr-3">
                        <code className="text-[11px] font-mono text-zinc-400 block break-all bg-black/20 p-3 rounded-xl border border-zinc-800/30">
                          {selectedLicense.hwid}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-10 w-10 flex-shrink-0 rounded-xl transition-all",
                          copiedItems.has(`${selectedLicense.id}-hwid`)
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500"
                        )}
                        onClick={() => copyToClipboard(selectedLicense.hwid || '', 'hwid', selectedLicense.id)}
                      >
                        {copiedItems.has(`${selectedLicense.id}-hwid`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                      <div className="text-center">
                        <Shield className="h-6 w-6 text-zinc-800 mx-auto mb-2 opacity-50" />
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Node unassigned</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Expiry Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Evolution Expiry</h4>
                    {selectedLicense.expiry_timestamp ? (
                      <div className="px-4 py-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                        <div className="text-xs font-bold text-white uppercase tracking-tight">
                          {new Date(selectedLicense.expiry_timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest mt-1">
                          {new Date(selectedLicense.expiry_timestamp) < new Date()
                            ? "Expired"
                            : `${Math.ceil((new Date(selectedLicense.expiry_timestamp).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Cycle Left`}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center px-4 h-12 rounded-xl bg-zinc-900/30 border border-emerald-500/10 text-emerald-500 font-bold text-[10px] tracking-widest uppercase">
                        Perpetual Link
                      </div>
                    )}
                  </div>

                  {/* User ID Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Assigned Node ID</h4>
                    <div className="flex items-center justify-center px-4 h-12 rounded-xl bg-zinc-900/30 border border-zinc-800/50 text-white font-mono text-[10px] font-bold tracking-widest">
                      {selectedLicense.user_id || "UNLINKED"}
                    </div>
                  </div>
                </div>

                {/* Action Control Panel */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  {selectedLicense.hwid && (
                    <Button
                      onClick={() => {
                        handleResetHwid(selectedLicense.license_key);
                        setInfoOpen(false);
                      }}
                      className="w-full sm:flex-1 h-12 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Reset Node Identity
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      handleDelete(selectedLicense.id.toString());
                      setInfoOpen(false);
                    }}
                    className="w-full sm:flex-1 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Permanent Wipe
                  </Button>
                  <Button
                    onClick={() => setInfoOpen(false)}
                    className="sm:hidden w-full h-12 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Close Registry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
