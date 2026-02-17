import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    getStoreClients,
    deleteStoreClient,
    updateStoreClient,
    impersonateStoreClient,
    setAuth,
    getClientPreviewStats,
    getClientPreviewLicenses,
    getClientPreviewOrders
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Users as UsersIcon,
    Trash2,
    Eye,
    Shield,
    Zap,
    Package,
    TrendingUp,
    DollarSign,
    Copy,
    ShoppingBag,
    RefreshCw,
    Check,
    X,
    Filter,
    Search,
    Mail,
    Globe,
    Gamepad2,
    Ban,
    ShieldCheck,
    LogIn,
    Plus,
    ChevronDown,
    Clock,
    ArrowRight
} from "lucide-react";
import { cn, formatIST } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface StoreClient {
    id: number;
    email: string;
    username?: string;
    avatar_url?: string;
    is_active: boolean;
    is_verified: boolean;
    google_id?: string;
    discord_id?: string;
    created_at: string;
    updated_at: string;
    has_success_purchase: boolean;
    has_pending_orders: boolean;
    total_spent: number;
    is_reseller?: boolean;
}

const MobileUserCard = ({ user, onSelect, onImpersonate, onPreview }: { user: StoreClient; onSelect: (id: number) => void, onImpersonate: (id: number) => void, onPreview: (user: StoreClient) => void }) => {
    return (
        <button
            onClick={() => onSelect(user.id)}
            className="w-full text-left group"
        >
            <div className="rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md p-5 space-y-4 transition-all duration-300 hover:border-zinc-700 shadow-xl group-active:scale-[0.98]">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20 overflow-hidden">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username || user.email} className="h-full w-full object-cover" />
                            ) : (
                                <UsersIcon className="h-5 w-5 text-emerald-500" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate text-white uppercase tracking-tight">
                                    {user.username || "Unknown Unit"}
                                </p>
                                {user.is_reseller && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-[10px] text-zinc-500 font-medium tracking-tight truncate uppercase">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className={cn(
                        "h-7 px-3 rounded-lg flex items-center gap-1.5 border transition-colors",
                        !user.is_active
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                        {!user.is_active ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        <span className="text-[10px] font-semibold uppercase tracking-tight">{!user.is_active ? "BANNED" : "ACTIVE"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-800/50 pt-4">
                    {user.google_id && (
                        <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                    )}
                    {user.discord_id && (
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_15_rgba(99,102,241,0.1)]">
                            <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] fill-[#5865F2]">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.666 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                            </svg>
                        </div>
                    )}
                    {!user.google_id && !user.discord_id && (
                        <div className="h-8 w-8 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center">
                            <Mail className="h-[14px] w-[14px] text-zinc-500" />
                        </div>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); onPreview(user); }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); onImpersonate(user.id); }}
                        >
                            <LogIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 px-1">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-zinc-600" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Joined {formatIST(user.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </button>
    );
};

export default function Clients() {
    const [clients, setClients] = useState<StoreClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
    const [purchaseFilter, setPurchaseFilter] = useState<"all" | "buyers" | "pending" | "non_buyers">("all");
    const [isMobile, setIsMobile] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Confirm Delete
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; identifier: string }>({
        open: false,
        id: null,
        identifier: "",
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewClient, setPreviewClient] = useState<StoreClient | null>(null);


    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        setIsRefreshing(true);
        try {
            const data = await getStoreClients();
            setClients(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error("[StoreClients] Fetch error:", error);
            toast({
                title: "Failed to load store clients",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing) return;
        await fetchClients();
    }

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = (id: number, identifier: string) => {
        setDeleteConfirm({ open: true, id, identifier });
    };

    const handleImpersonate = async (id: number) => {
        try {
            const data = await impersonateStoreClient(id);
            if (data.token) {
                setAuth(data.token, 'client', data.user);
                toast({ title: "Logged in as client", description: "Redirecting to dashboard..." });

                setTimeout(() => {
                    window.location.href = "/client/dashboard";
                }, 500);
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: "Failed to impersonate", description: error.message || "Unknown error", variant: "destructive" });
        }
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        setIsDeleting(true);
        try {
            await deleteStoreClient(deleteConfirm.id);
            toast({ title: "Client deleted successfully" });
            setDeleteConfirm({ open: false, id: null, identifier: "" });
            fetchClients();
        } catch (error: any) {
            toast({ title: "Failed to delete client", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleStatus = async (client: StoreClient) => {
        try {
            const newStatus = !client.is_active;
            await updateStoreClient(client.id, { is_active: newStatus });
            toast({ title: `Client ${newStatus ? 'Activated' : 'suspended'}` });

            // Optimistic update
            setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_active: newStatus } : c));
        } catch (error: any) {
            toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
            fetchClients(); // Revert on error
        }
    };


    const columns = [
        {
            key: "identity",
            header: "Client Identity",
            render: (client: StoreClient) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
                        {client.avatar_url ? (
                            <img src={client.avatar_url} alt={client.username || client.email} className="h-full w-full object-cover" />
                        ) : (
                            <UsersIcon className="h-4 w-4 text-zinc-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{client.username || "No Username"}</span>
                            {client.is_reseller && (
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] uppercase tracking-wider px-1.5 h-4 hover:bg-purple-500/20">
                                    Reseller
                                </Badge>
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-500">{client.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "auth_method",
            header: "Auth Method",
            render: (client: StoreClient) => (
                <div className="flex items-center gap-2.5">
                    {client.google_id && (
                        <div title="Google Login" className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                    )}
                    {client.discord_id && (
                        <div title="Discord Login" className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#5865F2]">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.666 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                            </svg>
                        </div>
                    )}
                    {!client.google_id && !client.discord_id && (
                        <div title="Email Login" className="h-7 w-7 rounded-lg bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "created_at",
            header: "Joined On",
            render: (client: StoreClient) => (
                <span className="text-xs text-zinc-400 font-mono">
                    {formatIST(client.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (client: StoreClient) => (
                <button onClick={() => toggleStatus(client)} className={cn(
                    "h-6 px-2.5 rounded-md border flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase",
                    client.is_active
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                )}>
                    {client.is_active ? "Active" : "Suspended"}
                </button>
            )
        },
        {
            key: "actions",
            header: "",
            render: (client: StoreClient) => (
                <div className="flex justify-end pr-2 gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-400 transition-all"
                        onClick={(e) => { e.stopPropagation(); setPreviewClient(client); }}
                        title="Preview Dashboard"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-indigo-500/10 text-zinc-600 hover:text-indigo-400 transition-all"
                        onClick={(e) => { e.stopPropagation(); handleImpersonate(client.id); }}
                        title="Login as User"
                    >
                        <LogIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all"
                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.username || client.email); }}
                        title="Delete Client"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        }
    ];

    const filteredClients = clients.filter(client => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (client.username?.toLowerCase() || "").includes(query) ||
            (client.email.toLowerCase() || "").includes(query);

        let matchesTab = true;
        if (activeTab === "active") matchesTab = client.is_active;
        else if (activeTab === "inactive") matchesTab = !client.is_active;

        let matchesPurchase = true;
        if (purchaseFilter === "buyers") matchesPurchase = client.has_success_purchase;
        else if (purchaseFilter === "pending") matchesPurchase = client.has_pending_orders;
        else if (purchaseFilter === "non_buyers") matchesPurchase = !client.has_success_purchase && !client.has_pending_orders;

        return matchesSearch && matchesTab && matchesPurchase;
    });

    return (
        <DashboardLayout
            title="Store Clients"
            subtitle="Manage registered users from the store website"
        >
            <div className="space-y-8 transition-all duration-500">
                <div className="p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                            <UsersIcon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Client Database</p>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{clients.length} Registered Clients</h2>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Active Clients", value: clients.filter(c => c.is_active).length, icon: Check, color: "emerald" },
                        { label: "Banned Clients", value: clients.filter(c => !c.is_active).length, icon: Ban, color: "red" },
                        { label: "Buyers", value: clients.filter(c => c.has_success_purchase).length, icon: ShoppingBag, color: "blue" },
                        { label: "Total Spent", value: `₹${clients.reduce((acc, c) => acc + (c.total_spent || 0), 0).toFixed(0)}`, icon: DollarSign, color: "yellow" }
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

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500/80 transition-all duration-300" />
                        <Input
                            placeholder="Search Client Node Registry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-[#050505] border-zinc-900 h-12 text-white placeholder:text-zinc-700 rounded-xl transition-all shadow-2xl focus:ring-1 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#050505] p-1.5 rounded-xl border border-zinc-900 shadow-2xl">
                        <Select value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
                            <SelectTrigger className="h-9 border-0 bg-zinc-900/40 hover:bg-zinc-800/60 px-3 w-auto gap-2 flex-shrink-0 text-zinc-400 transition-all focus:ring-0 rounded-lg">
                                <Filter className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">Global Status</SelectItem>
                                <SelectItem value="active">Operational Only</SelectItem>
                                <SelectItem value="inactive">Terminated Only</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="w-px h-4 bg-zinc-800/40" />

                        <Select value={purchaseFilter} onValueChange={(val: any) => setPurchaseFilter(val)}>
                            <SelectTrigger className="h-9 border-0 bg-zinc-900/40 hover:bg-zinc-800/60 px-3 w-auto gap-2 flex-shrink-0 text-emerald-500/60 transition-all focus:ring-0 rounded-lg">
                                <DollarSign className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">Financial Overview</SelectItem>
                                <SelectItem value="buyers">Authorized Buyers</SelectItem>
                                <SelectItem value="pending">Escrow Orders</SelectItem>
                                <SelectItem value="non_buyers">New Assets</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="w-px h-4 bg-zinc-800/40" />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="h-9 w-9 bg-zinc-900/40 hover:bg-emerald-500/10 text-zinc-500 transition-all active:scale-90 group rounded-lg"
                        >
                            <RefreshCw className={cn("h-4 w-4 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#111111]/80 backdrop-blur-md">
                    {isMobile ? (
                        <div className="p-4 space-y-4">
                            {filteredClients.map(client => (
                                <MobileUserCard
                                    key={client.id}
                                    user={client}
                                    onSelect={(id) => {
                                        const c = clients.find(cl => cl.id === id);
                                        if (c) setPreviewClient(c);
                                    }}
                                    onImpersonate={handleImpersonate}
                                    onPreview={setPreviewClient}
                                />
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredClients}
                            keyExtractor={(c) => c.id.toString()}
                            isLoading={isLoading}
                            emptyMessage="No store clients found"
                        />
                    )}
                </div>

                <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}>
                    <DialogContent className="rounded-xl border-red-500/20 bg-zinc-950/95 backdrop-blur-xl sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-500" />
                                Confirm Deletion
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <p className="text-zinc-400 text-sm">
                                Are you sure you want to permanently delete store user <span className="font-bold text-white">{deleteConfirm.identifier}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="ghost" onClick={() => setDeleteConfirm({ open: false, id: null, identifier: "" })}>Cancel</Button>
                                <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {previewClient && (
                    <AdminClientPreview
                        client={previewClient}
                        onClose={() => setPreviewClient(null)}
                    />
                )}

            </div>
        </DashboardLayout>
    );
}

const AdminClientPreview = ({ client, onClose }: { client: StoreClient; onClose: () => void }) => {
    const [stats, setStats] = useState<any>(null);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, l, o] = await Promise.all([
                getClientPreviewStats(client.id),
                getClientPreviewLicenses(client.id),
                getClientPreviewOrders(client.id)
            ]);
            setStats(s);
            setLicenses(Array.isArray(l) ? l : []);
            setOrders(Array.isArray(o) ? o : []);
        } catch (error) {
            console.error("Preview fail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [client.id]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 bg-zinc-900/30">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-0.5 overflow-hidden">
                            {client.avatar_url ? (
                                <img src={client.avatar_url} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <UsersIcon className="h-6 w-6 text-emerald-500" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{client.username || "Client Dashboard Preview"}</h2>
                            <p className="text-xs text-zinc-500 font-medium">{client.email} // ID: {client.id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
                            <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                            <p className="text-xs font-bold uppercase tracking-widest">Compiling Preview Data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Products</p>
                                    <p className="text-2xl font-bold text-white">{stats?.active_products || 0}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Subscriptions</p>
                                    <p className="text-2xl font-bold text-white">{stats?.total_subscriptions || 0}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold text-emerald-400">{stats?.currency_symbol || "₹"}{stats?.total_spent?.toFixed(2) || "0.00"}</p>
                                </div>
                            </div>

                            <Tabs defaultValue="licenses" className="w-full">
                                <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-xl mb-6">
                                    <TabsTrigger value="licenses" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 text-xs font-bold uppercase tracking-widest px-6">Licenses</TabsTrigger>
                                    <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 text-xs font-bold uppercase tracking-widest px-6">Orders</TabsTrigger>
                                </TabsList>

                                <TabsContent value="licenses" className="space-y-3">
                                    {licenses.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {licenses.map((lic) => (
                                                <div key={lic.id} className="p-4 bg-black/40 border border-white/5 rounded-xl group relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-xs font-bold text-white uppercase">{lic.app_name}</h4>
                                                        <Badge className={cn(
                                                            "text-[9px] uppercase",
                                                            lic.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                        )} variant="outline">
                                                            {lic.is_active ? "Active" : "Disabled"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-white/5">
                                                        <code className="text-[10px] text-zinc-400 truncate pr-2">{lic.key}</code>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(lic.key)}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase">
                                                        Expires: {lic.expires_at ? formatIST(lic.expires_at, { dateStyle: 'medium' }) : "Lifetime"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-2">
                                            <Package className="h-8 w-8 text-zinc-800" />
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase">No active licenses found</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="orders" className="space-y-4">
                                    {orders.length > 0 ? (
                                        <div className="space-y-2">
                                            {orders.map((order) => (
                                                <div key={order.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                                                            <ShoppingBag className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{order.items?.[0]?.product_name || "Store Purchase"}</p>
                                                            <p className="text-[10px] text-zinc-500 font-mono">{formatIST(order.created_at, { dateStyle: 'medium' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">₹{order.amount.toFixed(2)}</p>
                                                        <p className={cn(
                                                            "text-[9px] uppercase font-black",
                                                            order.status === "completed" ? "text-emerald-500" : "text-yellow-500"
                                                        )}>{order.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-2">
                                            <ShoppingBag className="h-8 w-8 text-zinc-800" />
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase">No order history available</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
