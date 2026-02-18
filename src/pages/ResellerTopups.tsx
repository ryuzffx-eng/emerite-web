import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPendingTopups, approveTopup, rejectTopup } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Check, X, Wallet, Clock, UserCog, AlertCircle } from "lucide-react";
import { cn, formatIST } from "@/lib/utils";

interface TopupRequest {
    id: number;
    reseller_id: number;
    reseller_username?: string;
    amount: number;
    transaction_type: string;
    description: string;
    created_at: string;
}

export default function ResellerTopups() {
    const [requests, setRequests] = useState<TopupRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getPendingTopups();
            setRequests(data || []);
        } catch (error: any) {
            toast({
                title: "Connection Error",
                description: typeof error?.message === 'string' ? error.message : "Could not load top-up requests",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: number, action: "approve" | "reject") => {
        setProcessingId(id);
        try {
            if (action === "approve") {
                await approveTopup(id);
                toast({ title: "Approved", description: "Credits added successfully" });
            } else {
                await rejectTopup(id);
                toast({ title: "Rejected", description: "Request has been cancelled" });
            }
            fetchRequests();
        } catch (error: any) {
            toast({
                title: "Action Failed",
                description: typeof error?.message === 'string' ? error.message : "Could not process request",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <DashboardLayout
            title="Queue"
            subtitle="Review top-up requests"
        >
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Pending Requests</p>
                            <Clock className="h-4 w-4 text-emerald-500 opacity-40" />
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter">{requests.length}</p>
                        <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-1/3 opacity-50" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Total Amount</p>
                            <Wallet className="h-4 w-4 text-emerald-500 opacity-40" />
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter">
                            <span className="text-emerald-500 text-xl mr-1">$</span>
                            {requests.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
                        </p>
                        <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-2/3 opacity-50" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all pointer-events-none">
                            <AlertCircle className="h-24 w-24 -mr-8 -mt-8" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Server Status</p>
                            <RefreshCw className={cn("h-4 w-4 text-emerald-500", loading && "animate-spin")} />
                        </div>
                        <p className="text-xl font-black text-white uppercase tracking-tight">Online</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRequests}
                            className="mt-4 h-8 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                        >
                            Refresh List
                        </Button>
                    </div>
                </div>

                <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-[#0c0c0c]/80 backdrop-blur-xl shadow-2xl">
                    <DataTable
                        keyExtractor={(r) => String(r.id)}
                        columns={[
                            {
                                key: "reseller",
                                header: "Reseller",
                                render: (r) => (
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                            <UserCog className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">Partner #{r.reseller_id}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Manual Top-up</p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "amount",
                                header: "Amount",
                                render: (r) => (
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <span className="text-xs font-black text-emerald-500">${parseFloat(String(r.amount)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "description",
                                header: "Notes",
                                render: (r) => (
                                    <div className="max-w-[250px]">
                                        <p className="text-[10px] font-medium text-zinc-400 leading-relaxed italic line-clamp-2">
                                            {r.description || "No notes provided"}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                key: "created_at",
                                header: "Date",
                                render: (r) => (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter">{formatIST(r.created_at, { dateStyle: 'medium' })}</p>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{formatIST(r.created_at, { timeStyle: 'short' })}</p>
                                    </div>
                                ),
                            },
                            {
                                key: "actions",
                                header: "Actions",
                                render: (r) => (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(r.id, "approve")}
                                            disabled={processingId === r.id}
                                            className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest border-0 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                        >
                                            {processingId === r.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-2" />}
                                            Approve
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(r.id, "reject")}
                                            disabled={processingId === r.id}
                                            className="h-9 px-4 rounded-xl bg-zinc-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 font-black text-[9px] uppercase tracking-widest border border-zinc-800 hover:border-red-500/30 transition-all active:scale-95"
                                        >
                                            <X className="h-3.5 w-3.5 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        data={requests}
                        emptyMessage="No pending top-up requests found"
                        isLoading={loading}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
