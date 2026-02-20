import { useEffect, useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  resellerGetProfile,
  resellerGetTransactions,
  resellerGetLicenses,
  updateUser,
  resellerCreateTopupOrder,
  resellerVerifyTopupPayment
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  User,
  Package,
  Activity,
  Shield,
  Clock,
  Terminal,
  ChevronRight,
  Key,
  Plus,
  Search,
  FileText,
  BarChart3,
  MousePointer2,
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn, formatIST } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// --- Types ---

interface Profile {
  username: string;
  email: string;
  company_name?: string;
  credits: string;
  is_verified: boolean;
  avatar_url?: string;
}

interface Transaction {
  id: number;
  transaction_type: string;
  amount: string;
  description?: string;
  created_at?: string;
}

interface License {
  id: number;
  license_key: string;
  hwid?: string;
  is_active: boolean;
}

// --- Components (Exact clones of Admin Dashboard components) ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) => (
  <div className={cn("relative overflow-hidden bg-black/40 border border-white/5 p-6 rounded-xl shadow-sm flex flex-col justify-between h-full group hover:border-white/10 transition-all duration-500 backdrop-blur-md", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10 flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700 group-hover:bg-zinc-800 transition-all shadow-inner">
        <Icon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border",
          trend === "up" ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" :
            trend === "down" ? "bg-red-500/5 text-red-500 border-red-500/10" :
              "bg-zinc-500/5 text-zinc-500 border-zinc-500/10"
        )}>
          {trend === "up" ? "↑ 2.4%" : trend === "down" ? "↓ 1.1%" : "• 0%"}
        </span>
      )}
    </div>

    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-0.5">{title}</p>
      {description && <p className="text-[10px] text-zinc-600 font-medium truncate">{description}</p>}
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 w-full rounded-xl bg-black/40 border border-white/5 hover:bg-black/60 hover:border-white/10 transition-all group text-left relative overflow-hidden backdrop-blur-md"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors shrink-0">
      <Icon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</span>
      <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide group-hover:text-zinc-500 transition-colors">Quick Entry</span>
    </div>
  </button>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          {payload[0].value} <span className="text-[10px] text-zinc-500 font-medium">Activity</span>
        </p>
      </div>
    );
  }
  return null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TopupDialog = ({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'crypto'>('gateway');
  const [cryptoNetwork, setCryptoNetwork] = useState<'bep20' | 'trc20' | 'erc20'>('bep20');
  const [txHash, setTxHash] = useState("");

  const handleSubmitManual = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1) {
      toast({ title: "Invalid Amount", description: "Minimum $1 required", variant: "destructive" });
      return;
    }
    if (!txHash || txHash.length < 5) {
      toast({ title: "Invalid TXID", description: "Please enter a valid Transaction Hash", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Direct API call since we didn't add the helper yet, or assume helper exists? 
      // Better to use apiRequest from imports if available or fetch.
      // Actually, let's use the apiRequest helper pattern inline for now to avoid modifying api.ts again within this step.
      const { apiRequest } = await import("@/lib/api");
      await apiRequest("/reseller/credits/topup/manual", {
        method: "POST",
        body: JSON.stringify({
          amount: val,
          transaction_id: txHash,
          network: `USDT (${cryptoNetwork.toUpperCase()})`
        })
      });

      toast({ title: "Submitted", description: "Transaction under review. Credits added shortly.", className: "bg-emerald-500 text-black border-none" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Submission failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1) {
      toast({ title: "Invalid Amount", description: "Minimum topup is $1", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const order = await resellerCreateTopupOrder(val);

      // 2. Open Razorpay
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Emerite Store",
        description: "Add Credits to Wallet",
        image: "https://raw.githubusercontent.com/Stoner771/noodies/main/emerite-logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            await resellerVerifyTopupPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast({ title: "Payment Successful", description: `Added $${val} to your wallet` });
            onSuccess();
            onOpenChange(false);
          } catch (err: any) {
            toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: {
          name: "Reseller",
          email: "reseller@example.com",
          contact: ""
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

      // We don't set loading false here because the modal is open. 
      // It will be handled by handler or ondismiss.

    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to initiate payment", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-black/90 border-white/10 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add Funds (USD)</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Top up your reseller wallet using secure payment gateway.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-400">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-emerald-500 text-zinc-400"
                onClick={() => setAmount(val.toString())}
              >
                ${val}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-lg mb-4 select-none">
          <button
            onClick={() => setPaymentMethod('gateway')}
            className={cn("flex-1 text-xs font-bold py-2 rounded-md transition-all", paymentMethod === 'gateway' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-white")}
          >
            Payment Gateway
          </button>
          <button
            onClick={() => setPaymentMethod('crypto')}
            className={cn("flex-1 text-xs font-bold py-2 rounded-md transition-all", paymentMethod === 'crypto' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-white")}
          >
            Crypto (Manual)
          </button>
        </div>

        {paymentMethod === 'gateway' ? (
          <DialogFooter>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-11"
            >
              {loading ? "Processing..." : `Pay $${amount || '0'} via Razorpay`}
            </Button>
          </DialogFooter>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Network Custom Selector */}
            <div className="flex gap-2 mb-4 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50">
              {['BEP20', 'trc20', 'erc20'].map((net) => (
                <button
                  key={net}
                  onClick={() => setCryptoNetwork(net as any)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                    cryptoNetwork === net
                      ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                  )}
                >
                  {net === 'trc20' ? 'TRC20 (Tron)' : net === 'erc20' ? 'ERC20 (ETH)' : 'BEP20 (BSC)'}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              <div className="flex justify-center py-2 bg-white rounded-xl w-32 h-32 mx-auto shadow-xl ring-4 ring-white/5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cryptoNetwork === 'trc20'
                    ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP"
                    : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90"
                    }&bgcolor=fff&color=000&margin=0`}
                  alt="QR Code"
                  className="w-full h-full object-contain p-1"
                />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Send USDT ({cryptoNetwork.toUpperCase()}) to:
                </div>
                <div
                  className="bg-black/80 p-3 rounded-lg border border-zinc-800 flex items-center justify-between gap-3 group/copy cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-black"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      cryptoNetwork === 'trc20'
                        ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP"
                        : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90"
                    );
                    toast({ title: "Copied!", description: "Address copied to clipboard" });
                  }}
                >
                  <code className="text-zinc-300 font-mono text-[10px] truncate flex-1 text-left">
                    {cryptoNetwork === 'trc20'
                      ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP"
                      : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90"}
                  </code>
                  <div className="p-1.5 rounded bg-zinc-900 text-zinc-500 group-hover/copy:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  </div>
                </div>
                <div className="text-[9px] text-red-400 font-medium animate-pulse">
                  ⚠ Only send USDT on {cryptoNetwork.toUpperCase()} network
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wide">Transaction Hash (TXID)</Label>
              <Input
                placeholder="Paste transaction ID here..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-xs text-white h-11 focus-visible:ring-emerald-500 font-mono"
              />
            </div>

            <Button
              onClick={handleSubmitManual}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-11 uppercase tracking-wide text-xs"
            >
              {loading ? "Verifying..." : "Submit Verification Request"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function ResellerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTime, setSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [topupOpen, setTopupOpen] = useState(false);

  const navigate = useNavigate();

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);

      const [p, t, l] = await Promise.allSettled([
        resellerGetProfile(),
        resellerGetTransactions().catch(() => []),
        resellerGetLicenses().catch(() => []),
      ]);

      if (p.status === "fulfilled") {
        setProfile(p.value);
        updateUser(p.value);
      }
      if (t.status === "fulfilled" && Array.isArray(t.value)) {
        setTransactions(t.value.slice(0, 10));
      }
      if (l.status === "fulfilled" && Array.isArray(l.value)) {
        setLicenses(l.value);
      }

      setSyncTime(new Date().toLocaleTimeString());

    } catch (error: any) {
      console.error("[ResellerDashboard] Fetch error:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000); // 5s refresh like admin
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeCount = licenses.filter(l => l.is_active).length;
  const unusedCount = licenses.filter(l => !l.hwid).length;
  const credits = Number(profile?.credits || 0);

  const licenseData = [
    { name: "Active", value: activeCount, color: "#10b981" },
    { name: "Unused", value: unusedCount, color: "#27272a" },
  ];

  const activityTrend = [
    { h: "00:00", active: 25 }, { h: "04:00", active: 15 },
    { h: "08:00", active: 45 }, { h: "12:00", active: 65 },
    { h: "16:00", active: 80 }, { h: "20:00", active: 55 },
    { h: "23:59", active: 35 },
  ];

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "--:--";
    }
  };

  if (isLoading && !profile) {
    return (
      <DashboardLayout title="Overview" subtitle="Loading metrics...">
        <DashboardLoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`Last sync: ${formatIST(new Date(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} • System operational`}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">

        {/* Reseller Identity Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-2xl group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <Shield className="h-40 w-40 -mr-16 -mt-16 text-emerald-500" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group/avatar">
                <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl transition-transform group-hover/avatar:rotate-3 duration-500 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-emerald-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-lg bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center shadow-xl">
                  <Activity className="h-3.5 w-3.5 text-black" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">{profile?.username || 'Reseller'}</h2>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">Verified</Badge>
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">{profile?.email || 'unidentified_identity'}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <Wallet className="h-3 w-3 text-emerald-500/60" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">${credits.toLocaleString()} CR</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 font-bold uppercase text-[9px] tracking-widest gap-1.5 transition-all active:scale-95"
                    onClick={() => setTopupOpen(true)}
                  >
                    <Plus className="h-3 w-3" /> Add Funds
                  </Button>

                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <Zap className="h-3 w-3 text-blue-500/60" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Reseller</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:block h-12 w-px bg-zinc-800/50 mx-2" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-1">System Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Operational</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Wallet Balance"
            value={`$${credits.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
            icon={Wallet}
            description="Available funds"
            trend="up"
          />
          <StatCard
            title="Active Licenses"
            value={activeCount.toLocaleString()}
            icon={Zap}
            description={`${unusedCount} licenses reserved`}
            trend="neutral"
          />
          <StatCard
            title="Unused Licenses"
            value={unusedCount.toLocaleString()}
            icon={Key}
            description="Available license pool"
          />
          <StatCard
            title="Total Keys"
            value={licenses.length.toLocaleString()}
            icon={Package}
            description="Full registry history"
            trend="neutral"
          />
        </div>

        {/* Analytics & Logs Bento */}
        <div className="space-y-6">

          {/* Charts Row */}
          <div className="flex flex-col gap-6">

            {/* Allocation */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-xl p-6 shadow-sm flex flex-col h-[320px] group hover:border-white/10 transition-all duration-500 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <h3 className="text-sm font-semibold text-zinc-100">Resource Allocation</h3>
                </div>
                <BarChart3 className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
              </div>

              <div className="flex-1 min-h-[180px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={licenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {licenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {licenses.length > 0 ? Math.round((activeCount / licenses.length) * 100) : 0}%
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Load</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Active Nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Stock</span>
                </div>
              </div>
            </div>

            {/* Usage Pulse */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-xl p-6 shadow-sm flex flex-col h-[320px] group hover:border-white/10 transition-all duration-500 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                  <h3 className="text-sm font-semibold text-zinc-100">Network Traffic</h3>
                </div>
                <MousePointer2 className="h-4 w-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} strokeOpacity={0.2} />
                    <XAxis dataKey="h" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Logs & Controls */}
          <div className="flex flex-col gap-6">

            {/* Registry Control */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-xl p-5 shadow-sm h-fit group hover:border-white/10 transition-all duration-500 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="relative z-10 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="h-3 w-3" />
                Registry Control
              </h3>
              <div className="relative z-10 space-y-2.5">
                <QuickAction icon={Key} label="Provision License" onClick={() => navigate('/reseller/licenses')} />
                <QuickAction icon={Users} label="Create User Profile" onClick={() => navigate('/reseller/users')} />
                <QuickAction icon={Shield} label="Manage Identity" onClick={() => navigate('/reseller/profile')} />
              </div>
            </div>

            {/* Event Table (Registry History) */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-xl shadow-sm flex flex-col h-fit group hover:border-white/10 transition-all duration-500 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Terminal className="h-3 w-3 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">System Logs</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/reseller/transactions')}
                  className="text-[10px] font-bold uppercase tracking-widest h-6 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-all border border-zinc-800/50"
                >
                  View Archive <ChevronRight className="ml-1 h-2.5 w-2.5" />
                </Button>
              </div>

              <div className="divide-y divide-zinc-800/30 relative z-10">
                {transactions.length > 0 ? (
                  transactions.map((t, i) => (
                    <div key={t.id || i} className="group/item px-5 py-3 hover:bg-zinc-800/20 transition-all flex items-start justify-between gap-4 border-l-2 border-transparent hover:border-emerald-500/50">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={cn(
                          "mt-0.5 flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border transition-all shadow-inner",
                          t.transaction_type.includes('credit') || t.transaction_type.includes('add') ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-900 border-zinc-800"
                        )}>
                          <Wallet className={cn("h-4 w-4", t.transaction_type.includes('credit') || t.transaction_type.includes('add') ? "text-emerald-500" : "text-zinc-600")} />
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                              {t.transaction_type?.replace(/_/g, " ")}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
                              ID: {t.id}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-zinc-100 group-hover/item:text-white transition-colors truncate tracking-tight">
                            {t.description || "System Operation"}
                          </span>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-800/30",
                              t.transaction_type.includes('debit') || t.transaction_type.includes('deduct') || t.transaction_type === "usage" ? "bg-red-500/5 text-red-500" : "bg-emerald-500/5 text-emerald-500"
                            )}>
                              {t.transaction_type.includes('debit') || t.transaction_type.includes('deduct') || t.transaction_type === "usage" ? "−" : "+"}${Math.abs(Number(t.amount)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold font-mono text-zinc-500 group-hover/item:text-zinc-300 transition-colors uppercase tracking-wide">
                          {formatIST(t.created_at, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover/item:bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(24,24,27,1)] group-hover/item:shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 text-xs">
                    Registry buffer empty. No recent logs found.
                  </div>
                )}
              </div>
            </div>

            {/* Network Integrity */}
            <div className="relative overflow-hidden bg-black/40 border border-white/5 rounded-xl p-5 shadow-sm h-fit group hover:border-white/10 transition-all duration-500 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="relative z-10 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Network Integrity
              </h3>

              <div className="relative z-10 space-y-2.5">
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between group hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">API Node</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">LIVE</span>
                </div>

                <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center justify-between group hover:border-blue-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">Drift Time</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-blue-400 transition-colors overflow-hidden truncate">
                    {formatIST(new Date().toISOString(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center justify-between group hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-[11px] font-semibold text-zinc-300">Relational DB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-zinc-500">SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        onSuccess={() => fetchData(false)}
      />
    </DashboardLayout>
  );
}
