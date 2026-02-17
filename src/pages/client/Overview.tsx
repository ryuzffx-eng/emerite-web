import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { clientGetProfile, clientGetStats, clientGetLicenses } from "@/lib/api";
import {
    Package,
    DollarSign,
    Shield,
    Zap,
    TrendingUp,
    Search,
    ShoppingBag,
    Check,
    Copy,
    Clock,
    Key
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn, formatIST } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    delay = 0
}: any) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="relative overflow-hidden bg-[#0a0a0a] border border-white/[0.05] p-6 rounded-xl shadow-sm flex flex-col justify-between h-full group hover:border-emerald-500/20 transition-all duration-500"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex items-start justify-between mb-6">
            <div className="p-3 rounded-lg bg-zinc-900 border border-white/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all shadow-inner">
                <Icon className="h-5 w-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            {trend && (
                <div className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border uppercase tracking-wider",
                    trend === "up" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                )}>
                    <div className={cn("w-1 h-1 rounded-full animate-pulse", trend === "up" ? "bg-emerald-500" : "bg-zinc-500")} />
                    {trend === "up" ? "Active" : "Neutral"}
                </div>
            )}
        </div>

        <div className="relative z-10">
            <div className="flex items-baseline gap-1 mb-1">
                <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{value}</h3>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
            {description && <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide opacity-80">{description}</p>}
        </div>
    </motion.div>
);


const ClientOverview = () => {
    const navigate = useNavigate();
    const { data: profile } = useQuery({
        queryKey: ["client-profile"],
        queryFn: clientGetProfile
    });

    const { data: stats } = useQuery({
        queryKey: ["client-stats"],
        queryFn: clientGetStats
    });

    const { data: licenses } = useQuery({
        queryKey: ["client-licenses"],
        queryFn: clientGetLicenses
    });

    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "License key copied to clipboard.",
        });
    };

    return (
        <DashboardLayout
            title="Overview"
            subtitle={`Last sync: ${formatIST(new Date(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} • System operational`}
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard
                        title="Active Products"
                        value={stats?.active_products || "0"}
                        icon={Package}
                        description="Verified inventory modules"
                        trend="up"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Subscriptions"
                        value={stats?.total_subscriptions || "0"}
                        icon={TrendingUp}
                        description="Active license streams"
                        trend="up"
                        delay={0.2}
                    />
                    <StatCard
                        title="Total Spent"
                        value={`${stats?.currency_symbol || "₹"}${stats?.total_spent?.toFixed(2) || "0.00"}`}
                        icon={DollarSign}
                        description="Operational investment"
                        delay={0.3}
                    />
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Live Subscriptions</h3>
                        </div>
                        {licenses && licenses.length > 0 && (
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{licenses.length} Total</span>
                        )}
                    </div>

                    {licenses && licenses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {licenses.map((license: any, index: number) => {
                                const expiresAt = license.expires_at ? new Date(license.expires_at) : null;
                                const isExpired = expiresAt && expiresAt < new Date();
                                const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                                let timeframeText = "Lifetime";
                                if (isExpired) {
                                    timeframeText = "Terminated";
                                } else if (daysLeft !== null) {
                                    timeframeText = `${daysLeft} Days Left`;
                                } else if (license.duration_days) {
                                    timeframeText = `${license.duration_days} Days (Unused)`;
                                }

                                return (
                                    <motion.div
                                        key={license.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * (index % 6) }}
                                        className="bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-xl group hover:border-emerald-500/20 transition-all duration-300 shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                license.is_active && !isExpired ? "bg-emerald-500 animate-pulse" : "bg-zinc-800"
                                            )} />
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                                <Zap className="h-4 w-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{license.app_name}</h4>
                                                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Deployment Instance</p>
                                            </div>
                                        </div>

                                        <div className="bg-black/40 border border-white/[0.02] rounded-lg p-3 mb-4 flex items-center justify-between group/key transition-colors hover:border-emerald-500/10">
                                            <code className="text-xs font-mono text-emerald-500/80 tracking-tighter truncate pr-4">
                                                {license.key}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(license.key)}
                                                className="p-1 text-zinc-700 hover:text-emerald-400 transition-colors"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest block">Status</span>
                                                <div className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-md border w-fit",
                                                    isExpired ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        license.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            "bg-zinc-800 text-zinc-500 border-zinc-700"
                                                )}>
                                                    {isExpired ? "Expired" : license.is_active ? "Active" : "Disabled"}
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest block">Timeframe</span>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase",
                                                    isExpired ? "text-zinc-600" : "text-zinc-300"
                                                )}>
                                                    {timeframeText}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-24 flex flex-col items-center justify-center text-center gap-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-700"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent_70%)]" />

                            <div className="relative">
                                <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-2 shadow-2xl group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all duration-500 rotate-45 group-hover:rotate-90">
                                    <Shield className="w-8 h-8 text-zinc-800 group-hover:text-emerald-500 transition-colors -rotate-45 group-hover:-rotate-90 duration-500" />
                                </div>
                                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>

                            <div className="space-y-3 max-w-sm relative z-10">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Registry Empty</h3>
                                <div className="h-1 w-12 bg-emerald-500/20 mx-auto rounded-full" />
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] leading-loose opacity-60">
                                    DATABASE CORE SHOWS NO ACTIVE DEPLOYMENTS. ACCESS THE GLOBAL ARMORY TO INITIALIZE YOUR FIRST MODULE.
                                </p>
                            </div>

                            <Button
                                onClick={() => navigate("/products")}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-[0.2em] h-12 px-10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 z-10"
                            >
                                <Zap className="w-4 h-4 fill-current mr-2" />
                                Browse Armory
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientOverview;
