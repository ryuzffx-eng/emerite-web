import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Key,
  Users,
  AppWindow,
  FileText,
  Variable,
  UserCog,
  MessageSquare,
  Gift,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Settings,
  Menu,
  X,
  Shield,
  Tag,
  ShoppingCart,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearAuth, getAuth } from "@/lib/api";
import emeriteLogo from "@/assets/emerite-logo.png";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Key, label: "Licenses", path: "/licenses" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: AppWindow, label: "Applications", path: "/applications" },
  { icon: Shield, label: "Cheat Control", path: "/cheat-control" },
  { icon: Tag, label: "Inventory", path: "/manage-products" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: TrendingUp, label: "Revenue", path: "/revenue" },
  { icon: UserRound, label: "Team", path: "/manage-team" },
  { icon: Gift, label: "Subscriptions", path: "/subscriptions" },
  { icon: FileText, label: "Logs", path: "/logs" },
  { icon: Variable, label: "Variables", path: "/variables" },
  { icon: UserCog, label: "Resellers", path: "/resellers" },
  { icon: MessageSquare, label: "Tickets", path: "/tickets" },
];

const resellerNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/reseller/dashboard" },
  { icon: Key, label: "Licenses", path: "/reseller/licenses" },
  { icon: AppWindow, label: "Products", path: "/reseller/applications" },
  { icon: MessageSquare, label: "Tickets", path: "/reseller/tickets" },
  { icon: FileText, label: "Transactions", path: "/reseller/transactions" },
  { icon: Settings, label: "Profile", path: "/reseller/profile" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    try {
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userType } = getAuth();

  const logoPath = userType === "reseller" ? "/reseller/dashboard" : "/dashboard";

  const navItems = userType === "reseller" ? resellerNavItems : adminNavItems;

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-black/95 px-4 backdrop-blur-xl lg:hidden">
        <Link to={logoPath} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <img src={emeriteLogo} alt="Emerite Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-xl font-bold text-white">
            Emerite
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hover:bg-zinc-800 text-zinc-300"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[70] h-screen bg-black transition-all duration-300 border-r border-zinc-800",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          !mobileOpen && (collapsed ? "lg:w-20" : "lg:w-64")
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo Header */}
          <div className="flex h-20 items-center px-4 border-b border-zinc-800 shrink-0">
            <Link to={logoPath} className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800">
                <img src={emeriteLogo} alt="Emerite Logo" className="h-7 w-7 object-contain" />
              </div>
              <span
                className={cn(
                  "text-xl font-bold text-white transition-all duration-300 whitespace-nowrap",
                  (collapsed && !mobileOpen) ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                Emerite
              </span>
            </Link>
          </div>

          {/* Toggle Button - Outside Header */}
          {!mobileOpen && (
            <div className="hidden lg:flex justify-end px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300 rounded-lg border border-zinc-800"
              >
                {/* nicer chevron toggle with rotation */}
                <ChevronLeft className={"h-4 w-4 transition-transform " + (collapsed ? "rotate-180" : "rotate-0")} />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon as any;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3.5 py-2 transition-all duration-200",
                    isActive
                      ? "bg-[#3ECF8E]/10 text-[#3ECF8E]" // Active state: low opacity green bg, green text
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  )}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  {/* Icon container */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? "text-[#3ECF8E]"
                            : "text-zinc-400 group-hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    {/* Only show tooltip when collapsed */}
                    {collapsed && !mobileOpen && (
                      <TooltipContent side="right" align="center" className="bg-zinc-800 text-white border-zinc-700">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <span
                    className={cn(
                      "font-medium whitespace-nowrap transition-all duration-300 truncate",
                      (collapsed && !mobileOpen) ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-zinc-800 p-3 space-y-1.5 mt-auto shrink-0 bg-black">
            {userType === "admin" && (
              <Link
                to="/status"
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3.5 py-2 transition-all duration-200",
                  "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
                title={collapsed && !mobileOpen ? "System Status" : undefined}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg transition-all duration-200", "text-zinc-400 group-hover:text-white")}>
                      <Activity className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  {collapsed && !mobileOpen && <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">System Status</TooltipContent>}
                </Tooltip>

                <span
                  className={cn(
                    "font-medium whitespace-nowrap transition-all duration-300 truncate",
                    (collapsed && !mobileOpen) ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  System Status
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3.5 py-2 h-auto rounded-lg transition-all duration-200",
                collapsed && !mobileOpen && "justify-center px-0"
              )}
              onClick={handleLogout}
              title={collapsed && !mobileOpen ? "Logout" : undefined}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg transition-all duration-200", "text-red-500 hover:bg-red-500/10")}>
                    <LogOut className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                {collapsed && !mobileOpen && <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">Logout</TooltipContent>}
              </Tooltip>

              <span
                className={cn(
                  "font-medium whitespace-nowrap transition-all duration-300",
                  (collapsed && !mobileOpen) ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                Logout
              </span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};