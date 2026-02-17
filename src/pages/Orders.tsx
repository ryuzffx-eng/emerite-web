import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    RefreshCw,
    Filter,
    Search,
    FileText,
    Download,
    IndianRupee,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ChevronDown,
    X,
    Plus,
    Trash2,
    Sparkles,
    ExternalLink
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { LoadingSkeletons } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { cn, formatIST } from "@/lib/utils";
import { getStoreOrders } from "@/lib/api";

export default function Orders() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [revenueData, setRevenueData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        setIsRefreshing(true);
        try {
            const data = await getStoreOrders();
            setRevenueData(data);
        } catch (error: any) {
            toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing) return;
        await fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredOrders = (revenueData?.orders || [])?.filter((order: any) => {
        const matchesSearch =
            order.client_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery) ||
            order.payment_method.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === "all") return matchesSearch;
        return matchesSearch && order.status === filterStatus;
    });

    return (
        <DashboardLayout title="Recent Orders" subtitle="View and manage all your store sales">
            <div className="space-y-6 pb-12">
                {/* Order Registry Banner */}
                <div className="flex items-center gap-5 p-6 bg-[#111111]/80 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Order Logs</p>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Recent Orders</h2>
                    </div>
                </div>

                {/* Sleek Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 bg-zinc-900/50 border border-zinc-800 h-10 md:h-12 text-sm text-white placeholder:text-zinc-600 rounded-xl transition-all outline-none focus:border-zinc-700"
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

                    <Link
                        to="/products"
                        target="_blank"
                        className="flex items-center gap-2 px-5 h-10 md:h-12 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group shadow-lg shadow-black/20"
                    >
                        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span className="hidden sm:inline">View Customer Store</span>
                        <span className="sm:hidden">Store</span>
                    </Link>

                    <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 shadow-lg shadow-black/20">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-9 md:h-10 border-0 bg-transparent hover:bg-zinc-800/50 px-2 w-auto gap-1 [&>svg]:h-4 [&>svg]:w-4 flex-shrink-0 text-zinc-500 transition-all select-none focus:ring-0">
                                <Filter className="h-4.25 w-4.25" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
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
                            <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-blue-500 transition-colors", isRefreshing && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-[#111111]/80 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-8">
                                <LoadingSkeletons count={5} variant="row" />
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/40 border-b border-zinc-800">
                                        <th className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                                Order ID <ArrowUpDown className="h-2.5 w-2.5" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Customer</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Product</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Price</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Payment</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredOrders.map((order: any) => (
                                        <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-blue-500 font-semibold tracking-tighter uppercase">#{order.id}</span>
                                                    <span className="text-[10px] font-mono text-zinc-600 mt-0.5">{order.transaction_id || "Unpaid"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-zinc-200">{order.client_username}</span>
                                                    <span className="text-[10px] font-medium text-zinc-500 lowercase">{order.client_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1 w-1 rounded-full bg-blue-500/50" />
                                                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{item.product_name}</span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tight ml-3">{item.plan_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-zinc-500 font-bold text-[10px]">₹</span>
                                                    <span className="text-sm font-bold text-emerald-500 tracking-tight">{order.amount.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-950 border-zinc-800 text-zinc-500 px-3 py-1">
                                                    {order.payment_method}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        order.status === 'completed' ? "bg-emerald-500" :
                                                            order.status === 'pending' ? "bg-yellow-500" :
                                                                "bg-red-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-semibold uppercase tracking-wider",
                                                        order.status === 'completed' ? "text-emerald-500" :
                                                            order.status === 'pending' ? "text-yellow-500" :
                                                                "text-red-500"
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">{formatIST(order.created_at, { dateStyle: 'medium' })}</span>
                                                    <span className="text-[10px] font-mono text-zinc-600 mt-0.5">{formatIST(order.created_at, { timeStyle: 'short' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">No orders found</p>
                                                    <p className="text-xs font-medium text-zinc-600 uppercase mt-2 tracking-wider">Waiting for new sales...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Pagination Placeholder */}
                <div className="flex items-center justify-between p-6 bg-[#111111]/80 border border-zinc-800 rounded-2xl backdrop-blur-sm shadow-xl shadow-black/20">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Showing {filteredOrders.length} orders</p>
                    <div className="flex gap-2">
                        <Button disabled size="icon" variant="outline" className="h-8 w-8 bg-black/40 border-zinc-800 text-zinc-700 transition-all"><ChevronLeft className="h-4 w-4" /></Button>
                        <Button disabled size="icon" variant="outline" className="h-8 w-8 bg-black/40 border-zinc-800 text-zinc-700 transition-all"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
