import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingCart,
    MessageSquare,
    Settings,
    User,
    LogOut,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuth, clearAuth } from "@/lib/api";
import { motion } from "framer-motion";
import emeriteLogo from "@/assets/emerite-logo.png";

const menuItems = [
    {
        title: "Overview",
        icon: LayoutDashboard,
        path: "/client/dashboard"
    },
    {
        title: "Orders",
        icon: ShoppingCart,
        path: "/client/orders"
    },
    {
        title: "Support",
        icon: MessageSquare,
        path: "/client/support"
    },
    {
        title: "Settings",
        icon: Settings,
        path: "/profile"
    }
];

export const ClientSidebar = () => {
    const { pathname } = useLocation();
    const { user } = getAuth();

    const handleLogout = () => {
        clearAuth();
        window.location.href = "/";
    };

    return (
        <aside className="w-80 h-screen fixed left-0 top-0 bg-[#0a0a0a] border-r border-zinc-800/60 flex flex-col p-8 z-50">
            {/* Branding */}
            <div className="flex items-center gap-4 mb-14 px-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <img src={emeriteLogo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black uppercase tracking-tighter text-white">Emerite</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dashboard</span>
                </div>
            </div>

            {/* Profile Section */}
            <div className="mb-10 px-2">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full border-2 border-zinc-900 p-0.5 overflow-hidden ring-4 ring-emerald-500/5">
                        {user?.avatar || user?.avatar_url ? (
                            <img src={user.avatar || user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <User className="w-6 h-6 text-zinc-700" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-white truncate uppercase tracking-tight">{user?.username || "Commander"}</span>
                        <span className="text-[9px] font-bold text-zinc-600 truncate lowercase">{user?.email || "guest@emerite.store"}</span>
                        <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                                Member
                            </span>
                        </div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                            XP Status
                        </span>
                        <span className="text-[9px] font-black text-zinc-500 tabular-nums">0 / 1,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/10">
                        <div className="h-full w-[5%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 space-y-8">
                <div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 block px-4">
                        Main Menu
                    </span>
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? "bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 shadow-sm"
                                            : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        />
                                    )}
                                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-emerald-500/50")} />
                                    <span className="text-xs font-black uppercase tracking-widest transition-colors">
                                        {item.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-6 border-t border-zinc-900 space-y-4">
                <button
                    onClick={() => window.open('/products', '_self')}
                    className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group"
                >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-emerald-500/70">Browse Armor</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};
