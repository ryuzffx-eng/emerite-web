import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    MessageSquare,
    Plus,
    Search,
    AlertCircle,
    Clock,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const StatusKPICard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-6 flex flex-col justify-between shadow-sm flex-1 group hover:border-white/10 transition-all duration-500 relative overflow-hidden h-[160px]"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex items-start justify-between mb-2">
            <div className={cn("p-3 rounded-lg bg-zinc-900 border border-white/10 group-hover:bg-zinc-800 transition-all shadow-inner", colorClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-white/5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase">Stable</span>
            </div>
        </div>

        <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white tracking-tight mb-0.5 group-hover:text-emerald-400 transition-colors">{value}</h3>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">{title}</p>
        </div>
    </motion.div>
);

const ClientSupport = () => {
    const [activeTab, setActiveTab] = React.useState("ALL");

    return (
        <DashboardLayout
            title="Help Center"
            subtitle="Access assistance for technical inquiries and operational help."
        >
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
                {/* Status KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatusKPICard
                        title="Active Tickets"
                        value="0"
                        icon={AlertCircle}
                        colorClass="text-red-500"
                        delay={0.1}
                    />
                    <StatusKPICard
                        title="In Progress"
                        value="0"
                        icon={Clock}
                        colorClass="text-orange-500"
                        delay={0.2}
                    />
                    <StatusKPICard
                        title="Resolved"
                        value="0"
                        icon={CheckCircle2}
                        colorClass="text-emerald-500"
                        delay={0.3}
                    />
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-hover:text-emerald-500/50 transition-colors" />
                        <Input
                            placeholder="Search incident reports..."
                            className="bg-[#0a0a0a] border-white/5 rounded-xl h-12 pl-12 text-sm font-medium text-zinc-400 focus:border-emerald-500/30 transition-all shadow-sm placeholder:text-zinc-700"
                        />
                    </div>

                    <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-1 flex gap-1 shadow-sm">
                        {["All", "Open", "Resolved"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toUpperCase())}
                                className={cn(
                                    "px-5 py-2 rounded-lg text-xs font-semibold transition-all",
                                    activeTab === tab.toUpperCase()
                                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <Button className="bg-white hover:bg-zinc-200 text-black font-bold text-xs h-12 px-8 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                        <Plus className="w-4 h-4 stroke-[3]" />
                        Initialize Ticket
                    </Button>
                </div>

                {/* Empty State */}
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-32 flex flex-col items-center justify-center text-center gap-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-700"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)]" />

                    <div className="relative">
                        <div className="w-24 h-24 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-2 shadow-2xl group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all duration-500 rotate-45 group-hover:rotate-0">
                            <ShieldCheck className="w-10 h-10 text-zinc-800 group-hover:text-emerald-500 transition-colors -rotate-45 group-hover:rotate-0 duration-500" />
                        </div>
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    <div className="space-y-4 max-w-sm relative z-10">
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Grid Secured</h3>
                        <div className="h-1 w-12 bg-white/10 mx-auto rounded-full" />
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide leading-relaxed opacity-80">
                            No incident signatures detected in the current buffer. The system is operating within stable parameters.
                        </p>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default ClientSupport;