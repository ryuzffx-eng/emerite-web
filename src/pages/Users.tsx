import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getUsers, deleteUser, banUser, unbanUser, getSubscriptionPlans, assignSubscriptionToUser, deleteUserSubscription, getApplications, pauseSubscription, resumeSubscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, UserCircle, Ban, ShieldCheck, Trash2, Eye, RefreshCw, Copy, Check, UserPlus, X, ChevronRight, ArrowRight, Zap, Clock, Globe, Search, Filter, Pause, Play } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn, formatIST } from "@/lib/utils";

interface Subscription {
  id?: number;
  name: string;
  expires_at?: string;
  app_name?: string | null;
  app_id?: number | null;
}

interface Application { id: number; name: string; }

interface User {
  id: number;
  username: string;
  email?: string;
  license_key?: string;
  subscription_name?: string;
  subscriptions?: Subscription[];
  expiry_timestamp?: string;
  account_creation_date: string;
  last_login_time?: string;
  is_banned: boolean;
  ban_reason?: string;
  user_id?: number;
  created_by_reseller_id?: number;
  reseller_name?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const selectedUser = users.find(u => u.id === selectedUserId) || null;
  const [banReason, setBanReason] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [plans, setPlans] = useState<{ id: number; app_id: number; app_name?: string; name: string; level: number }[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [assignDuration, setAssignDuration] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; username: string }>({
    open: false,
    id: null,
    username: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, subscriptionId: null as number | null, subscriptionName: "" });
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "banned">("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessingAssignment, setIsProcessingAssignment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("[Users] Fetch error:", error);
      toast({
        title: "Failed to load users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Fetch non-critical data in background
    const fetchBackgroundData = async () => {
      try {
        const [pResult, aResult] = await Promise.allSettled([
          getSubscriptionPlans(),
          getApplications()
        ]);

        if (pResult.status === "fulfilled") setPlans(pResult.value || []);
        if (aResult.status === "fulfilled") setApplications(aResult.value || []);
      } catch (err) {
        console.error("[Users] Background fetch error:", err);
      }
    };

    fetchBackgroundData();
  }, []);

  const copyToClipboard = (text: string, kind: "username" | "license" = "username", itemId?: string | number) => {
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
      document.body.appendChild(textarea);
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
        description: kind === "username" ? "Username copied" : "License key copied"
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

  const handleDelete = async (id: number, username: string) => {
    setDeleteConfirm({ open: true, id, username });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id === null) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteConfirm.id.toString());
      toast({ title: "User deleted" });
      setDeleteConfirm({ open: false, id: null, username: "" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      await banUser(selectedUser.id.toString(), banReason);
      toast({ title: "User banned" });
      setBanDialogOpen(false);
      setBanReason("");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Failed to ban user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnban = async (id: number) => {
    try {
      await unbanUser(id.toString());
      toast({ title: "User unbanned" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Failed to unban user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    await fetchUsers();
  };

  const handleTogglePause = async (subscription: Subscription) => {
    if (!subscription.id) return;
    const isPaused = subscription.name.endsWith(" (paused)");
    try {
      if (isPaused) {
        await resumeSubscription({ subscription_id: subscription.id });
        toast({ title: "Subscription Resumed" });
      } else {
        await pauseSubscription({ subscription_id: subscription.id });
        toast({ title: "Subscription Paused" });
      }
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Operation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const MobileUserCard = ({ user }: { user: User }) => {
    const isLicenseFallback = user.username.startsWith("license_");

    return (
      <button
        onClick={() => {
          setSelectedUserId(user.id);
          setDetailsOpen(true);
        }}
        className="w-full text-left group"
      >
        <div className="rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md p-5 space-y-4 transition-all duration-300 hover:border-zinc-700 shadow-xl group-active:scale-[0.98]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isLicenseFallback
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                <UsersIcon className={`h-5 w-5 ${isLicenseFallback ? 'text-yellow-500' : 'text-emerald-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${isLicenseFallback ? 'text-yellow-400' : 'text-white'
                  }`}>
                  {user.username}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-[10px] text-zinc-500 font-medium tracking-tight">ID #{user.id}</p>
                </div>
              </div>
            </div>
            <div className={cn(
              "h-7 px-3 rounded-lg flex items-center gap-1.5 border transition-colors",
              user.is_banned
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
              {user.is_banned ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              <span className="text-[10px] font-semibold uppercase tracking-tight">{user.is_banned ? "BANNED" : "ACTIVE"}</span>
            </div>
          </div>

          {user.license_key && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Security Key</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <code className="font-mono text-xs bg-black/40 px-4 py-3 rounded-xl block break-all text-zinc-300 border border-zinc-800/50">
                    {user.license_key}
                  </code>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(user.license_key || '', 'license', user.id);
                  }}
                  variant="ghost"
                  className={cn(
                    "h-10 w-10 p-0 rounded-xl transition-all active:scale-90",
                    copiedItems.has(`${user.id}-license`)
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-white"
                  )}
                >
                  {copiedItems.has(`${user.id}-license`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {(user.subscriptions && user.subscriptions.length > 0 || user.subscription_name) && (
            <div className="space-y-2 pt-2 border-t border-zinc-800/50">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Active Protocols</p>
              <div className="grid grid-cols-1 gap-1.5 px-1">
                {user.subscriptions && user.subscriptions.length > 0
                  ? user.subscriptions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-emerald-500/60" />
                      <span className="text-xs font-medium text-zinc-300 truncate">{s.name}{s.app_name || (applications.find(a => a.id === s.app_id)?.name) ? ` (${s.app_name || applications.find(a => a.id === s.app_id)?.name})` : ''}</span>
                    </div>
                  ))
                  : <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-emerald-500/60" />
                    <span className="text-xs font-medium text-zinc-300">{user.subscription_name}</span>
                  </div>
                }
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 px-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Joined {new Date(user.account_creation_date).toLocaleDateString()}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </button>
    );
  };

  const columns = [
    {
      key: "username",
      header: "PC Username",
      render: (user: User) => {
        const isLicenseFallback = user.username.startsWith("license_");
        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLicenseFallback ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
              <UsersIcon className={`h-4 w-4 ${isLicenseFallback ? 'text-yellow-500' : 'text-emerald-500'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold text-sm ${isLicenseFallback ? 'text-yellow-400' : 'text-white'}`}>{user.username}</span>
              {(user.subscriptions && user.subscriptions.length > 0 || user.subscription_name) && (
                <span className="text-[10px] font-medium text-zinc-500 tracking-tight mt-0.5">
                  {(user.subscriptions && user.subscriptions.length > 0)
                    ? user.subscriptions.map(s => `${s.name}${(s.app_name || (applications.find(a => a.id === s.app_id)?.name)) ? ` (${s.app_name || applications.find(a => a.id === s.app_id)?.name})` : ''}`).join(', ')
                    : user.subscription_name}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "license",
      header: "License Key",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.license_key ? (
            <>
              <div className="flex-1 min-w-0">
                <code className="font-mono text-sm bg-black/40 px-4 py-2.5 rounded-lg block break-all text-zinc-300">
                  {user.license_key}
                </code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 transition-all flex-shrink-0 hover:bg-zinc-800 text-zinc-400 hover:text-white",
                  copiedItems.has(`${user.id}-license`) && "bg-emerald-500/20 text-emerald-300"
                )}
                onClick={(e) => { e.stopPropagation(); copyToClipboard(user.license_key || '', 'license', user.id); }}
              >
                {copiedItems.has(`${user.id}-license`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </>
          ) : <span className="text-[10px] font-bold text-zinc-700 tracking-widest bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-800/50">UNASSIGNED</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <div className={cn(
          "h-7 px-3 rounded-lg flex items-center gap-1.5 border transition-all w-fit",
          user.is_banned ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        )}>
          {user.is_banned ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
          <span className="text-[10px] font-semibold uppercase tracking-tight">{user.is_banned ? "BANNED" : "ACTIVE"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (user: User) => (
        <div className="flex justify-end pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all"
            onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id); setDetailsOpen(true); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.license_key?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "active") return matchesSearch && !user.is_banned;
    if (activeTab === "banned") return matchesSearch && user.is_banned;
    return matchesSearch;
  });

  const bannedUsersCount = users.filter(u => u.is_banned).length;
  const activeUsersCount = users.filter(u => !u.is_banned).length;

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Comprehensive user base and account access control"
    >


      <div className="space-y-8 transition-all duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">User Database</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{users.length} Registered Users</h2>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Users", value: activeUsersCount, icon: Check, color: "emerald", delay: '0ms' },
            { label: "Banned Users", value: bannedUsersCount, icon: Ban, color: "red", delay: '100ms' },
            { label: "Subscribed", value: users.reduce((acc, u) => acc + (u.subscriptions?.length || 0), 0), icon: ShieldCheck, color: "blue", delay: '200ms' },
            { label: "Reseller Linked", value: users.filter(u => u.created_by_reseller_id).length, icon: RefreshCw, color: "yellow", delay: '300ms' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#111111]/80 border border-zinc-800/80 p-4 sm:p-5 rounded-xl backdrop-blur-md hover:border-zinc-700 transition-all duration-300 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest truncate mr-1">{stat.label}</p>
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-zinc-900/50 border-zinc-800 h-10 md:h-12 text-white placeholder:text-zinc-600 rounded-xl transition-all"
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
            {/* Filter Tabs as Select for consistency or keep as tabs? User said "bar like first image" */}
            <Select value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <SelectTrigger className="h-9 md:h-10 border-0 bg-transparent hover:bg-zinc-800/50 px-2 w-auto gap-1 [&>svg]:h-4 [&>svg]:w-4 flex-shrink-0 text-zinc-500 transition-all">
                <Filter className="h-4.25 w-4.25" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-white focus:bg-zinc-800">All Accounts</SelectItem>
                <SelectItem value="active" className="text-white focus:bg-zinc-800">Active Only</SelectItem>
                <SelectItem value="banned" className="text-white focus:bg-zinc-800">Banned Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

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

        {/* Status Filter Tabs - Removed as per user request to use bar like image */}
        <div className="space-y-4">


          <div className="relative">
            {isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                  <LoadingSkeletons count={3} variant="card" />
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md">
                    <UsersIcon className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">No matching nodes found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-[#111111]/80 backdrop-blur-md shadow-2xl">
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  keyExtractor={(u) => u.id.toString()}
                  isLoading={isLoading}
                  emptyMessage="Empty Node Network"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ban Dialog */}
        <ErrorBoundary>
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogContent className="rounded-xl border-zinc-800 sm:max-w-md bg-zinc-950/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-white">Ban User: {selectedUser?.username}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Ban Reason</Label>
                  <Input
                    placeholder="Enter reason for ban"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="bg-black/40 border-zinc-800 text-white transition-all"
                  />
                </div>
                <Button
                  onClick={handleBan}
                  className="w-full"
                  variant="destructive"
                >
                  Confirm Ban
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>

        {/* User Details Dialog - REDESIGNED */}
        <ErrorBoundary>
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="w-[95vw] sm:w-full rounded-xl border-zinc-800 sm:max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden bg-zinc-950/98 backdrop-blur-3xl p-0 shadow-2xl">
              <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[90vh]">
                {/* Profile Header */}
                <div className="relative p-5 sm:p-10 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50">
                  <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-[0.02] pointer-events-none">
                    <UserCircle className="h-32 w-32 sm:h-64 sm:w-64 -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 text-white" />
                  </div>

                  <div className="relative z-10 flex items-center gap-4 sm:gap-8">
                    <div className="relative group">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        <UsersIcon className="h-7 w-7 sm:h-10 sm:w-10 text-emerald-500" />
                      </div>
                      <div className={cn(
                        "absolute -bottom-2 -right-2 h-8 w-8 rounded-xl flex items-center justify-center border-2 border-zinc-950 shadow-xl",
                        selectedUser?.is_banned ? "bg-red-500 text-white" : "bg-emerald-500 text-black"
                      )}>
                        {selectedUser?.is_banned ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 stroke-[3px]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <h2 className="text-lg sm:text-3xl font-black text-white tracking-tighter uppercase truncate leading-none">{selectedUser?.username}</h2>
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[8px] sm:text-[10px] font-bold tracking-wide uppercase px-1.5 py-0">ID: {selectedUser?.id}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Joined {formatIST(selectedUser?.account_creation_date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        {selectedUser?.created_by_reseller_id && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <RefreshCw className="h-3 w-3 text-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Linked: {selectedUser.reseller_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar overflow-x-hidden">
                  {/* Credentials Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">PC Identity</h4>
                      <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 sm:p-4 flex items-center justify-between transition-all hover:bg-zinc-900 hover:border-zinc-700">
                        <code className="text-xs font-mono text-zinc-300 truncate mr-4">{selectedUser?.username}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500 transition-colors"
                          onClick={() => copyToClipboard(selectedUser?.username || '', 'username', selectedUser?.id)}
                        >
                          {copiedItems.has(`${selectedUser?.id}-username`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Authentication Key</h4>
                      <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-2 sm:p-3 flex items-center justify-between transition-all hover:bg-zinc-900 hover:border-zinc-700">
                        <div className="flex-1 min-w-0 mr-3">
                          <code className="text-sm font-mono text-zinc-300 block break-all bg-black/20 p-3 rounded-xl border border-zinc-800/30">
                            {selectedUser?.license_key || 'UNASSIGNED'}
                          </code>
                        </div>
                        {selectedUser?.license_key && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-10 w-10 flex-shrink-0 rounded-xl transition-all",
                              copiedItems.has(`${selectedUser?.id}-license`)
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-500"
                            )}
                            onClick={() => copyToClipboard(selectedUser?.license_key || '', 'license', selectedUser?.id)}
                          >
                            {copiedItems.has(`${selectedUser?.id}-license`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Status (Subscriptions) */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-1">
                      <h4 className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Subscriptions</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAssignDialogOpen(true)}
                        className="h-9 sm:h-8 px-4 rounded-lg sm:rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-[10px] sm:text-xs transition-all active:scale-95 uppercase tracking-widest"
                      >
                        <UserPlus className="mr-2 h-3.5 w-3.5 stroke-[3px]" />
                        Deploy New
                      </Button>
                    </div>

                    {(selectedUser?.subscriptions && selectedUser.subscriptions.length > 0) ? (
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUser.subscriptions.map((sub) => (
                          <div key={sub.id} className="group relative flex items-center justify-between p-3.5 sm:p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700/50 transition-all hover:bg-zinc-900/50">
                            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-center shrink-0">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">{sub.name}</p>
                                <p className="text-[9px] sm:text-xs font-medium text-zinc-600 uppercase tracking-widest mt-0.5 truncate">{sub.app_name || "Nexus System"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <p className="text-[9px] sm:text-xs font-medium text-zinc-500 uppercase">Expiration Node</p>
                                <p className={cn(
                                  "text-[9px] sm:text-xs font-bold uppercase mt-0.5 font-mono",
                                  sub.name.endsWith(" (paused)") ? "text-yellow-500" : "text-emerald-500/80"
                                )}>
                                  {sub.name.endsWith(" (paused)") ? "SUSPENDED" : (sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'PERPETUAL')}
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-9 w-9 rounded-xl transition-all",
                                  sub.name.endsWith(" (paused)")
                                    ? "hover:bg-emerald-500/10 text-emerald-500"
                                    : "hover:bg-yellow-500/10 text-yellow-500"
                                )}
                                onClick={() => handleTogglePause(sub)}
                              >
                                {sub.name.endsWith(" (paused)") ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-zinc-700 hover:text-red-500 transition-all"
                                onClick={() => sub.id && setConfirmDialog({ open: true, subscriptionId: sub.id, subscriptionName: sub.name })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-center">
                        <Globe className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">No active entitlements found for this node</p>
                      </div>
                    )}
                  </div>

                  {/* Administrative Controls */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {selectedUser?.is_banned ? (
                      <Button
                        className="w-full sm:flex-1 h-12 sm:h-14 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 rounded-lg sm:rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                      >
                        RE-AUTHORIZE NODE
                      </Button>
                    ) : (
                      <Button
                        onClick={() => { setDetailsOpen(false); setBanDialogOpen(true); }}
                        className="w-full sm:flex-1 h-12 sm:h-14 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg sm:rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                      >
                        RESTRICT ACCESS
                      </Button>
                    )}
                    <div className="flex w-full sm:w-auto gap-2">
                      <Button
                        onClick={() => { setDetailsOpen(false); handleDelete(selectedUser!.id, selectedUser!.username); }}
                        variant="outline"
                        className="flex-1 sm:flex-none h-12 sm:h-14 sm:w-14 border-zinc-800 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-0"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest">Permanent Wipe</span>
                      </Button>
                      <Button
                        onClick={() => setDetailsOpen(false)}
                        variant="outline"
                        className="flex-1 sm:hidden h-12 border-zinc-800 hover:bg-zinc-800 text-zinc-600 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>

        {/* Assign Subscription Dialog - RE-ENGINEERED */}
        <ErrorBoundary>
          <Dialog open={assignDialogOpen} onOpenChange={(open) => { setAssignDialogOpen(open); if (!open) { setSelectedPlanId(null); setAssignDuration(""); setIsProcessingAssignment(false); } }}>
            <DialogContent className="w-[98vw] sm:w-full border-zinc-800 sm:max-w-2xl rounded-xl backdrop-blur-3xl bg-zinc-950/98 p-0 overflow-hidden shadow-2xl">
              <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[85vh]">
                {/* Header - Tactical Style */}
                <div className="p-4 sm:p-10 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50 relative shrink-0">
                  <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-[0.03] pointer-events-none">
                    <Zap className="h-24 w-24 sm:h-48 sm:w-48 -mr-6 -mt-6 sm:-mr-16 sm:-mt-16 text-white" />
                  </div>

                  <div className="relative z-10 flex items-center gap-3 sm:gap-6">
                    <div className="h-8 w-8 sm:h-14 sm:w-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shrink-0">
                      <Zap className="h-4 w-4 sm:h-7 sm:w-7 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="text-base sm:text-2xl font-bold tracking-tight text-white uppercase truncate">Assign Subscription</DialogTitle>
                      <p className="text-[7px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 truncate leading-tight">Sync node for: <span className="text-emerald-500/80">{selectedUser?.username}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar overflow-x-hidden">
                  {/* Plan Matrix */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 sm:gap-2">
                        <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AVAILABLE PROTOCOLS
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      {plans
                        .filter(p => !selectedUser?.subscriptions?.some(s => s.name === p.name && (s.app_id === p.app_id || s.app_name === p.app_name)))
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={cn(
                              "relative p-3 sm:p-5 text-left rounded-lg sm:rounded-xl border transition-all duration-300 group overflow-hidden bg-zinc-900/30",
                              selectedPlanId === p.id
                                ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20"
                                : "border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
                            )}
                          >
                            <div className="flex items-center sm:items-start gap-3 sm:gap-4 h-full relative z-10">
                              <div className={cn(
                                "h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-inner",
                                selectedPlanId === p.id ? "bg-emerald-500/20 border-emerald-500/30" : "bg-black/40 border-zinc-800 group-hover:border-zinc-700"
                              )}>
                                <Globe className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5 transition-colors duration-300", selectedPlanId === p.id ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400")} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] sm:text-sm font-bold text-white uppercase tracking-wide truncate group-hover:translate-x-0.5 transition-transform">{p.name}</p>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-2">
                                  <Badge className="bg-zinc-950/80 text-zinc-500 border-zinc-800 text-[6px] sm:text-[8px] font-bold uppercase tracking-wider px-1 sm:px-2 py-0 shrink-0">
                                    {p.app_name || "Nexus"}
                                  </Badge>
                                  <span className="text-[6px] sm:text-[8px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-800/50 px-1 sm:px-1.5 rounded shrink-0">LVL {p.level}</span>
                                </div>
                              </div>
                            </div>

                            {selectedPlanId === p.id && (
                              <div className="absolute top-0 right-0 p-1.5 sm:p-3">
                                <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-md sm:rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg transform rotate-12 scale-100 sm:scale-110">
                                  <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-black stroke-[4px]" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}

                      {plans.filter(p => !selectedUser?.subscriptions?.some(s => s.name === p.name && (s.app_id === p.app_id || s.app_name === p.app_name))).length === 0 && (
                        <div className="col-span-full py-6 sm:py-12 text-center rounded-xl sm:rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20">
                          <Check className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-500/20 mx-auto mb-2 sm:mb-4" />
                          <p className="text-[8px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">All protocols deployed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Control */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 sm:gap-2 px-1">
                      <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      TEMPORAL CONFIGURATION
                    </h4>

                    <div className="relative group bg-zinc-900/40 rounded-lg sm:rounded-xl border border-zinc-800/50 p-3 sm:p-6 space-y-4 sm:space-y-6 transition-all focus-within:border-emerald-500/30">
                      <div className="flex flex-col gap-2.5 sm:gap-4">
                        <div className="relative w-full">
                          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-zinc-600 group-focus-within:text-emerald-500 transition-colors">
                            <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                          </div>
                          <Input
                            type="number"
                            placeholder="PERMANENT NODE"
                            value={assignDuration}
                            onChange={(e) => setAssignDuration(e.target.value)}
                            className="h-10 sm:h-14 bg-zinc-950/50 border-zinc-800 focus:border-emerald-500/50 text-sm sm:text-xl font-bold text-white tracking-tight pl-10 sm:pl-16 rounded-lg sm:rounded-xl placeholder:text-zinc-800"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {[30, 90, 365].map(d => (
                            <button
                              key={d}
                              onClick={() => setAssignDuration(String(d))}
                              className={cn(
                                "h-9 sm:h-14 rounded-lg sm:rounded-xl border transition-all active:scale-95 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest",
                                assignDuration === String(d)
                                  ? "bg-emerald-500 text-black border-emerald-400 shadow-xl"
                                  : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 text-zinc-400"
                              )}
                            >
                              {d}D
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 px-1">
                        <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-zinc-800 shrink-0" />
                        <p className="text-[7px] sm:text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-tight">Perpetual entitlement if node remains null</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finalize Action */}
                <div className="p-4 sm:p-10 bg-zinc-900/30 border-t border-zinc-800/80 relative space-y-2.5 sm:space-y-4 mt-auto shrink-0">
                  <div className="absolute top-[-1px] left-0 w-12 sm:w-24 h-[1px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]" />

                  <Button
                    disabled={!selectedPlanId || isProcessingAssignment}
                    onClick={async () => {
                      if (!selectedUser || !selectedPlanId) return;
                      setIsProcessingAssignment(true);
                      try {
                        await assignSubscriptionToUser({
                          user_id: selectedUser.id,
                          plan_id: selectedPlanId,
                          duration_days: assignDuration ? Number(assignDuration) : null
                        });

                        toast({ title: '✓ DEPLOYMENT SUCCESSFUL', description: 'User permissions have been synchronized globally.' });
                        fetchUsers();
                        setAssignDialogOpen(false);
                      } catch (err: any) {
                        toast({ title: 'DEPLOYMENT FAILED', description: err.message, variant: 'destructive' });
                      } finally {
                        setIsProcessingAssignment(false);
                      }
                    }}
                    className="group relative w-full h-11 sm:h-16 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg sm:rounded-xl border-0 shadow-2xl shadow-emerald-500/10 active:scale-[0.98] font-bold text-[9px] sm:text-xs uppercase tracking-[0.1em] transition-all duration-500 overflow-hidden shrink-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-4">
                      {isProcessingAssignment ? (
                        <RefreshCw className="h-3.5 w-3.5 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <>
                          INITIALIZE DEPLOYMENT
                          <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </>
                      )}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setAssignDialogOpen(false)}
                    className="w-full h-7 sm:h-10 text-[7px] sm:text-[10px] font-bold text-zinc-600 hover:text-red-400 uppercase tracking-widest transition-colors gap-2 shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ABORT DEPLOYMENT SEQUENCE
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>

        <ConfirmDialog
          open={confirmDialog.open}
          title="PURGE ENTITLEMENT"
          description="This action will terminate the user's access to the specified service protocol immediately."
          message={`Confirm termination of "${confirmDialog.subscriptionName}" for ${selectedUser?.username}?`}
          confirmText="PURGE ACCESS"
          cancelText="MAINTAIN"
          variant="danger"
          isLoading={isDeletingSubscription}
          onConfirm={async () => {
            if (!selectedUser || !confirmDialog.subscriptionId) return;
            try {
              setIsDeletingSubscription(true);
              await deleteUserSubscription(selectedUser.id, confirmDialog.subscriptionId);
              toast({ title: "✓ ENTITLEMENT PURGED" });
              setConfirmDialog({ open: false, subscriptionId: null, subscriptionName: "" });
              await fetchUsers();
            } catch (error: any) {
              toast({ title: "PURGE FAILED", description: error.message, variant: "destructive" });
            } finally {
              setIsDeletingSubscription(false);
            }
          }}
          onCancel={() => setConfirmDialog({ open: false, subscriptionId: null, subscriptionName: "" })}
        />

        <ConfirmDialog
          open={deleteConfirm.open}
          title="TERMINATE NODE"
          description="Permanent deletion will wipe all node data and history from the Emerite Network. This action is irreversible."
          message={`Decommission account "${deleteConfirm.username}"?`}
          confirmText="DECOMMISSION"
          cancelText="ABORT"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, id: null, username: "" })}
        />
      </div>
    </DashboardLayout >
  );
}
