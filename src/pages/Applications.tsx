import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Edit,
  AppWindow,
  Copy,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  CheckCircle,
  Search,
  AlertCircle,
  Share2,
  MoreVertical,
  Calendar,
  Code,
  Zap,
  ExternalLink,
  Box,
  X,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  name: string;
  secret?: string;
  version: string;
  force_update: boolean;
  created_at: string;
}

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [forceUpdate, setForceUpdate] = useState(false);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const appsData = await getApplications();
      setApps(appsData || []);
    } catch (error: any) {
      toast({
        title: "Failed to load applications",
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
      await fetchApps();
      setLastUpdated(new Date());
      toast({ title: "Applications refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Application name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editApp) {
        await updateApplication(editApp.id, {
          name,
          version,
          force_update: forceUpdate,
        });
        toast({ title: "Application updated successfully" });
      } else {
        await createApplication({
          name,
          version,
          force_update: forceUpdate,
        });
        toast({ title: "Application created successfully" });
      }
      setDialogOpen(false);
      resetForm();
      fetchApps();
    } catch (error: any) {
      toast({
        title: editApp ? "Failed to update" : "Failed to create",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedApp) return;
    try {
      await deleteApplication(selectedApp.id);
      toast({ title: "Application deleted successfully" });
      setDeleteDialogOpen(false);
      fetchApps();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleForceUpdate = async (app: Application) => {
    setTogglingId(app.id);
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL}/api/admin/apps/${app.id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: app.name,
          version: app.version,
          force_update: !app.force_update,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      await fetchApps();

      toast({
        title: "Success",
        description: `Force update ${!app.force_update ? "enabled" : "disabled"}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to toggle",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const resetForm = () => {
    setName("");
    setVersion("1.0.0");
    setForceUpdate(false);
    setEditApp(null);
  };

  const openEdit = (app: Application) => {
    setEditApp(app);
    setName(app.name);
    setVersion(app.version);
    setForceUpdate(app.force_update);
    setDialogOpen(true);
  };

  const copyToClipboard = async (text: string, appId: string) => {
    try {
      if (!text) {
        toast({
          title: "Error",
          description: "Nothing to copy",
          variant: "destructive",
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedId(appId);
          toast({
            title: "Copied!",
            description: "Secret copied to clipboard",
          });
          setTimeout(() => setCopiedId(null), 2000);
          return;
        } catch (err) {
          console.warn("Clipboard API failed, trying fallback:", err);
        }
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      textArea.select();
      textArea.setSelectionRange(0, 99999);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopiedId(appId);
        toast({
          title: "Copied!",
          description: "Secret copied to clipboard",
        });
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.version.includes(searchQuery)
  );

  const toggleSecretVisibility = (appId: string) => {
    setShowSecret((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Applications">
        <LoadingSkeletons count={6} variant="card" />
      </DashboardLayout>
    );
  }

  const activeApps = apps.filter((app) => !app.force_update).length;
  const updatePendingApps = apps.filter((app) => app.force_update).length;

  return (
    <DashboardLayout
      title="Applications"
      subtitle="Manage and monitor your protected applications"
    >

      <div className="space-y-6 transition-all duration-300">

        {/* Top Summary Bar (Clean Version) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 sm:p-5 rounded-xl bg-black/40 border border-white/5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <AppWindow className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Application Engine</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal">{apps.length} Active Modules</h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: "Total Assets", value: apps.length, icon: Box, color: "text-zinc-300", delay: '0ms' },
            { label: "Operational", value: activeApps, icon: CheckCircle, color: "text-emerald-500", delay: '75ms' },
            { label: "Critical", value: updatePendingApps, icon: AlertCircle, color: "text-red-500", delay: '150ms' },
            { label: "Registry Sync", value: formatDate(apps[0]?.created_at || new Date().toISOString()).split(" ")[0], icon: Calendar, color: "text-zinc-500", delay: '225ms' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-black/40 border border-white/5 p-5 rounded-xl backdrop-blur-md hover:bg-black/60 hover:border-white/10 transition-all duration-300"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate mr-1">{stat.label}</p>
                <stat.icon className={cn("h-4 w-4 opacity-60 flex-shrink-0", stat.color)} />
              </div>
              <p className={cn("text-2xl font-bold tracking-normal", stat.color)}>{stat.value}</p>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full opacity-40", stat.color.replace('text-', 'bg-'))}
                  style={{ width: '45%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Command Bar (Like Licenses/Users) */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-black/40 border-white/5 h-11 text-white placeholder:text-zinc-600 rounded-xl transition-all hover:bg-black/60 focus:bg-black/80"
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

          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-lg shadow-black/20 backdrop-blur-md">
            {/* Create Button */}
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500 transition-all active:scale-95"
                  title="Create Application"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-zinc-950/95 border-zinc-800 backdrop-blur-xl rounded-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl text-white">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <AppWindow className="h-5 w-5 text-emerald-500" />
                    </div>
                    {editApp ? "Modify Application" : "Provision Application"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name" className="text-sm font-semibold text-zinc-300">
                      Name Identifier
                    </Label>
                    <Input
                      id="app-name"
                      placeholder="e.g. Emerite Core"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/40 border-zinc-800 text-white rounded-lg h-11 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-version" className="text-sm font-semibold text-zinc-300">
                      Operational Version
                    </Label>
                    <Input
                      id="app-version"
                      placeholder="1.0.0"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="bg-black/40 border-zinc-800 text-white rounded-lg h-11 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-500">Critical Force Update</span>
                    </div>
                    <Switch
                      checked={forceUpdate}
                      onCheckedChange={setForceUpdate}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-base border-0 h-12 rounded-xl transition-all active:scale-[0.98] mt-2"
                  >
                    {editApp ? "Commit Changes" : "Create Application"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* View Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="h-10 w-10 hover:bg-zinc-800/50 text-zinc-500 transition-all active:scale-95"
              title={viewMode === "grid" ? "List View" : "Grid View"}
            >
              {viewMode === "grid" ? <Code className="h-4.5 w-4.5" /> : <LayoutGrid className="h-4.5 w-4.5" />}
            </Button>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* Sync Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 hover:bg-zinc-800/50 text-zinc-500 transition-all active:scale-95 group"
              title="Sync Registry"
            >
              <RefreshCw className={cn("h-4.5 w-4.5 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Applications Grid/List */}
        {filteredApps.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="group relative bg-black/40 rounded-xl border border-white/5 hover:border-emerald-500/50 p-6 transition-all duration-300 hover:bg-black/60 overflow-hidden backdrop-blur-md"
                >
                  <div className="relative space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                          {app.name}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-500 mt-1">
                          OS_VER_{app.version.replace(/\./g, '_')}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(app)} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApp(app);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deconstruct
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          app.force_update ? "destructive" : "secondary"
                        }
                        className={cn(
                          "font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-tighter",
                          !app.force_update && "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                        )}
                      >
                        {app.force_update ? "Update Required" : "Operational"}
                      </Badge>
                      {app.force_update && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleForceUpdate(app)}
                          disabled={togglingId === app.id}
                          className="h-6 text-[10px] border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold px-2 rounded"
                        >
                          {togglingId === app.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            "CLEAR LOCK"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Secret Section */}
                    {app.secret && (
                      <div className="p-3.5 rounded-xl bg-black/30 border border-zinc-800/50 space-y-2.5">
                        <Label className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                          Access Key Identifier
                        </Label>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono bg-black/40 px-3 py-2 rounded-lg flex-1 truncate border border-zinc-800 text-zinc-400">
                            {showSecret[app.id]
                              ? app.secret
                              : "ID_" + app.id.toString().substring(0, 8).toUpperCase() + "_•••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg"
                            onClick={() => toggleSecretVisibility(app.id)}
                          >
                            {showSecret[app.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-lg transition-all",
                              copiedId === app.id ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-zinc-800 text-zinc-500 hover:text-white"
                            )}
                            onClick={() =>
                              copyToClipboard(app.secret || "", app.id)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="text-[11px] text-zinc-600 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
                      <span>Registry Entry</span>
                      <span>{formatDate(app.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 bg-zinc-900/20">
                <div className="col-span-4">Identifier</div>
                <div className="col-span-2">Telemetry</div>
                <div className="col-span-2">Integrity</div>
                <div className="col-span-2">Access Cache</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="group px-6 py-4 hover:bg-zinc-800/20 transition-all grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-12 md:col-span-4 min-w-0">
                      <p className="font-bold text-sm text-white truncate">
                        {app.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {app.id.substring(0, 12)}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <span className="text-xs font-mono text-emerald-500">v{app.version}</span>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Badge
                        variant={
                          app.force_update ? "destructive" : "secondary"
                        }
                        className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0 rounded",
                          !app.force_update && "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                        )}
                      >
                        {app.force_update ? "Critical" : "Nominal"}
                      </Badge>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      {app.secret && (
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono bg-black/40 px-2 py-1 rounded truncate text-zinc-500 border border-zinc-800">
                            {showSecret[app.id]
                              ? app.secret.substring(0, 8) + "..."
                              : "••••••••"}
                          </code>
                          <button
                            onClick={() => copyToClipboard(app.secret || "", app.id)}
                            className="text-zinc-600 hover:text-white transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(app)}
                        className="h-8 text-[11px] text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Modify
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 rounded-xl">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApp(app);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-20 text-center bg-black/20 border border-dashed border-white/5 rounded-xl backdrop-blur-md">
            <div className="h-16 w-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <AppWindow className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Application Records</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-8">
              The registry is currently empty. Provision your first application to begin management.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold px-8 h-11 rounded-xl shadow-lg shadow-emerald-500/10"
            >
              Provision Application
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-950/95 border-zinc-800/60 backdrop-blur-2xl rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Deconstruct Application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You are about to initiate the deconstruction of{" "}
              <strong className="text-white">{selectedApp?.name}</strong>. This procedure is irreversible and will purge all associated telemetry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-[11px] text-red-400 leading-relaxed font-mono">
            {">>"} WARNING: PURGE_SEQUENCE_INITIALIZED
            <br />
            {">>"} ACTION: DELETE_ALL_APP_RECORDS
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white h-11 px-6 rounded-xl">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0 h-11 px-8 rounded-xl font-bold transition-all active:scale-95"
            >
              Confirm Purge
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
