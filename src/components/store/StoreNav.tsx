import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ShoppingCart, LogIn, UserPlus, Globe, ChevronDown, Trash2, X,
    CreditCard, User, LogOut, LayoutDashboard, ShoppingBag, MessageCircle,
    ChevronRight, Zap, Send, Menu, Info, Sparkles, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import emeriteLogo from "@/assets/emerite-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, clearAuth, getAuth } from "@/lib/api";
import { MarketDialog } from "./MarketDialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
    { label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Marketplace", path: "/products", icon: <ShoppingBag className="w-4 h-4" /> },
    { label: "Reviews", path: "/reviews", icon: <MessageCircle className="w-4 h-4" /> },
    { label: "Status", path: "/store-status", icon: <Zap className="w-4 h-4" /> },
    { label: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
];

export const StoreNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items, totalItems, totalPrice, removeFromCart, clearCart } = useCart();
    const { selectedRegion, isMarketOpen, setIsMarketOpen } = useMarket();
    const { toast } = useToast();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { userType, user } = getAuth();

    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    useEffect(() => {
        const handleAuthChange = () => {
            const auth = getAuth();
            setCurrentUser(auth.user);
        };
        window.addEventListener("auth-change", handleAuthChange);
        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const nav = document.getElementById('main-nav');
            if (nav) {
                const rect = nav.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const handleLogout = () => {
        clearAuth();
        navigate("/");
        toast({ title: "Logged out", description: "See you soon!" });
    };

    return (
        <>
            <motion.div
                initial={false}
                animate={{
                    top: isScrolled ? 0 : 16,
                    width: isScrolled ? "100%" : "96%",
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                className="fixed z-50 left-1/2 -translate-x-1/2"
            >
                <motion.nav
                    id="main-nav"
                    layout
                    initial={false}
                    animate={{
                        borderRadius: isScrolled ? 0 : 24,
                        padding: isScrolled ? "12px 24px" : "14px 12px",
                        backgroundColor: isScrolled
                            ? "rgba(5, 5, 5, 0.97)"
                            : "rgba(8, 8, 8, 0.4)",
                        backdropFilter: "blur(16px)",
                        maxWidth: isScrolled ? "100%" : "80rem",
                        boxShadow: isScrolled
                            ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                            : "0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 32px rgba(0, 0, 0, 0.3)"
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 25 }}
                    className="w-full mx-auto relative group/nav"
                >
                    {/* Animated gradient border on hover (desktop only) */}
                    {!isScrolled && (
                        <div
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 rounded-3xl"
                            style={{
                                background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.1), transparent)`,
                            }}
                        />
                    )}

                    {/* Top accent line */}
                    {!isScrolled && (
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-50 rounded-t-3xl" />
                    )}

                    <div className="w-full flex items-center justify-between gap-4 relative z-10">
                        {/* Logo Section */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 group/logo shrink-0 hover:opacity-80 transition-opacity"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 rounded-xl border border-emerald-500/30 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover/logo:bg-emerald-500/15 transition-colors" />
                                <img
                                    src={emeriteLogo}
                                    alt="Emerite"
                                    className="w-6 h-6 object-contain relative z-10"
                                />
                            </motion.div>
                            <span className="text-white font-black text-lg tracking-tight hidden xl:block">
                                EMERITE<span className="text-emerald-400">.</span>
                            </span>
                        </Link>

                        {/* Navigation - Desktop */}
                        <div className={cn(
                            "hidden lg:flex items-center transition-all duration-500",
                            isAuthenticated()
                                ? "justify-center absolute inset-x-0 pointer-events-none"
                                : "flex-1 ml-12"
                        )}>
                            <div className={cn("flex gap-3", isAuthenticated() && "pointer-events-auto")}>
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <motion.div key={item.label} layout>
                                            <Link
                                                to={item.path}
                                                className={cn(
                                                    "relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 group/nav-item hover:bg-white/[0.05]",
                                                    isActive
                                                        ? "text-zinc-300"
                                                        : "text-zinc-500 hover:text-zinc-300"
                                                )}
                                            >
                                                <span className={cn(
                                                    "relative z-10 transition-colors duration-300",
                                                    isActive ? "text-zinc-300" : "group-hover/nav-item:text-zinc-200"
                                                )}>
                                                    {item.icon}
                                                </span>

                                                <span className="relative z-10">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                            {/* Region Selector */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMarketOpen(true)}
                                className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 transition-all group/region cursor-pointer focus:outline-none focus:ring-0"
                            >
                                <img
                                    src={`https://flagcdn.com/${(selectedRegion?.flag_code || "IN").toLowerCase()}.svg`}
                                    alt={selectedRegion?.currency_code || "INR"}
                                    className="w-5 h-3.5 object-cover rounded opacity-70 group-hover/region:opacity-100 transition-opacity"
                                />
                                <span className="text-xs font-bold text-zinc-400 group-hover/region:text-white transition-colors">
                                    {selectedRegion?.currency_code || "INR"}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:region:text-emerald-400 transition-colors" />
                            </motion.button>

                            {/* Cart */}
                            <DropdownMenu open={isCartOpen} onOpenChange={setIsCartOpen}>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-all text-zinc-400 hover:text-white border border-white/[0.05] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:border-emerald-500/50 data-[state=open]:bg-white/[0.05]"
                                    >
                                        <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                        <AnimatePresence>
                                            {totalItems > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0, y: -10 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    exit={{ scale: 0, y: -10 }}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-black text-xs flex items-center justify-center rounded-full font-black border border-emerald-600 shadow-lg shadow-emerald-500/20"
                                                >
                                                    {totalItems > 9 ? '9+' : totalItems}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    sideOffset={14}
                                    className="w-96 bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-5 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white uppercase tracking-wider leading-none">
                                                    Your Cart
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">
                                                    {totalItems} item{totalItems !== 1 && 's'} selected
                                                </span>
                                            </div>
                                        </div>
                                        {totalItems > 0 && (
                                            <button
                                                onClick={clearCart}
                                                className="h-8 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest transition-all"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto space-y-3 mb-6 no-scrollbar pr-1">
                                        {items.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                                <div className="relative mb-4">
                                                    <div className="absolute inset-0 bg-zinc-500/10 blur-2xl rounded-full" />
                                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center relative">
                                                        <ShoppingBag className="w-8 h-8 text-zinc-800" />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                                    Your cart is empty
                                                </p>
                                            </div>
                                        ) : (
                                            items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="group/cart-item p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/[0.03] hover:border-emerald-500/20 flex items-center gap-4 relative overflow-hidden"
                                                >
                                                    <div className="w-14 h-14 rounded-xl bg-black border border-white/[0.05] flex items-center justify-center overflow-hidden shrink-0 group-hover/cart-item:border-emerald-500/30 transition-colors">
                                                        {item.image ? (
                                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                        ) : (
                                                            <Zap className="w-6 h-6 text-emerald-500/20" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                                                {item.name}
                                                            </h4>
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black text-emerald-400 tabular-nums">
                                                                {selectedRegion?.currency_symbol || '$'}{item.price * item.quantity}
                                                            </span>
                                                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                                                                Quantity: {item.quantity}X
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeFromCart(item.id, item.plan_id)}
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-700 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/30"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {totalItems > 0 && (
                                        <div className="pt-4 border-t border-white/[0.05] space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Subtotal</span>
                                                    <span className="text-xl font-bold text-white tracking-tight mt-1">
                                                        {selectedRegion?.currency_symbol || '$'}{totalPrice}
                                                    </span>
                                                </div>
                                                <div className="h-10 w-px bg-white/[0.05]" />
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Priority</span>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">S-Class Access</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <motion.button
                                                    whileHover={{ y: -1 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => { setIsCartOpen(false); navigate('/cart'); }}
                                                    className="h-12 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    View Cart
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ y: -1 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                                                    className="h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                                                >
                                                    Checkout
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="w-px h-6 bg-white/10 mx-2" />

                            {/* User Menu */}
                            {isAuthenticated() ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] transition-all flex items-center justify-center overflow-hidden group/user focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:border-emerald-500/50 data-[state=open]:bg-white/[0.08]"
                                        >
                                            {currentUser?.avatar || currentUser?.avatar_url ? (
                                                <img
                                                    src={currentUser?.avatar || currentUser?.avatar_url}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-zinc-500 group-hover/user:text-emerald-400 transition-colors" />
                                            )}
                                            <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50" />
                                        </motion.button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={14}
                                        className="w-64 bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-3 shadow-2xl backdrop-blur-3xl z-50 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3 p-2 mb-2 bg-white/[0.02] border border-white/[0.05] rounded-xl relative overflow-hidden group/header">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity" />
                                            <div className="relative h-10 w-10 rounded-lg bg-zinc-950 border border-white/10 p-0.5 overflow-hidden shrink-0">
                                                {currentUser?.avatar || currentUser?.avatar_url ? (
                                                    <img src={currentUser.avatar || currentUser.avatar_url} alt="Avatar" className="w-full h-full rounded-md object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-md bg-zinc-900 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-zinc-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-white font-bold text-xs uppercase tracking-wider group-hover/header:text-emerald-400 transition-colors truncate">
                                                    {currentUser?.username || "Guest User"}
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-medium tracking-tight lowercase truncate">
                                                    {currentUser?.email || "guest@emerite.store"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {[
                                                { label: "Dashboard", icon: LayoutDashboard, path: userType === "client" ? "/client/dashboard" : userType === "reseller" ? "/reseller/dashboard" : "/dashboard" },
                                                { label: "Profile", icon: User, path: "/profile" },
                                                { label: "Get Support", icon: Zap, url: "https://discord.gg/YUD2hXZj2V" },
                                            ].map((item) => (
                                                <button
                                                    key={item.label}
                                                    onClick={() => item.path ? navigate(item.path) : window.open(item.url, '_blank')}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] active:bg-white/[0.05] group cursor-pointer border border-transparent hover:border-white/5 transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5" />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-red-500/10 active:bg-red-500/15 group cursor-pointer transition-all text-left border border-transparent hover:border-red-500/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <LogOut className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-500 transition-colors">
                                                        Logout
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/login"
                                        className="text-xs font-black text-zinc-400 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign In
                                    </Link>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/register')}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black h-9 px-6 rounded-lg text-xs uppercase tracking-wide transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Sign Up
                                    </motion.button>
                                </div>
                            )}

                        </div>
                    </div>
                </motion.nav>
            </motion.div>

            <MarketDialog open={isMarketOpen} onOpenChange={setIsMarketOpen} />

            {/* Premium Mobile Bottom Navigation for Store */}
            <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
                <nav className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] px-2 py-2">
                    <div className="flex items-center justify-around h-14">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-1 transition-all duration-300 px-2 py-1.5 rounded-2xl min-w-[64px]",
                                        isActive ? "text-emerald-400" : "text-zinc-500 hover:text-emerald-500/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="store-mobile-nav-pill"
                                            className="absolute inset-0 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className={cn("relative z-10 transition-transform duration-300", isActive && "scale-110")}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter relative z-10">{item.label}</span>
                                </Link>
                            );
                        })}

                    </div>
                </nav>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 1024px) {
                    body {
                        padding-bottom: 6rem;
                    }
                }
            `}} />
        </>
    );
};