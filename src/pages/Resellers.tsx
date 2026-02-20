import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  getResellers,
  createReseller,
  updateReseller,
  deleteReseller,
  addResellerBalance,
  deductResellerBalance,
  getApplications,
  assignApplicationToReseller,
  removeApplicationFromReseller,
  getResellerApplications,
  getResellerSubscriptions,
  getAuth,
  getSubscriptionPlans,
  assignSubscriptionToReseller as assignSubToReseller,
  deleteResellerSubscription,
  pauseResellerSubscription,
  resumeResellerSubscription,
  getResellerTransactions,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Pause,
  Play,
  Edit,
  UserCog,
  Coins,
  PlusCircle,
  MinusCircle,
  Package,
  Check,
  X,
  Shield,
  Wallet,
  Phone,
  Building,
  FileText,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Eye,
  LogIn,
  Mail,
  Copy,
  Clock,
  Globe,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn, formatIST } from "@/lib/utils";

// ✨ Emerite Color Palette - Synced with Logo -> Green Theme
const EMERITE = {
  primary: "#3ECF8E", // emerald
  secondary: "#10b981", // teal/green
  accent: "#34d399", // light green
  light: "#6ee7b7", // lighter green
  dark: "#064e3b", // dark green
};

interface Reseller {
  id: string;
  username: string;
  credits: number;
  is_active: boolean;
  created_at: string;
  total_licenses_created?: number;
  email?: string;
  discord_id?: string;
  company_name?: string;
  phone?: string;
  notes?: string;
  app_count?: number;
  subscription_count?: number;
}

interface Application {
  id: string;
  name: string;
}

// Enhanced Subscriptions Section with emerite theme
function ResellerSubscriptionsSection({
  reseller,
  resellerProducts,
  resellerSubscriptions,
  setResellerSubscriptions,
  toast,
  applications,
}: any) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!reseller || !resellerSubscriptions) return;
    setLoading(true);
    getSubscriptionPlans()
      .then((data) => {
        setPlans(data || []);
      })
      .catch((error) => {
        console.error("Failed to fetch plans:", error);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, [reseller, resellerProducts, resellerSubscriptions]);

  // Filter available plans: Must be for an assigned product AND not already assigned
  const availablePlans = plans.filter((plan: any) => {
    const isProductAssigned = resellerProducts.includes(String(plan.app_id));
    const isAlreadySubscribed = resellerSubscriptions.some((s: any) =>
      (s.plan_id === plan.id) || (s.id === plan.id && s.expires_at) // loosely check if this plan is in subs
      // Better check: usually subs have plan_id. If sub structure matches plan structure, we need to be careful.
      // Assuming sub has plan_id or we match by checking existence. 
      // Let's rely on backend usually, but for UI filtering:
    );
    // Actually, one reseller can have multiple subs of same plan? Usually no.
    // Let's check if the plan ID is already in the subscriptions list under plan_id
    const alreadyHasPlan = resellerSubscriptions.some((s: any) => s.plan_id === plan.id);

    return isProductAssigned && !alreadyHasPlan;
  });

  const handleAssign = async (plan: any) => {
    if (!reseller) return;
    setAssigningId(plan.id);
    try {
      const sub = await assignSubToReseller(reseller.id, { plan_id: plan.id });
      setResellerSubscriptions((prev: any) => [...prev, sub]);
      toast({ title: "✓ Plan provisioned successfully" });
    } catch (err: any) {
      toast({
        title: "Provisioning failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemove = async (subId: number) => {
    if (!reseller) return;

    setRemovingId(subId);
    try {
      await deleteResellerSubscription(reseller.id, subId);
      setResellerSubscriptions((prev: any) =>
        prev.filter((s: any) => String(s.id) !== String(subId))
      );
      toast({ title: "✓ Plan revoked successfully" });
    } catch (err: any) {
      toast({
        title: "Revocation failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleTogglePause = async (sub: any) => {
    if (!reseller || !sub.id) return;
    const isPaused = sub?.name?.endsWith(" (paused)");
    try {
      if (isPaused) {
        await resumeResellerSubscription(reseller.id, sub.id);
        toast({ title: "Subscription Resumed" });
      } else {
        await pauseResellerSubscription(reseller.id, sub.id);
        toast({ title: "Subscription Paused" });
      }

      // Refresh subscriptions list
      const subs = await getResellerSubscriptions(reseller.id);
      setResellerSubscriptions(subs || []);
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const getAppName = (appId: any) => {
    return applications.find((a: any) => String(a.id) === String(appId))?.name || `App #${appId}`;
  };

  return (
    <div className="space-y-8">
      {/* SECTION: Available Plans (Catalog) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Available Plans</h3>
          </div>
          <Badge variant="outline" className="text-[9px] font-semibold px-2 py-0.5 border-zinc-800 text-zinc-600 uppercase tracking-widest">
            {availablePlans.length} Available
          </Badge>
        </div>

        {loading ? (
          <div className="py-10 text-center text-zinc-600 text-[10px] bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 animate-pulse">
            Loading plan catalog...
          </div>
        ) : availablePlans.length === 0 ? (
          <div className="py-8 text-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">
              {resellerProducts.length === 0 ? "Assign products to view plans" : "All available plans assigned"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className="group relative p-4 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:bg-black/60 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md"
              >
                <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Package className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
                </div>

                <div className="relative z-10 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-zinc-950/50 border-zinc-800 text-[9px] font-semibold text-zinc-500 uppercase tracking-wide px-2 py-0.5 rounded-md">
                      {getAppName(plan.app_id)}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-white tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
                    {plan.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                    Tier ID: {plan.id} • Premium Features
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAssign(plan)}
                  disabled={assigningId === plan.id}
                  className="w-full h-9 bg-white hover:bg-emerald-500 text-black font-black text-[9px] uppercase tracking-[0.15em] transition-all rounded-lg border-0 shadow-lg"
                >
                  {assigningId === plan.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Add Plan <Plus className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* SECTION: Active Subscriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Active Subscriptions</h3>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {resellerSubscriptions?.length || 0} RUNNING
          </Badge>
        </div>

        {resellerSubscriptions.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-zinc-900/10 flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-sm opacity-50">
              <Shield className="h-6 w-6 text-zinc-600" />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No active plans</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resellerSubscriptions.map((sub: any) => (
              <div
                key={sub.id}
                className="group relative p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-black/60 hover:border-emerald-500/20 transition-all duration-500 flex items-center gap-4 overflow-hidden backdrop-blur-md"
              >
                <div className="absolute right-12 top-1/2 -translate-y-1/2 h-full w-32 bg-gradient-to-l from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-105 flex-shrink-0",
                  sub?.name?.endsWith(" (paused)")
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                  <Shield className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                    sub?.name?.endsWith(" (paused)") ? "text-yellow-500" : "text-emerald-500"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight truncate uppercase">
                    {sub.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 opacity-60">
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {getAppName(sub.app_id)}
                    </span>
                    <span className="hidden sm:inline-block h-0.5 w-0.5 rounded-full bg-zinc-600" />
                    <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                      EXPIRES: {formatIST(sub.expires_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all border border-transparent",
                      sub?.name?.endsWith(" (paused)")
                        ? "hover:bg-emerald-500/10 text-emerald-500 hover:border-emerald-500/50"
                        : "hover:bg-yellow-500/10 text-yellow-500 hover:border-yellow-500/50"
                    )}
                    onClick={() => handleTogglePause(sub)}
                  >
                    {sub?.name?.endsWith(" (paused)") ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handleRemove(sub.id)}
                    disabled={removingId === sub.id}
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/50 text-zinc-500 hover:text-red-500 p-0 transition-all z-10"
                  >
                    {removingId === sub.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MobileResellerCard = ({ reseller, onProducts, onBalance, onEdit, onDelete, onPreview }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-xl p-5 space-y-5 transition-all duration-300 hover:border-emerald-500/40 shadow-xl">
      {/* Header: Identity + Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner group-hover:border-emerald-500/30 transition-colors">
              <UserCog className="h-6 w-6 text-emerald-500" />
            </div>
            <div className={cn(
              "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 shadow-lg",
              reseller.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate leading-none mb-1.5">{reseller.username}</h3>
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-zinc-600" />
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{reseller.company_name || 'Individual Partner'}</p>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-800/50 text-zinc-500">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-[300px] border-white/10 rounded-xl bg-black/90 backdrop-blur-3xl p-3 shadow-2xl">
            <div className="flex flex-col gap-1.5">
              <Button onClick={() => { setOpen(false); onProducts(reseller); }} variant="ghost" className="justify-start h-12 rounded-lg gap-3 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-tight">
                <Package className="h-4 w-4 text-emerald-500" /> Products
              </Button>
              <Button onClick={() => { setOpen(false); onBalance(reseller); }} variant="ghost" className="justify-start h-12 rounded-lg gap-3 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-tight">
                <Coins className="h-4 w-4 text-teal-400" /> Credits
              </Button>
              <Button onClick={() => { setOpen(false); onEdit(reseller); }} variant="ghost" className="justify-start h-12 rounded-lg gap-3 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-tight">
                <Edit className="h-4 w-4 text-blue-400" /> Edit Reseller
              </Button>
              <div className="h-px bg-zinc-800/50 my-1.5 mx-2" />
              <Button onClick={() => { setOpen(false); onDelete(reseller.id, reseller.username); }} variant="ghost" className="justify-start h-12 rounded-lg gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 font-black text-xs uppercase tracking-tight">
                <Trash2 className="h-4 w-4" /> Delete Reseller
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-center text-left">
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Wallet className="h-2.5 w-2.5" /> BALANCE
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-emerald-500/50">$</span>
            <span className="text-2xl font-black text-white tracking-tighter">
              {parseFloat(String(reseller.credits)).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-center items-start">
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Shield className="h-2.5 w-2.5" /> STATUS
          </p>
          <div className={cn(
            "text-[8px] font-black w-fit py-1 px-2 border rounded-lg tracking-widest uppercase",
            reseller.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            {reseller.is_active ? "ACTIVE" : "INACTIVE"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 opacity-60">
          <Package className="h-3 w-3 text-zinc-500" />
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">{(reseller.app_count || 0)} PRODUCTS</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-zinc-800" />
        <div className="flex items-center gap-1.5 opacity-60">
          <Sparkles className="h-3 w-3 text-emerald-500/40" />
          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">{(reseller.subscription_count || 0)} SUBSCRIPTIONS</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <Button
          onClick={() => onPreview(reseller)}
          className="flex-1 h-12 rounded-xl bg-white/5 border border-zinc-800 hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <Eye className="h-3.5 w-3.5 mr-2" /> DASHBOARD
        </Button>
      </div>

      <Button
        onClick={() => onProducts(reseller)}
        className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95"
      >
        MANAGE RESELLER
      </Button>
    </div>
  );
};

function ResellerCard({ reseller, onProducts, onBalance, onEdit, onDelete }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl -z-10" />

      <div className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-xl p-6 transition-all duration-500 shadow-xl hover:shadow-emerald-500/10 h-full flex flex-col">
        {/* Decorative Watermark */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none group-hover:rotate-12 group-hover:scale-110">
          <UserCog className="h-32 w-32 -mr-12 -mt-12 text-white" />
        </div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                <UserCog className="h-7 w-7 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className={cn(
                "absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-zinc-950 shadow-lg",
                reseller.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]">{reseller.username}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Building className="h-3 w-3 text-zinc-600" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide truncate">{reseller.company_name || 'Individual Partner'}</p>
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-800/50 text-zinc-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 sm:max-w-xs rounded-xl bg-black/90 backdrop-blur-xl p-3">
              <div className="flex flex-col gap-1">
                <Button onClick={() => { setOpen(false); onProducts(reseller); }} variant="ghost" className="justify-start h-12 rounded-xl gap-3 text-zinc-300 hover:text-white font-bold">
                  <Package className="h-4 w-4 text-emerald-500" /> Products
                </Button>
                <Button onClick={() => { setOpen(false); onBalance(reseller); }} variant="ghost" className="justify-start h-12 rounded-xl gap-3 text-zinc-300 hover:text-white font-bold">
                  <Coins className="h-4 w-4 text-teal-400" /> Credits
                </Button>
                <Button onClick={() => { setOpen(false); onEdit(reseller); }} variant="ghost" className="justify-start h-12 rounded-xl gap-3 text-zinc-300 hover:text-white font-bold">
                  <Edit className="h-4 w-4 text-blue-400" /> Edit
                </Button>
                <div className="h-px bg-zinc-800/50 my-1 mx-2" />
                <Button onClick={() => { setOpen(false); onDelete(reseller.id, reseller.username); }} variant="ghost" className="justify-start h-12 rounded-xl gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 flex-1">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 group-hover:border-emerald-500/20 transition-all duration-500 flex flex-col justify-center text-left">
            <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Wallet className="h-3 w-3" /> BALANCE
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-emerald-500/50">$</span>
              <span className="text-3xl font-bold text-white tracking-tighter">
                {parseFloat(String(reseller.credits)).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-center items-start">
            <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> STATUS
            </p>
            <Badge variant="outline" className={cn(
              "font-semibold text-[8px] w-fit py-1 px-2.5 tracking-[0.1em] transition-all",
              reseller.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-inner" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
              {reseller.is_active ? "ACTIVE" : "INACTIVE"}
            </Badge>

            <div className="flex items-center gap-3 mt-3 w-full pt-2.5 border-t border-zinc-800/50">
              <div className="flex items-center gap-1 opacity-60">
                <Package className="h-2.5 w-2.5 text-zinc-400" />
                <span className="text-[8px] font-semibold text-zinc-400">{(reseller.app_count || 0)}</span>
              </div>
              <div className="h-0.5 w-0.5 rounded-full bg-zinc-800" />
              <div className="flex items-center gap-1 opacity-60">
                <Sparkles className="h-2.5 w-2.5 text-emerald-500/50" />
                <span className="text-[8px] font-semibold text-zinc-400">{(reseller.subscription_count || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 relative z-10 mt-auto">
          <Button
            onClick={() => onProducts(reseller)}
            className="flex-1 h-12 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/50 hover:bg-black/60 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all duration-300"
          >
            Manage
          </Button>
          <Button
            onClick={() => onBalance(reseller)}
            className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-0"
          >
            <Plus className="h-5 w-5 text-black" />
          </Button>
        </div>
      </div>
    </div>
  );
}



export default function Resellers() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editReseller, setEditReseller] = useState<Reseller | null>(null);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [resellerProducts, setResellerProducts] = useState<string[]>([]);
  const [balanceAction, setBalanceAction] = useState<"add" | "deduct">("add");
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [resellerSubscriptions, setResellerSubscriptions] = useState<any[]>([]);
  const [processingProducts, setProcessingProducts] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("products");
  const [currentUserType, setCurrentUserType] = useState<"admin" | "reseller" | "client" | null>(null);
  const [currentResellerId, setCurrentResellerId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null; username: string }>({
    open: false,
    id: null,
    username: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [previewReseller, setPreviewReseller] = useState<Reseller | null>(null);
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [credits, setCredits] = useState<string>("0");
  const [isActive, setIsActive] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Get current user type on mount
  useEffect(() => {
    const auth = getAuth();
    setCurrentUserType(auth.userType);
    if (auth.userType === "reseller") {
      setCurrentResellerId(auth.token ? "current" : null);
    }
  }, []);

  const fetchResellers = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        getResellers(),
        getApplications(),
      ]);

      const [resellersResult, appsResult] = results;

      if (resellersResult.status === "fulfilled") {
        setResellers(resellersResult.value || []);
      } else {
        console.error("[Resellers] Failed to fetch resellers:", resellersResult.reason);
        toast({
          title: "Failed to load resellers",
          description: resellersResult.reason.message,
          variant: "destructive",
        });
      }

      if (appsResult.status === "fulfilled") {
        setApplications(appsResult.value || []);
      }
    } catch (error: any) {
      console.error("[Resellers] Critical fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchResellers();
      setLastUpdated(new Date());
      toast({ title: "✓ Data refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const filteredResellers = resellers.filter(r => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = r.username.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.company_name?.toLowerCase().includes(term);
    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "active" && r.is_active) ||
      (filterStatus === "inactive" && !r.is_active);
    return matchesSearch && matchesFilter;
  });

  const totalLiquidity = resellers.reduce((acc, r) => acc + (Number(r.credits) || 0), 0);
  const globalAsset = resellers.reduce((acc, r) => acc + (Number(r.total_licenses_created) || 0), 0);
  const activeNodes = resellers.filter(r => r.is_active).length;

  const handleSubmit = async () => {
    try {
      if (editReseller) {
        await updateReseller(editReseller.id, {
          is_active: isActive,
          company_name: companyName,
          phone: phone,
          email: email,
          discord_id: discordId,
        });
        toast({ title: "✓ Reseller updated successfully" });
        setDialogOpen(false);
        resetForm();
        fetchResellers();
      } else {
        if (!username || !email || !password) {
          toast({
            title: "Missing fields",
            description: "Please fill in username, email, and password",
            variant: "destructive",
          });
          return;
        }
        await createReseller({
          username,
          email,
          password: password || undefined,
          discord_id: discordId || undefined,
          initial_credits: parseInt(credits) || 0,
          company_name: companyName,
          phone: phone,
        });
        toast({ title: "✓ Reseller created successfully" });
        setDialogOpen(false);
        const [resellersList] = await Promise.all([getResellers()]);
        setResellers(resellersList || []);
        const newReseller = resellersList?.find((r: any) => r.username === username);
        if (newReseller) {
          toast({
            title: "Next Step: Assign Products",
            description: "Please assign applications and subscriptions to the new reseller."
          });
          resetForm();
          openProductsDialog(newReseller);
        } else {
          resetForm();
          fetchResellers();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, username: string) => {
    setDeleteConfirm({ open: true, id, username });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      await deleteReseller(deleteConfirm.id);
      toast({ title: "✓ Reseller deleted" });
      setDeleteConfirm({ open: false, id: null, username: "" });
      fetchResellers();
    } catch (error: any) {
      toast({ title: "Error deleting reseller", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBalanceChange = async () => {
    const amount = parseFloat(balanceAmount);
    if (!selectedReseller || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      if (balanceAction === "add") {
        await addResellerBalance(selectedReseller.id, amount);
      } else {
        await deductResellerBalance(selectedReseller.id, amount);
      }
      toast({
        title: `✓ Balance ${balanceAction === "add" ? "added" : "deducted"}`,
        description: `$${amount.toFixed(2)} successfully processed`,
      });
      setBalanceDialogOpen(false);
      setBalanceAmount("");
      setSelectedReseller(null);
      fetchResellers();
    } catch (error: any) {
      toast({ title: "Transaction failed", description: error.message, variant: "destructive" });
    }
  };

  const openBalanceDialog = (r: Reseller) => {
    setSelectedReseller(r);
    setBalanceAction("add");
    setBalanceAmount("");
    setBalanceDialogOpen(true);
  };

  const openProductsDialog = async (r: Reseller) => {
    setSelectedReseller(r);
    // Clear previous state immediately to avoid ghost data
    setResellerProducts([]);
    setResellerSubscriptions([]);

    setActiveTab("products");
    setProductsDialogOpen(true);
    setProductsLoading(true);
    try {
      const [products, subs] = await Promise.all([
        getResellerApplications(r.id),
        getResellerSubscriptions(r.id).catch(() => []),
      ]);
      setResellerProducts(products?.map((p: any) => String(p.id || p)) || []);
      setResellerSubscriptions(subs || []);
    } catch (err: any) {
      toast({ title: "Failed to load", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductToggle = async (appId: string, isAdding: boolean) => {
    if (!selectedReseller) return;
    setProcessingProducts((s) => ({ ...s, [appId]: true }));
    try {
      const appIdNum = parseInt(appId);
      if (isAdding) {
        await assignApplicationToReseller(selectedReseller.id, appIdNum);
        toast({ title: "✓ Product assigned" });
      } else {
        await removeApplicationFromReseller(selectedReseller.id, appIdNum);
        toast({ title: "✓ Product removed" });
      }
      await openProductsDialog(selectedReseller);
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || String(error), variant: "destructive" });
    } finally {
      setProcessingProducts((s) => ({ ...s, [appId]: false }));
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setDiscordId("");
    setCredits("0");
    setIsActive(true);
    setCompanyName("");
    setPhone("");
    setNotes("");
    setCredits("0");
    setEditReseller(null);
  };

  const openEdit = (r: Reseller) => {
    setEditReseller(r);
    setUsername(r.username);
    setEmail(r.email || "");
    setDiscordId(r.discord_id || "");
    setCompanyName(r.company_name || "");
    setPhone(r.phone || "");
    setNotes(r.notes || "");
    setIsActive(r.is_active);
    setDialogOpen(true);
  };

  return (
    <>
      <DashboardLayout
        title={currentUserType === "admin" ? "Resellers" : "My Account"}
        subtitle={currentUserType === "admin" ? "Manage reseller accounts, credits, and apps" : "View your account details"}
      >


        <div className="space-y-8 transition-all duration-300">
          {/* Top Summary Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl shadow-black/20">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="p-3 sm:p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Reseller Network</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUserType === "admin" ? "Reseller Network" : (resellers[0]?.username || "System Operator")}
                </h2>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Resellers", value: resellers.length, icon: UserCog, color: "zinc", delay: '0ms' },
              { label: "Active", value: activeNodes, icon: Check, color: "emerald", delay: '75ms' },
              { label: "Total Balance", value: `$${totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet, color: "blue", delay: '150ms' },
              { label: "Total Licenses", value: globalAsset, icon: Coins, color: "zinc", delay: '225ms' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-lg backdrop-blur-md hover:border-white/10 transition-all duration-300 shadow-xl shadow-black/20"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest truncate mr-1">{stat.label}</p>
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 opacity-60 flex-shrink-0", `text-${stat.color}-500`)} />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{stat.value}</p>
                  <div className="mt-3 sm:mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full opacity-40", `bg-${stat.color}-500`)}
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Search partner network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-black/40 border-white/5 h-10 md:h-12 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-lg transition-all hover:bg-black/60 focus:bg-black/80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-white/5 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20 backdrop-blur-md">
              {currentUserType === "admin" && (
                <>
                  <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 md:h-10 w-9 md:w-10 hover:bg-emerald-500/10 hover:text-emerald-400 flex-shrink-0 text-zinc-500 transition-all active:scale-95"
                        title="Add New Reseller"
                      >
                        <Plus className="h-4.25 w-4.25" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-full rounded-2xl border-white/10 sm:max-w-[500px] max-h-[90vh] overflow-hidden bg-black/90 backdrop-blur-3xl p-0 shadow-2xl">
                      <div className="flex flex-col h-full max-h-[90vh]">
                        {/* Tactical Header - Refined */}
                        <div className="relative p-6 bg-gradient-to-br from-zinc-900/80 to-black overflow-hidden border-b border-zinc-800/50">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <UserCog className="h-32 w-32 -mr-10 -mt-10 text-white" />
                          </div>

                          <div className="relative z-10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                              {editReseller ? <Edit className="h-6 w-6 text-emerald-500" /> : <Plus className="h-6 w-6 text-emerald-500" />}
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-black text-white tracking-tight uppercase leading-none">
                                {editReseller ? "Edit Reseller" : "New Reseller"}
                              </DialogTitle>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <Shield className="h-3 w-3 text-emerald-500/50" />
                                {editReseller ? `${editReseller.username}` : "Create Account"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                          {/* Identity Card */}
                          <div className="rounded-xl border border-white/5 bg-black/40 p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                              <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <UserCog className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">User Details</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</Label>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                    <UserCog className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                                  </div>
                                  <Input
                                    placeholder="Emerite"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!!editReseller}
                                    className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-emerald-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold font-mono"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</Label>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                    <FileText className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                                  </div>
                                  <Input
                                    type="email"
                                    placeholder="emerite@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-emerald-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold font-mono"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Discord ID</Label>
                              <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                  <Shield className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <Input
                                  placeholder="123456789012345678"
                                  value={discordId}
                                  onChange={(e) => setDiscordId(e.target.value)}
                                  className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-emerald-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold font-mono"
                                />
                              </div>
                            </div>

                            {!editReseller && (
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</Label>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                    <Shield className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                                  </div>
                                  <Input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-emerald-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold font-mono"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Business Card */}
                          <div className="rounded-xl border border-white/5 bg-black/40 p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                              <div className="h-6 w-6 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                <Building className="h-3.5 w-3.5 text-teal-500" />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Company</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Organization</Label>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                    <Building className="h-4 w-4 text-zinc-600 group-focus-within:text-teal-500 transition-colors" />
                                  </div>
                                  <Input
                                    placeholder="Emerite Store"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-teal-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Contact</Label>
                                <div className="relative group">
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-zinc-800/50 bg-zinc-900/50 rounded-l-lg">
                                    <Phone className="h-4 w-4 text-zinc-600 group-focus-within:text-teal-500 transition-colors" />
                                  </div>
                                  <Input
                                    placeholder="+91 1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-10 pl-12 border-zinc-800 bg-black/40 focus:bg-zinc-900/60 focus:ring-1 focus:ring-teal-500/50 transition-all rounded-lg text-white placeholder:text-zinc-700 text-xs font-bold font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Capitalization */}
                          {!editReseller && (
                            <div className="rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/50 to-black p-5 space-y-4 shadow-xl">
                              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Wallet className="h-3.5 w-3.5 text-amber-500" />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Credits</h4>
                                </div>
                                <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 uppercase">
                                  Initial Deposit
                                </div>
                              </div>

                              <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-focus-within:border-amber-500/50 transition-colors">
                                    <span className="font-serif text-lg text-amber-500 font-bold">$</span>
                                  </div>
                                  <div className="h-8 w-px bg-zinc-800/80" />
                                </div>
                                <Input
                                  type="text"
                                  value={credits}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d*$/.test(val)) {
                                      setCredits(val);
                                    }
                                  }}
                                  className="h-14 pl-20 text-2xl font-black border-zinc-800 bg-black/40 focus:bg-black/60 focus:ring-1 focus:ring-amber-500/50 transition-all rounded-lg text-white tracking-tighter shadow-inner placeholder:text-zinc-800"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}

                          {editReseller && (
                            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all text-left">
                              <div className="flex items-center gap-3">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border transition-all", isActive ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-red-500/10 border-red-500/20 opacity-50")}>
                                  <Shield className={cn("h-5 w-5", isActive ? "text-emerald-500" : "text-red-500")} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white tracking-tight">Status</span>
                                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{isActive ? "Active" : "Disabled"}</span>
                                </div>
                              </div>
                              <Switch checked={isActive} onCheckedChange={setIsActive} className="h-6 w-11 data-[state=checked]:bg-emerald-500" />
                            </div>
                          )}

                          <Button
                            onClick={handleSubmit}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-xl border-0"
                          >
                            <span className="flex items-center justify-center gap-2.5">
                              {editReseller ? <RefreshCw className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                              {editReseller ? "SAVE" : "ADD RESELLER"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="w-px h-6 bg-zinc-800/80 mx-1" />
                </>
              )}

              {/* Filter */}
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="h-9 md:h-10 border-0 bg-transparent hover:bg-zinc-800/50 px-2 w-auto gap-1 [&>svg]:h-4 [&>svg]:w-4 flex-shrink-0 text-zinc-500 transition-all">
                  <Filter className="h-4.25 w-4.25" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all" className="text-white focus:bg-zinc-800">All Nodes</SelectItem>
                  <SelectItem value="active" className="text-white focus:bg-zinc-800">Active Only</SelectItem>
                  <SelectItem value="inactive" className="text-white focus:bg-zinc-800">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-zinc-800/80 mx-1" />

              {/* Refresh */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 md:h-10 w-9 md:w-10 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
              >
                <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-zinc-900/40 border border-zinc-800 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : filteredResellers.length === 0 ? (
            <div className="p-20 text-center rounded-xl border border-dashed border-white/5 bg-black/40 flex flex-col items-center justify-center backdrop-blur-md">
              <div className="h-20 w-20 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-xl mb-6">
                <UserCog className="h-10 w-10 text-zinc-700" />
              </div>
              <p className="text-xl font-black text-zinc-500 uppercase tracking-widest">No Active Nodes</p>
              <p className="text-xs text-zinc-600 mt-2 font-medium max-w-[280px]">No results found matching your current matrix parameters</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl">
                <DataTable
                  keyExtractor={(r) => String(r.id)}
                  columns={[
                    {
                      key: "reseller",
                      header: "Reseller",
                      render: (r: Reseller) => (
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <UserCog className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{r.username}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">{r.email}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "liquidity",
                      header: "Liquidity",
                      render: (r: Reseller) => (
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-emerald-500/50" />
                          <span className="text-sm font-black text-white">${parseFloat(String(r.credits || 0)).toFixed(2)}</span>
                        </div>
                      ),
                    },
                    {
                      key: "integrity",
                      header: "Status",
                      render: (r: Reseller) => (
                        <Badge className={cn(
                          "text-[9px] uppercase font-black px-2 py-0.5",
                          r.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {r.is_active ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                    {
                      key: "context",
                      header: "Company",
                      render: (r: Reseller) => (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Building className="h-3 w-3 text-zinc-600" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{r.company_name || 'Individual'}</span>
                          </div>
                          {r.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-zinc-600" />
                              <span className="text-[10px] font-medium text-zinc-500 font-mono tracking-tighter">{r.phone}</span>
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      key: "commands",
                      header: "Actions",
                      render: (r: Reseller) => (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewReseller(r)}
                            className="h-8 w-8 hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openProductsDialog(r)}
                            className="h-8 w-8 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-all"
                            title="Manage"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openBalanceDialog(r)}
                            className="h-8 w-8 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 transition-all"
                            title="Add Credits"
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(r)}
                            className="h-8 w-8 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-500 transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id, r.username)}
                            className="h-8 w-8 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  data={filteredResellers}
                />
              </div>

              {/* Mobile View Alternative */}
              <div className="md:hidden space-y-4 pb-20">
                {filteredResellers.map((reseller) => (
                  <MobileResellerCard
                    key={reseller.id}
                    reseller={reseller}
                    onProducts={openProductsDialog}
                    onBalance={openBalanceDialog}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onPreview={setPreviewReseller}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
          <DialogContent className="border-white/10 sm:max-w-[400px] rounded-2xl bg-black/90 backdrop-blur-3xl p-0 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-inner">
                    <Wallet className="h-6 w-6 text-teal-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-normal text-white uppercase">Add Credits</DialogTitle>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{selectedReseller?.username || "Selected"} • Balance adjustment</p>
                  </div>
                </div>
                <p className="sr-only">Form to deposit or withdraw credits from reseller account</p>
              </DialogHeader>

              <div className="space-y-6">
                <div className="relative group p-6 sm:p-8 rounded-xl bg-gradient-to-br from-zinc-900/80 to-black border border-zinc-800/50 text-center overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Coins className="h-24 w-24 sm:h-32 sm:w-32 -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 text-white rotate-12" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase mb-2 sm:mb-3 relative z-10">
                    Current Credits
                  </p>
                  <div className="flex items-center justify-center gap-1 sm:gap-2 relative z-10 text-white">
                    <span className="text-xl sm:text-2xl font-bold opacity-30">$</span>
                    <span className="text-4xl sm:text-6xl font-black tracking-tighter">
                      {parseFloat(String(selectedReseller?.credits || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                  <button
                    onClick={() => setBalanceAction("add")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      balanceAction === "add"
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                        : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setBalanceAction("deduct")}
                    className={cn(
                      "flex items-center justify-center gap-2 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      balanceAction === "deduct"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                        : "text-zinc-500 hover:text-white"
                    )}
                  >
                    <MinusCircle className="h-4 w-4" />
                    Withdraw
                  </button>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Transaction Amount</Label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-600 transition-colors group-focus-within:text-emerald-500">$</div>
                    <Input
                      type="text"
                      placeholder="0"
                      value={balanceAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                          setBalanceAmount(val);
                        }
                      }}
                      className="h-20 pl-12 pr-6 text-4xl font-black border-zinc-800 bg-zinc-900/30 focus:bg-zinc-900/60 focus:ring-2 focus:ring-emerald-500/20 transition-all rounded-lg text-white tracking-tighter placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                {balanceAmount && !isNaN(parseFloat(balanceAmount)) && parseFloat(balanceAmount) > 0 && (
                  <div className="p-6 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Projected Balance</p>
                      <p className="text-2xl font-bold text-white">
                        ${(parseFloat(String(selectedReseller?.credits || 0)) + (balanceAction === "add" ? 1 : -1) * parseFloat(balanceAmount)).toFixed(2)}
                      </p>
                    </div>
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border", balanceAction === 'add' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500')}>
                      {balanceAction === 'add' ? <PlusCircle className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBalanceChange}
                  disabled={!balanceAmount || isNaN(parseFloat(balanceAmount)) || parseFloat(balanceAmount) <= 0}
                  className={cn(
                    "w-full h-16 font-black text-[11px] uppercase tracking-[0.4em] transition-all rounded-lg border-0 shadow-2xl relative overflow-hidden group",
                    balanceAction === 'add' ? 'bg-white hover:bg-emerald-500 text-black' : 'bg-zinc-900 hover:bg-red-500 text-white hover:text-white'
                  )}
                >
                  <div className={cn("absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100", balanceAction === 'add' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-red-500')} />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {balanceAction === "add" ? "PROCESS DEPOSIT" : "PROCESS WITHDRAWAL"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={productsDialogOpen} onOpenChange={setProductsDialogOpen}>
          <DialogContent className="border-white/10 sm:max-w-2xl max-h-[85vh] flex flex-col rounded-xl backdrop-blur-2xl bg-black/90 p-0 overflow-hidden shadow-2xl">
            <div className="p-8 flex flex-col h-full overflow-hidden">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                    <Package className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-white uppercase">Access Portfolio</DialogTitle>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{selectedReseller?.username || "Selected"} • Ecosystem permissions</p>
                  </div>
                </div>
                <p className="sr-only">Manage product and subscription assignments for this reseller</p>
              </DialogHeader>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6 relative">
                  <div
                    className="absolute inset-y-1 rounded-lg bg-zinc-800 shadow-sm transition-all duration-300 ease-out"
                    style={{
                      left: '4px',
                      width: 'calc(50% - 4px)',
                      transform: activeTab === "subscriptions" ? 'translateX(100%)' : 'translateX(0)'
                    }}
                  />
                  <button
                    onClick={() => setActiveTab("products")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors duration-200",
                      activeTab === "products" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Package className="h-3.5 w-3.5" />
                    Primary Products
                  </button>
                  <button
                    onClick={() => setActiveTab("subscriptions")}
                    className={cn(
                      "relative z-10 flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors duration-200",
                      activeTab === "subscriptions" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Active Plans
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {activeTab === "products" ? (
                    productsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Retrieving node data...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                        {applications.length === 0 ? (
                          <div className="col-span-full text-center py-20 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                            <Package className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No products in inventory</p>
                          </div>
                        ) : (
                          applications.map((app) => {
                            const appIdStr = String(app.id);
                            const isAssigned = resellerProducts.includes(appIdStr);
                            const isProcessing = !!processingProducts[appIdStr];
                            return (
                              <div
                                key={app.id}
                                className={cn(
                                  "group p-5 rounded-xl border transition-all relative overflow-hidden",
                                  isAssigned
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-black/40 border-white/5 hover:border-white/10"
                                )}
                              >
                                <div className="flex flex-col gap-4 relative z-10">
                                  <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center border transition-all",
                                    isAssigned ? "bg-emerald-500/10 border-emerald-500/20 shadow-inner" : "bg-zinc-950/50 border-zinc-800"
                                  )}>
                                    <Package className={cn("h-5 w-5", isAssigned ? "text-emerald-500" : "text-zinc-600")} />
                                  </div>
                                  {isAssigned && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black tracking-widest uppercase">Verified</Badge>}
                                </div>

                                <div>
                                  <h4 className="font-black text-sm text-white tracking-tight truncate">{app.name}</h4>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-1">
                                    {isAssigned ? "Has Access" : "Awaiting Setup"}
                                  </p>
                                </div>

                                <Button
                                  onClick={() => handleProductToggle(appIdStr, !isAssigned)}
                                  disabled={isProcessing}
                                  variant="ghost"
                                  className={cn(
                                    "w-full h-10 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border",
                                    isAssigned
                                      ? "bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20 hover:border-red-500"
                                      : "bg-zinc-900/50 hover:bg-emerald-500 text-zinc-300 hover:text-black border-zinc-800 hover:border-emerald-500"
                                  )}
                                >
                                  {isProcessing ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : isAssigned ? (
                                    <>Remove Access</>
                                  ) : (
                                    <>Assign Access</>
                                  )}
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )
                  ) : (
                    <div className="pb-4">
                      <ResellerSubscriptionsSection
                        reseller={selectedReseller}
                        resellerProducts={resellerProducts}
                        resellerSubscriptions={resellerSubscriptions}
                        setResellerSubscriptions={setResellerSubscriptions}
                        toast={toast}
                        applications={applications}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={deleteConfirm.open}
          title="Delete Reseller Account"
          description="This action is permanent and will remove all access immediately."
          message={`Are you sure you want to delete "${deleteConfirm.username}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, id: null, username: "" })}
        />
      </DashboardLayout>

      {previewReseller && (
        <AdminResellerPreview
          key={previewReseller.id}
          reseller={previewReseller}
          onClose={() => setPreviewReseller(null)}
        />
      )}
    </>
  );
}

// Tactical Header - Refined Preview Component
function AdminResellerPreview({ reseller, onClose }: { reseller: Reseller; onClose: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!reseller?.id) return;
    setLoading(true);
    try {
      const [a, s, t] = await Promise.all([
        getResellerApplications(reseller.id).catch(() => []),
        getResellerSubscriptions(reseller.id).catch(() => []),
        getResellerTransactions(reseller.id).catch(() => [])
      ]);
      setApps(Array.isArray(a) ? a : []);
      setSubscriptions(Array.isArray(s) ? s : []);
      setTransactions(Array.isArray(t) ? t : []);
    } catch (error) {
      console.error("Preview fail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reseller?.id) {
      fetchData();
    }
  }, [reseller?.id]);

  if (!reseller) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] h-[85vh] p-0 bg-black/95 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Reseller Overview: {reseller.username}</DialogTitle>
          <p className="sr-only">Detailed view of reseller metrics and logs</p>
        </DialogHeader>

        {/* Profile Header */}
        <div className="relative p-8 bg-zinc-900/30 border-b border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <UserCog className="h-48 w-48 -mr-16 -mt-16 text-white" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-0.5 shadow-2xl">
                <div className="h-full w-full rounded-xl bg-zinc-950 flex items-center justify-center">
                  <UserCog className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{reseller.username || "Unknown Reseller"}</h2>
                  <Badge className={cn(
                    "text-[10px] uppercase font-black px-2",
                    reseller.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {reseller.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  {reseller.email || "No Email"} <span className="h-1 w-1 rounded-full bg-zinc-800" /> ID: {reseller.id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Total Balance</p>
              <p className="text-3xl font-black text-white tracking-tighter">
                <span className="text-emerald-500 text-xl mr-1">$</span>
                {parseFloat(String(reseller.credits || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <RefreshCw className="h-12 w-12 animate-spin text-emerald-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white uppercase tracking-[0.3em] mb-2">Loading...</p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Retrieving reseller settings...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Assigned Apps", value: apps?.length || 0, icon: Package, color: "zinc" },
                  { label: "Active Plans", value: subscriptions?.length || 0, icon: Sparkles, color: "emerald" },
                  { label: "Licenses Created", value: reseller.total_licenses_created || 0, icon: Coins, color: "blue" }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-all shadow-xl backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <Icon className={cn("h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity", `text-${stat.color}-500`)} />
                      </div>
                      <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                      <div className="h-0.5 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
                        <div className={cn("h-full opacity-40", `bg-${stat.color}-500`)} style={{ width: '40%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Tabs defaultValue="apps" className="w-full">
                <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl mb-8 flex w-fit">
                  <TabsTrigger value="apps" className="data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest px-8 h-10 transition-all rounded-lg">Apps</TabsTrigger>
                  <TabsTrigger value="subs" className="data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest px-8 h-10 transition-all rounded-lg">Plans</TabsTrigger>
                  <TabsTrigger value="ledger" className="data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest px-8 h-10 transition-all rounded-lg">Ledger</TabsTrigger>
                </TabsList>

                <TabsContent value="apps" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {apps && apps.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {apps.map((app) => (
                        <div key={app?.id || Math.random()} className="p-5 bg-black/40 border border-white/5 rounded-xl flex items-center gap-4 hover:bg-black/60 transition-all group backdrop-blur-md">
                          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center p-2 group-hover:border-emerald-500/30 transition-all">
                            <Package className="h-full w-full text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-sm text-white uppercase tracking-tight truncate">{app?.name || "Unknown App"}</h4>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">ID: {app?.id || "—"}</p>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 opacity-50">
                        <Package className="h-8 w-8 text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">No Apps Assigned</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">This reseller has no assigned apps</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="subs" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {subscriptions && subscriptions.length > 0 ? (
                    <div className="grid gap-3">
                      {subscriptions.map((sub) => (
                        <div key={sub?.id || Math.random()} className="p-5 bg-black/40 border border-white/5 rounded-2xl hover:bg-black/60 transition-all flex items-center gap-6 group backdrop-blur-md">
                          <div className="h-14 w-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                            <Shield className="h-7 w-7 text-emerald-500/80 group-hover:scale-110 transition-all" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-black text-base text-white uppercase tracking-tight truncate">{sub?.name || "Untitled Plan"}</h4>
                              {sub?.name?.endsWith("(paused)") && (
                                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[8px] px-1.5 h-4 font-black">PAUSED</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Package className="h-3 w-3" /> {sub?.app_name || "System App"}
                              </span>
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-3 w-3" /> {formatIST(sub?.expires_at, { dateStyle: 'medium' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 opacity-50">
                        <Sparkles className="h-8 w-8 text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">No Active Plans</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Assign plans to activate the reseller system</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ledger" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {transactions && transactions.length > 0 ? (
                    <div className="bg-zinc-950/50 border border-white/5 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 bg-zinc-900/50">
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Operation</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Flow</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Notes</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {transactions.map((tx: any) => (
                            <tr key={tx?.id || Math.random()} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center border",
                                    tx?.type === "CREDIT" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                  )}>
                                    {tx?.type === "CREDIT" ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
                                  </div>
                                  <span className="text-xs font-bold text-white uppercase tracking-tight">{tx?.type || "ADJUST"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "text-sm font-black tracking-tighter",
                                  tx?.type === "CREDIT" ? "text-emerald-500" : "text-red-500"
                                )}>
                                  {tx?.type === "CREDIT" ? "+" : "-"}${(Number(tx?.amount) || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest line-clamp-1">{tx?.description || "System Adjustment"}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-medium text-zinc-600 font-mono">{formatIST(tx?.created_at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 opacity-50">
                        <TrendingUp className="h-8 w-8 text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">No Transactions Registered</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Financial ledger is currently empty</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

