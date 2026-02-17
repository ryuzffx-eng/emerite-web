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
        <div className="min-h-screen bg-[#060606] text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-80 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
            </div>

            <ClientSidebar />

            <main className="pl-80 min-h-screen">
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
                            className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-3.5 flex items-center gap-4 shadow-sm backdrop-blur-md group hover:border-zinc-700/80 transition-all"
                        >
                            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
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
