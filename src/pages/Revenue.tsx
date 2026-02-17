import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    IndianRupee,
    TrendingUp,
    ArrowUpRight,
    RefreshCw,
    Wallet,
    Activity,
    CreditCard,
    Clock,
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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function Revenue() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [revenueData, setRevenueData] = useState<any>(null);
    const [dateRange, setDateRange] = useState("14");
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

    // Filter orders based on date range for the entire dashboard
    const filteredOrders = (() => {
        const orders = revenueData?.orders || [];
        const days = parseInt(dateRange);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (days + 1)); // Include today + N days back
        cutoff.setHours(0, 0, 0, 0);

        return orders.filter((o: any) => new Date(o.created_at) >= cutoff);
    })();

    // Calculate display stats from filtered orders
    const displayStats = (() => {
        const completed = filteredOrders.filter((o: any) => o.status === 'completed');
        const pending = filteredOrders.filter((o: any) => o.status === 'pending');

        const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.amount, 0);
        const pendingRevenue = pending.reduce((sum: number, o: any) => sum + o.amount, 0);

        return {
            revenue: totalRevenue,
            total_orders: filteredOrders.length,
            completed: completed.length,
            pending_revenue: pendingRevenue,
            success_rate: filteredOrders.length > 0 ? (completed.length / filteredOrders.length * 100).toFixed(1) : "0",
            avg_per_sale: completed.length > 0 ? (totalRevenue / completed.length).toFixed(0) : "0"
        };
    })();

    // Prepare chart data with zero-filling for missing dates
    const chartData = (() => {
        const orders = filteredOrders;
        if (orders.length === 0 && !revenueData) return [];

        const result: any[] = [];
        const days = parseInt(dateRange);
        const today = new Date();

        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            const dailyRevenue = orders
                .filter((o: any) => {
                    const oDate = new Date(o.created_at);
                    return oDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) === dateStr && o.status === 'completed';
                })
                .reduce((sum: number, o: any) => sum + o.amount, 0);

            result.push({ date: dateStr, revenue: dailyRevenue });
        }
        return result;
    })();

    // Calculate real payment method breakdown from filtered data
    const payflows = (() => {
        const completedOrders = filteredOrders.filter((o: any) => o.status === 'completed');
        if (completedOrders.length === 0) return [];

        const counts: Record<string, number> = {};
        completedOrders.forEach((o: any) => {
            const method = o.payment_method || 'Other';
            counts[method] = (counts[method] || 0) + 1;
        });

        const total = completedOrders.length;
        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                percent: Math.round((count / total) * 100),
                color: name.toLowerCase().includes('upi') || name.toLowerCase().includes('razorpay') ? 'bg-emerald-500' :
                    name.toLowerCase().includes('crypto') || name.toLowerCase().includes('binance') ? 'bg-blue-500' : 'bg-zinc-700'
            }))
            .sort((a, b) => b.percent - a.percent);
    })();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl backdrop-blur-xl shadow-2xl">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-1.5">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <p className="text-sm font-bold text-white tracking-tight">₹{payload[0].value.toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] font-medium text-emerald-500/70 mt-1">Confirmed Income</p>
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout title="Revenue" subtitle="See how much money you're making and where it comes from">
            <div className="space-y-6 pb-12">
                {/* Main Header Banner */}
                <div className="flex items-center gap-5 p-6 bg-[#111111]/80 border border-zinc-800 rounded-xl backdrop-blur-md shadow-lg shadow-black/20 group hover:border-zinc-700/50 transition-all">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-105 transition-transform">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Money Overview</p>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Sales Dashboard</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-6 hidden md:flex">
                        <Link
                            to="/products"
                            target="_blank"
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all group shadow-lg shadow-black/20"
                        >
                            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            View Customer Store
                        </Link>

                        <div className="h-8 w-px bg-zinc-800" />

                        {/* Integrated Filters */}
                        <div className="flex items-center gap-1.5 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/50">
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-800/50 px-3 w-auto gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-all select-none focus:ring-0">
                                    <Clock className="h-3.5 w-3.5" />
                                    {dateRange === "1" ? "Last 24 Hours" : dateRange === "14" ? "Last 14 Days" : dateRange === "30" ? "Last 30 Days" : "Last 7 Days"}
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="1">Last 24 Hours</SelectItem>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="14">Last 14 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="w-px h-5 bg-zinc-800/80 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="h-8 w-8 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
                            </Button>
                        </div>

                        <div className="h-8 w-px bg-zinc-800" />

                        <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">System Status</p>
                            <p className="text-xs font-bold text-emerald-500 uppercase mt-0.5 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live & Updated
                            </p>
                        </div>
                    </div>
                </div>


                {/* Simple Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Total Income",
                            value: `₹${displayStats.revenue.toLocaleString()}`,
                            sub: "Confirmed Sales",
                            icon: IndianRupee,
                            color: "emerald",
                            glow: "rgba(16,185,129,0.05)"
                        },
                        {
                            label: "Avg per Sale",
                            value: `₹${displayStats.avg_per_sale}`,
                            sub: "Money per order",
                            icon: TrendingUp,
                            color: "blue",
                            glow: "rgba(59,130,246,0.05)"
                        },
                        {
                            label: "Awaiting Pay",
                            value: `₹${displayStats.pending_revenue.toLocaleString()}`,
                            sub: "Pending orders",
                            icon: Wallet,
                            color: "yellow",
                            glow: "rgba(234,179,8,0.05)"
                        },
                        {
                            label: "Order Success",
                            value: `${displayStats.success_rate}%`,
                            sub: "Completed sales",
                            icon: Activity,
                            color: "cyan",
                            glow: "rgba(6,182,212,0.05)"
                        }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-[#111111]/80 border-zinc-800 backdrop-blur-md overflow-hidden group hover:border-zinc-700/50 transition-all">
                            <CardContent className="p-6 relative">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top right, ${stat.glow}, transparent 70%)` }} />
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "p-2.5 rounded-lg border transition-all",
                                        stat.color === 'emerald' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" :
                                            stat.color === 'blue' ? "bg-blue-500/5 border-blue-500/10 text-blue-500" :
                                                stat.color === 'yellow' ? "bg-yellow-500/5 border-yellow-500/10 text-yellow-500" :
                                                    "bg-cyan-500/5 border-cyan-500/10 text-cyan-500"
                                    )}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500" />
                                </div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase mt-3 tracking-wider">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2 bg-[#111111]/80 border-zinc-800 backdrop-blur-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Sales Growth</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Money made over time</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Live Feed</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 h-[420px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <LoadingSkeletons count={1} variant="row" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="60%" stopColor="#10b981" stopOpacity={0.05} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} strokeOpacity={0.3} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#3f3f46"
                                            fontSize={10}
                                            fontWeight="600"
                                            tickLine={false}
                                            axisLine={false}
                                            dy={15}
                                            interval={Math.floor(chartData.length / 7)}
                                        />
                                        <YAxis
                                            stroke="#3f3f46"
                                            fontSize={10}
                                            fontWeight="600"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                            dx={-10}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                            strokeWidth={3}
                                            animationDuration={1500}
                                            activeDot={{ r: 6, fill: '#10b981', stroke: '#111111', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* Breakdown Area */}
                    <div className="space-y-6">
                        <Card className="bg-[#111111]/80 border-zinc-800 backdrop-blur-md overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Payment Types</h4>
                            </div>
                            <div className="p-6 space-y-6">
                                {payflows.length > 0 ? payflows.map((method, idx) => (
                                    <div key={idx} className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-zinc-500">{method.name}</span>
                                            <span className="text-zinc-200">{method.percent}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800/50">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", method.color)}
                                                style={{ width: `${method.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center">
                                        <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">No data collected</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="bg-[#111111]/80 border-zinc-800 backdrop-blur-md overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-zinc-500" />
                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Recent Activity</h4>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[9px] font-bold uppercase py-0.5">Live</Badge>
                            </div>
                            <div className="p-2 space-y-1">
                                {filteredOrders.filter((o: any) => o.status === 'completed').slice(0, 4).map((order: any, idx: number) => (
                                    <div key={idx} className="p-3 hover:bg-white/[0.02] rounded-lg transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                                0{idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-200 truncate max-w-[100px]">{order.client_username}</p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase">{formatIST(order.created_at, { timeStyle: 'short' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-emerald-500 tracking-tight">₹{order.amount.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-zinc-700 uppercase">Paid</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
