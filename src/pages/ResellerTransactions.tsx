import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { resellerGetTransactions } from "@/lib/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  History,
  Activity,
  CreditCard,
  Wallet,
  RefreshCw,
  Search,
  Filter,
  ArrowRightLeft,
  ChevronRight,
  Shield,
  Clock,
  Zap,
  Tag,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  amount: number | string;
  balance_after: number | string;
  transaction_type: string;
  description?: string;
  created_at: string;
}

export default function ResellerTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Artificial delay for UX feedback (parallel with fetch)
      const [data] = await Promise.all([
        resellerGetTransactions(),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
      setTransactions(data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    await fetchData();
    toast({
      title: "Refreshed",
      description: "Transactions updated",
    });
  };

  const filteredTransactions = transactions.filter(t =>
    t.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "type",
      header: "Type",
      render: (t: Transaction) => (
        <div className="flex items-center gap-4 py-1">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border transition-all shadow-inner",
            t.transaction_type === "debit" || t.transaction_type === "admin_deduct" || t.transaction_type === "usage"
              ? "bg-red-500/5 border-red-500/20 text-red-500"
              : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
          )}>
            {t.transaction_type === "debit" || t.transaction_type === "admin_deduct" || t.transaction_type === "usage" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </div>
          <div className="flex flex-col text-left gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
              {t.transaction_type.replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              {t.description || "System Operation"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (t: Transaction) => (
        <div className="text-left">
          <span className={cn(
            "text-[13px] font-black font-mono px-2 py-1 rounded border",
            t.transaction_type === "debit" || t.transaction_type === "admin_deduct" || t.transaction_type === "usage"
              ? "bg-red-500/5 text-red-500 border-red-500/10"
              : "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
          )}>
            {t.transaction_type === "debit" || t.transaction_type === "admin_deduct" || t.transaction_type === "usage" ? "−" : "+"}${Math.abs(Number(t.amount)).toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      render: (t: Transaction) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5 text-zinc-600" />
          </div>
          <span className="text-xs font-black text-zinc-300 font-mono">${Number(t.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (t: Transaction) => (
        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-[11px] font-black font-mono text-zinc-400 uppercase tracking-wider">{new Date(t.created_at).toLocaleDateString()}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-600">ID:{t.id}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Transaction History">
        <div className="space-y-8 p-4 sm:p-8">
          <div className="h-32 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />)}
          </div>
          <div className="h-[500px] rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Transaction History"
      subtitle="View your credit history and transactions"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">

        {/* ==================== SUMMARY HEADER & CONTROLS ==================== */}
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 transition-transform hover:rotate-12">
                <ArrowRightLeft className="h-7 w-7 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Transaction Log</p>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                {transactions.length} Total Transactions
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
            </div>
          </div>


        </div>


      </div>

      {/* ==================== KPI MINI-GRID ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Moved", val: `$${transactions.reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0).toFixed(2)}`, icon: Wallet, color: "text-blue-500" },
          { label: "Success Rate", val: "100%", icon: Shield, color: "text-emerald-500" },
          { label: "Last Operation", val: transactions[0] ? new Date(transactions[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---", icon: Clock, color: "text-purple-500" },
          { label: "Status", val: "Live", icon: Zap, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111111]/60 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all">
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-white tracking-tight">{stat.val}</p>
            </div>
            <div className={cn("h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-zinc-900/50 border-zinc-800 h-10 md:h-12 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl transition-all"
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

        <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={isRefreshing ? undefined : handleRefresh}
            className="h-9 md:h-10 w-9 md:w-10 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
          >
            <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin text-emerald-500")} />
          </Button>
        </div>
      </div>

      {/* ==================== DATA TERMINAL ==================== */}
      {/* ==================== DATA TERMINAL ==================== */}
      <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-[#111111]/80 backdrop-blur-md shadow-2xl">
        <DataTable
          columns={columns}
          data={filteredTransactions}
          keyExtractor={t => String(t.id)}
          emptyMessage="No transaction history found."
          isLoading={isRefreshing}
        />
      </div>
    </DashboardLayout>
  );
}
