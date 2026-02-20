import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeletons } from "@/components/LoadingSkeleton";
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
import {
    resellerGetUsers,
    resellerGetApps,
    resellerGetSubscriptions,
    resellerAssignSubscription,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    UserCircle,
    Ban,
    ShieldCheck,
    Eye,
    RefreshCw,
    Copy,
    Check,
    Plus,
    PlusCircle,
    ChevronRight,
    ArrowRight,
    Zap,
    Clock,
    Globe,
    Search,
    Filter,
    X,
    Shield,
    Activity,
    FileText,
    // Plus is already imported
} from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

interface ResellerPlan {
    id: number;
    plan_id: number;
    app_id: number;
    name: string;
    app_name?: string;
    expires_at?: string;
}

interface Application {
    id: number;
    name: string;
}

interface ResellerUser {
    id: number;
    username: string;
    email?: string;
    license_key?: string;
    app_name?: string;
    app_id?: number;
    subscription_name?: string;
    expiry_timestamp?: string;
    account_creation_date: string;
    last_login_time?: string;
    is_banned: boolean;
    ban_reason?: string;
    reseller_name?: string;
    subscriptions?: {
        id: number;
        name: string;
        app_name?: string | null;
        expires_at?: string | null;
        app_id?: number;
    }[];
}

export default function ResellerUsers() {
    const [users, setUsers] = useState<ResellerUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const selectedUser = users.find(u => u.id === selectedUserId) || null;
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
    const [applications, setApplications] = useState<Application[]>([]);
    const [plans, setPlans] = useState<ResellerPlan[]>([]);

    // Add Subscription State
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [assignDuration, setAssignDuration] = useState<string>("");
    const [isProcessingAssignment, setIsProcessingAssignment] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "active" | "banned">("all");
    const [isMobile, setIsMobile] = useState(false);

    const { toast } = useToast();

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
                resellerGetUsers(),
                resellerGetApps(),
                resellerGetSubscriptions(),
            ]);

            const [usersResult, appsResult, plansResult] = results;

            if (usersResult.status === "fulfilled") {
                setUsers(usersResult.value || []);
            } else {
                console.error("[ResellerUsers] Failed to fetch users:", usersResult.reason);
                toast({
                    title: "Failed to load users",
                    description: usersResult.reason.message,
                    variant: "destructive",
                });
            }

            if (appsResult.status === "fulfilled") {
                setApplications(appsResult.value || []);
            }
            if (plansResult.status === "fulfilled") {
                setPlans(plansResult.value || []);
            }
        } catch (error: any) {
            console.error("[ResellerUsers] Critical fetch error:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        if (isRefreshing) return;
        await fetchData();
    };

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

    const handleAssignSubscription = async () => {
        if (!selectedUser || !selectedPlanId) {
            toast({
                title: "Missing Information",
                description: "Please select a plan.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessingAssignment(true);
        try {
            await resellerAssignSubscription({
                user_id: selectedUser.id,
                plan_id: selectedPlanId, // This is the plan_id from the selection
                duration_days: assignDuration ? parseInt(assignDuration) : 30, // Default to 30 if empty for now, or ensure backend handles it
            });

            toast({
                title: "✓ Subscription Assigned",
                description: `Subscription active for ${selectedUser.username}`
            });
            setAssignDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast({
                title: "Assignment Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsProcessingAssignment(false);
        }
    };

    const MobileUserCard = ({ user }: { user: ResellerUser }) => {
        const isLicenseFallback = user.username.startsWith("license_");
        const subCount = user.subscriptions?.length || 0;

        return (
            <button
                onClick={() => {
                    setSelectedUserId(user.id);
                    setDetailsOpen(true);
                }}
                className="w-full text-left transition-all active:scale-[0.98] group"
            >
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-5 shadow-2xl transition-all duration-500 hover:border-emerald-500/40 hover:shadow-emerald-500/5 group">
                    {/* Interior Glow */}
                    <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                    <div className="relative z-10 space-y-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-14 w-14 rounded-xl flex items-center justify-center border transition-all shadow-inner",
                                    isLicenseFallback ? "bg-amber-500/5 border-amber-500/10 group-hover:border-amber-500/30" : "bg-emerald-500/5 border-emerald-500/10 group-hover:border-emerald-500/30"
                                )}>
                                    <UserCircle className={cn("h-7 w-7 transition-transform group-hover:scale-110", isLicenseFallback ? "text-amber-500/80" : "text-emerald-500/80")} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className={cn(
                                        "text-base font-black uppercase tracking-tight truncate mb-1",
                                        isLicenseFallback ? "text-amber-400" : "text-white group-hover:text-emerald-400 transition-colors"
                                    )}>
                                        {user.username}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="h-4 text-[7px] font-black tracking-[0.2em] bg-zinc-950 border-zinc-800 text-zinc-500 uppercase px-1.5">USER #{user.id}</Badge>
                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Customer</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "py-1 px-3 rounded-md border text-[8px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm",
                                user.is_banned ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}>
                                <div className={cn("h-1 w-1 rounded-full animate-pulse", user.is_banned ? "bg-red-500" : "bg-emerald-500")} />
                                {user.is_banned ? "TERMINATED" : "ACTIVE"}
                            </div>
                        </div>

                        {user.license_key && (
                            <div className="relative group/key bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between transition-all hover:bg-black/60 hover:border-white/10">
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">License Key</span>
                                    <code className="text-[11px] font-mono text-zinc-400 truncate tracking-tight">{user.license_key}</code>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(user.license_key || '', 'license', user.id); }}
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 p-0 rounded-lg transition-all",
                                            copiedItems.has(`${user.id}-license`) ? "bg-emerald-500 text-black shadow-lg" : "bg-zinc-800/50 text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        {copiedItems.has(`${user.id}-license`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Zap className="h-3 w-3 text-emerald-500/50" />
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{subCount} SUBSCRIPTIONS</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-zinc-700" />
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                    {new Date(user.account_creation_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    const columns = [
        {
            key: "username",
            header: "PC Username",
            render: (user: ResellerUser) => {
                const isLicenseFallback = user.username.startsWith("license_");
                return (
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLicenseFallback ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                            <Users className={`h-4 w-4 ${isLicenseFallback ? 'text-yellow-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-semibold text-sm ${isLicenseFallback ? 'text-yellow-400' : 'text-white'}`}>{user.username}</span>
                            {user.subscriptions && user.subscriptions.length > 0 && (
                                <span className="text-[10px] font-medium text-zinc-500 tracking-tight mt-0.5">
                                    {user.subscriptions.map(s => `${s.name}${s.app_name ? ` (${s.app_name})` : ''}`).join(', ')}
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
            render: (user: ResellerUser) => (
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
                    ) : <span className="text-[10px] font-black text-zinc-700 tracking-widest bg-black/40 px-3 py-2 rounded-lg border border-white/5">UNASSIGNED</span>}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (user: ResellerUser) => (
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
            render: (user: ResellerUser) => (
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
        <DashboardLayout title="User Management" subtitle="Comprehensive user base and account access control">
            <div className="space-y-8 transition-all duration-500">
                <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl shadow-black/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 transition-transform hover:rotate-12">
                                <Users className="h-7 w-7 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">User List</p>
                                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                    {users.length} Active Users
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </h2>
                            </div>
                        </div>


                    </div>


                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { label: "Active Users", value: activeUsersCount, icon: Check, color: "emerald", delay: '0ms' },
                        { label: "Banned Users", value: bannedUsersCount, icon: Ban, color: "red", delay: '100ms' },
                        { label: "Subscribed", value: users.reduce((acc, u) => acc + (u.subscriptions?.length || 0), 0), icon: ShieldCheck, color: "blue", delay: '200ms' },
                        { label: "Permissions", value: users.length, icon: RefreshCw, color: "yellow", delay: '300ms' }
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="bg-black/40 border border-white/5 p-5 sm:p-6 rounded-xl backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 shadow-xl shadow-black/20 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border transition-colors", `bg-${stat.color}-500/5 border-${stat.color}-500/10 group-hover:border-${stat.color}-500/30`)}>
                                    <stat.icon className={cn("h-4 w-4", `text-${stat.color}-500`)} />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tighter">{stat.value}</p>
                            <div className="mt-4 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5">
                                <div
                                    className={cn("h-full rounded-full opacity-60 shadow-[0_0_8px]", `bg-${stat.color}-500 shadow-${stat.color}-500/50`)}
                                    style={{ width: '65%' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>



                {/* Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Search users..."
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
                        {/* Filter */}
                        <Select value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                            <SelectTrigger className="h-9 md:h-10 border-0 bg-transparent hover:bg-zinc-800/50 px-2 w-auto gap-1 [&>svg]:h-4 [&>svg]:w-4 flex-shrink-0 text-zinc-500 transition-all">
                                <Filter className="h-4.25 w-4.25" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all" className="text-white focus:bg-zinc-800">All Users</SelectItem>
                                <SelectItem value="active" className="text-white focus:bg-zinc-800">Active</SelectItem>
                                <SelectItem value="banned" className="text-white focus:bg-zinc-800">Banned</SelectItem>
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

                <div className="space-y-4">
                    <div className="relative">
                        {isMobile ? (
                            <div className="grid grid-cols-1 gap-4">
                                {isLoading ? (
                                    <LoadingSkeletons count={3} variant="card" />
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-12 text-center rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
                                        <Users className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">No matching users found</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <MobileUserCard key={user.id} user={user} />
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/5 overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl">
                                <DataTable
                                    columns={columns}
                                    data={filteredUsers}
                                    keyExtractor={(u) => u.id.toString()}
                                    isLoading={isLoading}
                                    emptyMessage="No users found"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* User Details Dialog */}
                <ErrorBoundary>
                    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                        <DialogContent className="w-[95vw] sm:w-full rounded-xl border-white/10 sm:max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden bg-black/90 backdrop-blur-3xl p-0 shadow-2xl">
                            <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[90vh]">
                                {/* Tactical Header */}
                                <div className="relative p-5 sm:p-10 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50">
                                    <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-[0.02] pointer-events-none">
                                        <UserCircle className="h-32 w-32 sm:h-64 sm:w-64 -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 text-white" />
                                    </div>

                                    <div className="relative z-10 flex items-center gap-4 sm:gap-8">
                                        <div className="relative group">
                                            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 duration-500">
                                                <UserCircle className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-500" />
                                            </div>
                                            <div className={cn(
                                                "absolute -bottom-2 -right-2 h-8 w-8 rounded-xl flex items-center justify-center border-2 border-black shadow-xl",
                                                selectedUser?.is_banned ? "bg-red-500 text-white" : "bg-emerald-500 text-black"
                                            )}>
                                                {selectedUser?.is_banned ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 stroke-[3px]" />}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 sm:gap-4">
                                                <h2 className="text-xl sm:text-4xl font-bold text-white tracking-tighter truncate uppercase leading-none">
                                                    {selectedUser?.username}
                                                </h2>
                                                <div className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                    USER #{selectedUser?.id}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <Clock className="h-3.5 w-3.5 text-emerald-500/60" />
                                                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">
                                                        INITIALIZED: {new Date(selectedUser?.account_creation_date || '').toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar overflow-x-hidden">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-zinc-500 pl-1 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Core Credentials
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="group relative bg-black/40 border border-white/5 rounded-xl p-5 transition-all hover:bg-black/60 hover:border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Username</span>
                                                    <UserCircle className="h-3.5 w-3.5 text-zinc-700" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <code className="text-sm sm:text-base font-black text-white tracking-tight uppercase">{selectedUser?.username}</code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-9 w-9 p-0 rounded-xl transition-all",
                                                            copiedItems.has(`${selectedUser?.id}-username`)
                                                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                                                : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-white"
                                                        )}
                                                        onClick={() => copyToClipboard(selectedUser?.username || '', 'username', selectedUser?.id)}
                                                    >
                                                        {copiedItems.has(`${selectedUser?.id}-username`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="group relative bg-black/40 border border-white/5 rounded-xl p-5 transition-all hover:bg-black/60 hover:border-emerald-500/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">License Key</span>
                                                    <Zap className="h-3.5 w-3.5 text-emerald-500/40" />
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    {selectedUser?.license_key ? (
                                                        <code className="text-xs sm:text-sm font-mono text-zinc-300 break-all">{selectedUser.license_key}</code>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-zinc-700 tracking-[0.2em] uppercase">No key assigned</span>
                                                    )}
                                                    {selectedUser?.license_key && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "h-9 w-9 flex-shrink-0 rounded-xl transition-all",
                                                                copiedItems.has(`${selectedUser.id}-license`)
                                                                    ? "bg-emerald-500 text-black shadow-lg"
                                                                    : "bg-zinc-800 text-zinc-500 hover:text-white"
                                                            )}
                                                            onClick={() => copyToClipboard(selectedUser.license_key || '', 'license', selectedUser.id)}
                                                        >
                                                            {copiedItems.has(`${selectedUser.id}-license`) ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    )}
                                                </div>
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
                                                <Plus className="mr-2 h-3.5 w-3.5 stroke-[2px]" />
                                                Deploy New
                                            </Button>
                                        </div>

                                        {(selectedUser?.subscriptions && selectedUser.subscriptions.length > 0) ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {selectedUser.subscriptions.map((sub, i) => (
                                                    <div key={i} className="group relative flex items-center justify-between p-3.5 sm:p-5 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all hover:bg-black/60 backdrop-blur-md">
                                                        <div className="min-w-0 flex items-center gap-3 sm:gap-4">
                                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-center shrink-0">
                                                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm font-bold text-white truncate uppercase tracking-tight">{sub.name}</p>
                                                                <p className="text-[9px] sm:text-xs font-medium text-zinc-600 mt-0.5 truncate uppercase">{sub.app_name || "Product"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <div className="text-right">
                                                                <p className="text-[9px] sm:text-xs font-medium text-zinc-500 uppercase">Expires</p>
                                                                <p className="text-[9px] sm:text-xs font-bold text-emerald-500/80 mt-0.5 font-mono">
                                                                    {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'PERPETUAL'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-10 rounded-xl border border-dashed border-white/5 bg-black/40 text-center">
                                                <Globe className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                                                <p className="text-xs font-bold text-zinc-600">No active subscriptions found</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            onClick={() => setDetailsOpen(false)}
                                            className="h-11 sm:h-12 w-full bg-zinc-900 text-white rounded-lg sm:rounded-xl border border-zinc-800 font-bold hover:bg-zinc-800 text-[10px] sm:text-xs uppercase tracking-widest transition-colors"
                                        >
                                            Close Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </ErrorBoundary>

                {/* Assign Subscription Dialog - RE-ENGINEERED */}
                <ErrorBoundary>
                    <Dialog open={assignDialogOpen} onOpenChange={(open) => { setAssignDialogOpen(open); if (!open) { setSelectedPlanId(null); setAssignDuration(""); setIsProcessingAssignment(false); } }}>
                        <DialogContent className="w-[98vw] sm:w-full border-white/10 sm:max-w-2xl rounded-xl backdrop-blur-3xl bg-black/90 p-0 overflow-hidden shadow-2xl">
                            <div className="flex flex-col h-full max-h-[94vh] sm:max-h-[85vh]">
                                {/* Header - Tactical Style */}
                                <div className="p-4 sm:p-10 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50 relative shrink-0">
                                    <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-[0.03] pointer-events-none">
                                        <Zap className="h-24 w-24 sm:h-48 sm:w-48 -mr-6 -mt-6 sm:-mr-16 sm:-mt-16 text-white" />
                                    </div>

                                    <div className="relative z-10 flex items-center gap-3 sm:gap-6">
                                        <div className="h-8 w-8 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shrink-0">
                                            <Zap className="h-4 w-4 sm:h-7 sm:w-7 text-emerald-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <DialogTitle className="text-base sm:text-2xl font-bold tracking-tight text-white uppercase truncate">Assign Subscription</DialogTitle>
                                            <p className="text-[7px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 truncate leading-tight">Assign plan to: <span className="text-emerald-500/80">{selectedUser?.username}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar overflow-x-hidden">
                                    {/* Plan Matrix */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5 sm:gap-2">
                                                <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                AVAILABLE PLANS
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                            {plans.length > 0 ? (
                                                plans.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setSelectedPlanId(p.plan_id)}
                                                        className={cn(
                                                            "relative p-3 sm:p-5 text-left rounded-lg sm:rounded-xl border transition-all duration-300 group overflow-hidden bg-black/40",
                                                            selectedPlanId === p.plan_id
                                                                ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20"
                                                                : "border-white/5 hover:border-white/10 hover:bg-black/60"
                                                        )}
                                                    >
                                                        <div className="flex items-center sm:items-start gap-4 h-full relative z-10">
                                                            <div className={cn(
                                                                "h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-inner",
                                                                selectedPlanId === p.plan_id ? "bg-emerald-500/20 border-emerald-500/30" : "bg-black/40 border-white/5 group-hover:border-white/10"
                                                            )}>
                                                                <Globe className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5 transition-colors duration-300", selectedPlanId === p.plan_id ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400")} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[11px] sm:text-sm font-bold text-white uppercase tracking-wide truncate group-hover:translate-x-0.5 transition-transform">{p.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5 sm:mt-2">
                                                                    <Badge className="bg-zinc-950/80 text-zinc-500 border-zinc-800 text-[6px] sm:text-[8px] font-bold uppercase tracking-wider px-1 sm:px-2 py-0 shrink-0">
                                                                        {p.app_name || "Product"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {selectedPlanId === p.plan_id && (
                                                            <div className="absolute top-0 right-0 p-1.5 sm:p-3">
                                                                <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-md sm:rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg transform rotate-12 scale-100 sm:scale-110">
                                                                    <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-black stroke-[4px]" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-full py-6 sm:py-12 text-center rounded-xl sm:rounded-3xl border border-dashed border-white/5 bg-black/40">
                                                    <Check className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-500/20 mx-auto mb-2 sm:mb-4" />
                                                    <p className="text-[8px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No available plans found</p>
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

                                        <div className="relative group bg-black/40 rounded-lg sm:rounded-xl border border-white/5 p-3 sm:p-6 space-y-4 sm:space-y-6 transition-all focus-within:border-emerald-500/30">
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
                                                        className="h-10 sm:h-14 bg-black/40 border-white/5 focus:border-emerald-500/50 text-sm sm:text-xl font-bold text-white tracking-tight pl-10 sm:pl-16 rounded-lg sm:rounded-xl placeholder:text-zinc-800"
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
                                                                    : "bg-black/40 hover:bg-black/60 border-white/5 text-zinc-400"
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
                                <div className="p-4 sm:p-10 bg-black/40 border-t border-white/5 relative space-y-2.5 sm:space-y-4 mt-auto shrink-0">
                                    <div className="absolute top-[-1px] left-0 w-12 sm:w-24 h-[1px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]" />

                                    <Button
                                        disabled={!selectedPlanId || isProcessingAssignment}
                                        onClick={handleAssignSubscription}
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
            </div>
        </DashboardLayout>
    );
}