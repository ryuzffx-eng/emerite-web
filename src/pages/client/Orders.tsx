import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { clientGetOrders, clientGetStats } from "@/lib/api";
import {
    Search,
    ShoppingBag,
    History,
    CreditCard,
    Calendar,
    ExternalLink,
    Zap,
    Shield,
    Key,
    Copy,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatIST, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { clientGetLicenses } from "@/lib/api";

const ClientOrders = () => {
    const { data: orders } = useQuery({
        queryKey: ["client-orders"],
        queryFn: clientGetOrders
    });

    const { data: stats } = useQuery({
        queryKey: ["client-stats"],
        queryFn: clientGetStats
    });

    const { data: licenses } = useQuery({
        queryKey: ["client-licenses"],
        queryFn: clientGetLicenses
    });

    const [expandedOrder, setExpandedOrder] = React.useState<number | null>(null);
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "License key added to clipboard." });
    };

    return (
        <DashboardLayout
            title="Transaction History"
            subtitle="Track every licensed acquisition and system update in your history."
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#0a0a0a] border border-white/[0.05] p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Assets Deployed</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{stats?.active_products || "0"}</span>
                                <span className="text-[10px] font-bold text-zinc-700 uppercase">Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/[0.05] p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider block mb-2">Total investment</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                                    {stats?.currency_symbol || "₹"}{stats?.total_spent?.toFixed(2) || "0.00"}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-700 uppercase">IST Core</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-hover:text-emerald-500/50 transition-colors" />
                        <Input
                            placeholder="Search operational logs..."
                            className="bg-[#0a0a0a] border-zinc-800/60 rounded-xl h-12 pl-12 text-xs font-medium text-zinc-400 focus:border-emerald-500/30 transition-all shadow-sm placeholder:text-zinc-700"
                        />
                    </div>
                    <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-1.5 flex gap-1 shadow-sm">
                        <button className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-zinc-900 text-white border border-zinc-800 shadow-sm transition-all">All Orders</button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders && orders.length > 0 ? (
                        orders.map((order: any, index: number) => (
                            <div className="space-y-4">
                                <motion.div
                                    key={order.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * (index % 10) }}
                                    className={cn(
                                        "bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-emerald-500/20 transition-all duration-300 shadow-xl relative overflow-hidden",
                                        expandedOrder === order.id && "border-emerald-500/30 bg-[#0d0d0d]"
                                    )}
                                >
                                    <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all shadow-inner">
                                            <ShoppingBag className="h-5 w-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-none">Order ID</span>
                                                <span className="text-xs font-mono text-emerald-500/60 font-bold uppercase">#{order.id}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                                                {order.items && order.items.length > 0
                                                    ? order.items.map((item: any) => item.product_name).join(", ")
                                                    : "System Module Acquisition"}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3 text-zinc-600" />
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard className="h-3 w-3 text-zinc-600" />
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{order.payment_method || "Core Payment"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Total Payload</span>
                                            <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tighter">
                                                {stats?.currency_symbol || "₹"}{order.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Status</span>
                                            <div className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border",
                                                order.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    order.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === "completed" && (
                                                <Button
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 border border-zinc-800 hover:border-emerald-500/40 text-zinc-500 hover:text-emerald-400 transition-all rounded-xl"
                                                >
                                                    {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {order.razorpay_order_id && (
                                                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-600 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                                                    <ExternalLink className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-[#080808] border-x border-b border-white/[0.03] rounded-b-2xl p-6 pt-2 space-y-4 ml-4 mr-4 mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Key className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Acquired Inventory (Keys)</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {licenses?.filter((l: any) => l.order_id === order.id).map((lic: any) => (
                                                        <div key={lic.id} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800/50 rounded-xl group/key hover:border-emerald-500/30 transition-all">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Protocol: {lic.app_name}</span>
                                                                <code className="text-xs font-mono text-zinc-300 tracking-wider">{lic.key}</code>
                                                            </div>
                                                            <Button
                                                                onClick={() => copyToClipboard(lic.key)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-zinc-600 hover:text-emerald-400"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {(!licenses || licenses.filter((l: any) => l.order_id === order.id).length === 0) && (
                                                        <div className="p-4 text-center border border-dashed border-zinc-800 rounded-xl">
                                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Synchronizing keys with registry... (Check again in a moment)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-32 flex flex-col items-center justify-center text-center gap-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-700"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02),transparent_70%)]" />

                            <div className="relative">
                                <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-2 shadow-2xl group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all duration-500 rotate-45 group-hover:rotate-90">
                                    <ShoppingBag className="w-8 h-8 text-zinc-800 group-hover:text-emerald-500 transition-colors -rotate-45 group-hover:-rotate-90 duration-500" />
                                </div>
                                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>

                            <div className="space-y-3 max-w-sm relative z-10">
                                <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Archives Clean</h3>
                                <div className="h-1 w-12 bg-emerald-500/20 mx-auto rounded-full" />
                                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide leading-relaxed opacity-80">
                                    No transaction signatures detected in local encrypted registry. Start deploying modules to build your history.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientOrders;
