import React, { ReactNode } from "react";
import { ClientSidebar } from "./ClientSidebar";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ClientDashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    breadcrumb?: string[];
}

export const ClientDashboardLayout = ({
    children,
    title,
    subtitle,
    breadcrumb = ["DASHBOARD"]
}: ClientDashboardLayoutProps) => {
    // Current time for the helper widget
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans relative overflow-x-hidden">
            {/* Cinematic Background Effects - Global */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Primary Light Source (Top Left) */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" />

                {/* Secondary Ambient Glow (Bottom Right) */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-emerald-900/20 blur-[180px] rounded-full mix-blend-screen" />

                {/* Cinematic Rays/Beams */}
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(16,185,129,0.03)_30%,transparent_60%)] opacity-70" />
                <div className="absolute top-0 left-[-20%] w-[150%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent rotate-12 opacity-40" />
            </div>

            <ClientSidebar />

            <main className="pl-80 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto px-10 py-10">
                    {/* Header Controls */}
                    <div className="flex items-start justify-between mb-12">
                        <div className="space-y-3">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2">
                                {breadcrumb.map((item, idx) => (
                                    <React.Fragment key={item}>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em]",
                                            idx === breadcrumb.length - 1 ? "text-white" : "text-zinc-600"
                                        )}>
                                            {item}
                                        </span>
                                        {idx < breadcrumb.length - 1 && (
                                            <span className="text-zinc-800 text-[9px]">/</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Main Title */}
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black uppercase tracking-tighter"
                            >
                                {title}
                            </motion.h1>

                            {/* Subtitle / Greeting */}
                            {subtitle && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="h-px w-6 bg-emerald-500/40" />
                                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                                        {subtitle}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Local Time Widget */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-black/40 border border-white/5 rounded-xl p-3.5 flex items-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-md group hover:border-emerald-500/20 transition-all cursor-default"
                        >
                            <div className="w-9 h-9 rounded-lg bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Time</span>
                                <span className="text-xs font-black text-white uppercase tracking-tight tabular-nums">
                                    {formatTime(currentTime)}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Page Content */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

// Utility to merge class names
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
