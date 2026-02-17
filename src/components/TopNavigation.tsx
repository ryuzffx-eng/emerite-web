import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LayoutDashboard, Key, Users, AppWindow, Gift, FileText, Variable, UserCog, MessageSquare, LogOut, User, Activity, TrendingUp, ShoppingCart, Package, Zap, ChevronRight, MessageCircle, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAuth, clearAuth } from "@/lib/api";
import emeriteLogo from "@/assets/emerite-logo.png";

interface NavDropdownItem {
  title: string;
  description: string;
  icon: any;
  path?: string;
}

interface NavCategory {
  label: string;
  items: NavDropdownItem[];
  icon?: any;
}

const adminNavCategories: NavCategory[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Overview",
        description: "System overview & metrics",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
    ],
  },
  {
    label: "Management",
    icon: Key,
    items: [
      {
        title: "Licenses",
        description: "Manage all licenses",
        icon: Key,
        path: "/licenses",
      },
      {
        title: "Users",
        description: "User management system",
        icon: Users,
        path: "/users",
      },
      {
        title: "Applications",
        description: "Manage your applications",
        icon: AppWindow,
        path: "/applications",
      },
      {
        title: "Subscriptions",
        description: "Manage subscriptions",
        icon: Gift,
        path: "/subscriptions",
      },
    ],
  },
  {
    label: "Webhooks",
    icon: Gift,
    items: [
      {
        title: "Logs",
        description: "System logs and events",
        icon: FileText,
        path: "/logs",
      },
      {
        title: "Tickets",
        description: "Support tickets",
        icon: MessageSquare,
        path: "/tickets",
      },
      {
        title: "Variables",
        description: "System variables",
        icon: Variable,
        path: "/variables",
      },
    ],
  },
  {
    label: "Resellers",
    icon: LayoutDashboard,
    items: [
      {
        title: "Resellers",
        description: "Reseller management",
        icon: UserCog,
        path: "/resellers",
      },
    ],
  },
  {
    label: "Store",
    icon: LayoutDashboard,
    items: [
      {
        title: "Manage Products",
        description: "Marketplace storefront",
        icon: ShoppingCart,
        path: "/manage-products",
      },
      {
        title: "Revenue",
        description: "Financial performance",
        icon: TrendingUp,
        path: "/revenue",
      },
      {
        title: "Orders",
        description: "Transaction history",
        icon: Package,
        path: "/orders",
      },
      {
        title: "Team",
        description: "Manage team members",
        icon: Users,
        path: "/manage-team",
      }
    ],
  },
  {
    label: "Clients",
    icon: LayoutDashboard,
    items: [
      {
        title: "Clients",
        description: "Manage registered users",
        icon: Users,
        path: "/clients",
      }
    ],
  },
];

const resellerNavCategories: NavCategory[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Overview",
        description: "Your reseller dashboard",
        icon: LayoutDashboard,
        path: "/reseller/dashboard",
      },
    ],
  },
  {
    label: "Sales",
    icon: TrendingUp,
    items: [
      {
        title: "Users",
        description: "View your users",
        icon: Users,
        path: "/reseller/users",
      },
      {
        title: "Licenses",
        description: "Manage your licenses",
        icon: Key,
        path: "/reseller/licenses",
      },
      {
        title: "Products",
        description: "Your products",
        icon: AppWindow,
        path: "/reseller/applications",
      },
      {
        title: "Transactions",
        description: "Transaction history",
        icon: TrendingUp,
        path: "/reseller/transactions",
      },
    ],
  },
  {
    label: "Support",
    icon: MessageSquare,
    items: [
      {
        title: "Tickets",
        description: "Support tickets",
        icon: MessageSquare,
        path: "/reseller/tickets",
      },
    ],
  },
];

const clientNavCategories: NavCategory[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Overview",
        description: "Your account overview",
        icon: LayoutDashboard,
        path: "/client/dashboard",
      },
    ],
  },
  {
    label: "Purchases",
    icon: Package,
    items: [
      {
        title: "My Orders",
        description: "View your order history",
        icon: Package,
        path: "/client/orders",
      },
      {
        title: "Store",
        description: "Browse the armory",
        icon: ShoppingCart,
        path: "/products",
      },
    ],
  },
  {
    label: "Support",
    icon: MessageSquare,
    items: [
      {
        title: "Help Center",
        description: "Get assistance",
        icon: MessageSquare,
        path: "/client/support",
      },
    ],
  },
];

export const TopNavigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, user } = getAuth();

  const navCategories = userType === "reseller"
    ? resellerNavCategories
    : userType === "client"
      ? clientNavCategories
      : adminNavCategories;

  // Listen for auth changes to update UI immediately
  const [currentUser, setCurrentUser] = useState(user);
  const [currentUserType, setCurrentUserType] = useState(userType);

  // Update local state when prop/context changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const handleAuthChange = () => {
      const auth = getAuth();
      setCurrentUser(auth.user);
      setCurrentUserType(auth.userType);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  // Determine active category based on current path
  const currentCategory = navCategories.find(cat =>
    cat.items.some(item => location.pathname === item.path)
  );

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800/50 bg-[#0c0c0c]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                to={currentUserType === "reseller" ? "/reseller/dashboard" : currentUserType === "client" ? "/client/dashboard" : "/dashboard"}
                className="flex items-center gap-3 shrink-0 group"
              >
                <img
                  src={emeriteLogo}
                  alt="Emerite Logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain transition-all duration-500 group-hover:scale-110 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                />
                <span className="text-xl font-bold uppercase tracking-[0.2em] text-white group-hover:text-emerald-400 transition-all duration-300">
                  EMERITE
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navCategories.map((category) => (
                  <div
                    key={category.label}
                    className="relative group h-16 flex items-center"
                    onMouseEnter={() => setActiveDropdown(category.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors rounded-md h-9 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0",
                        activeDropdown === category.label
                          ? "text-white bg-zinc-800/50"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <span>{category.label}</span>
                      <ChevronDown className={cn(
                        "h-3 w-3 transition-transform duration-200 opacity-40",
                        activeDropdown === category.label && "rotate-180"
                      )} />
                    </button>

                    <div
                      className={cn(
                        "absolute top-full left-0 mt-0 pt-2 transition-all duration-300 ease-out",
                        activeDropdown === category.label
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2 pointer-events-none"
                      )}
                    >
                      <div className="w-[280px] bg-[#161616] border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden p-2 backdrop-blur-2xl">
                        <div className="grid gap-1">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                to={item.path || "#"}
                                className="group/item flex items-center gap-3.5 rounded-lg px-3 py-2.5 transition-all hover:bg-zinc-800/40"
                              >
                                <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover/item:border-emerald-500/30 group-hover/item:bg-emerald-500/5 transition-all">
                                  <ItemIcon className="h-4.5 w-4.5 text-zinc-400 group-hover/item:text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-zinc-100 group-hover/item:text-white transition-colors">
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 group-hover/item:text-zinc-400 line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="group relative outline-none cursor-pointer"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full border-2 border-zinc-800 transition-all duration-500 p-0.5 overflow-hidden",
                    userMenuOpen ? "border-emerald-500 scale-105" : "group-hover:border-emerald-500/50"
                  )}>
                    {currentUser?.avatar || currentUser?.avatar_url ? (
                      <img src={currentUser.avatar || currentUser.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-64 bg-[#0c0c0c] border border-zinc-900 rounded-[1.5rem] p-3 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                    >
                      {/* User Header */}
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
                          <span className="text-white font-black text-xs uppercase tracking-wider group-hover/header:text-emerald-400 transition-colors truncate">
                            {currentUser?.username || "Commander"}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold tracking-tight lowercase truncate">
                            {currentUser?.email || "guest@emerite.store"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {[
                          { label: "Profile", icon: User, path: "/profile", color: "emerald" },
                          { label: "Get Support", icon: Zap, url: "https://discord.gg/YUD2hXZj2V", color: "emerald" },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => item.path ? navigate(item.path) : window.open(item.url, '_blank')}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] active:bg-white/[0.05] group cursor-pointer border border-transparent hover:border-white/5 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 group-hover:text-white transition-colors">
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
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 group-hover:text-red-500 transition-colors">
                              Logout
                            </span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <nav className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] px-2 py-2">
          <div className="flex items-center justify-around h-14">
            {navCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isActive = currentCategory?.label === category.label || (mobileActiveCategory === category.label && mobileModalOpen);

              return (
                <button
                  key={category.label}
                  onClick={() => {
                    if (category.items.length === 1) {
                      if (category.items[0].path) {
                        navigate(category.items[0].path);
                      }
                    } else {
                      setMobileActiveCategory(category.label);
                      setMobileModalOpen(true);
                    }
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 transition-all duration-300 px-2 py-1.5 rounded-2xl min-w-[64px]",
                    isActive ? "text-emerald-400" : "text-zinc-500 hover:text-emerald-500/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <CategoryIcon className={cn("h-4.5 w-4.5 mb-0.5 relative z-10", isActive && "text-emerald-400")} />
                  <span className="text-[9px] font-black uppercase tracking-tighter relative z-10">{category.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileModalOpen && mobileActiveCategory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileModalOpen(false)}
            />

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-[96px] left-4 right-4 z-[70] md:hidden overflow-hidden"
            >
              <div className="rounded-[2rem] border border-white/[0.08] bg-[#0c0c0c]/95 backdrop-blur-2xl shadow-2xl p-5 border-b-emerald-500/20">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      {(() => {
                        const Icon = navCategories.find(c => c.label === mobileActiveCategory)?.icon;
                        return Icon ? <Icon className="h-3.5 w-3.5 text-emerald-500" /> : null;
                      })()}
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                      {mobileActiveCategory} <span className="text-zinc-700 ml-1">//</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setMobileModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all ring-1 ring-white/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
                  {navCategories
                    .find(c => c.label === mobileActiveCategory)
                    ?.items.map((item, idx) => {
                      const ItemIcon = item.icon;
                      const isItemActive = location.pathname === item.path;
                      return (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          key={item.title}
                        >
                          <Link
                            to={item.path || "#"}
                            onClick={() => setMobileModalOpen(false)}
                            className={cn(
                              "flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 group overflow-hidden relative border",
                              isItemActive
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-white/[0.02] border-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.1] text-zinc-400"
                            )}
                          >
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                              isItemActive ? "bg-emerald-500 text-[#0c0c0c]" : "bg-black border border-white/[0.05] group-hover:border-emerald-500/30"
                            )}>
                              <ItemIcon className={cn("h-4.5 w-4.5", isItemActive ? "text-[#0c0c0c]" : "group-hover:text-emerald-400")} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                "text-[11px] font-black uppercase tracking-widest truncate",
                                isItemActive ? "text-white" : "group-hover:text-white"
                              )}>
                                {item.title}
                              </p>
                              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            {isItemActive && (
                              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 6rem;
          }
        }
      `}</style>
    </>
  );
};
