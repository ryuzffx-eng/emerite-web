import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getHealth, getStoreProducts, getStoreUpdates } from "@/lib/api";
import { StoreLayout } from "@/components/store/StoreLayout";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HealthData {
    status: string;
    uptime?: number;
    version?: string;
    database?: string;
}

interface Product {
    id: number;
    name: string;
    status: string;
    platform: string;
    image_url?: string;
}

interface StatusUpdate {
    id: number;
    title: string;
    content: string;
    type: string;
    created_at: string;
    product_id?: number;
}

export default function StoreStatus() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [updates, setUpdates] = useState<StatusUpdate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [h, p, u] = await Promise.all([
                getHealth().catch(() => ({ status: "unknown" })),
                getStoreProducts().catch(() => []),
                getStoreUpdates().catch(() => [])
            ]);
            setHealth(h);
            setProducts(p);
            setUpdates(u);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const StatusPill = ({ status }: { status: string }) => {
        const isOk = status?.toLowerCase() === "ok" || status?.toLowerCase() === "healthy" || status?.toLowerCase() === "operational";
        return (
            <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                isOk ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"
            )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", isOk ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                {isOk ? "Operational" : "Degraded"}
            </div>
        );
    };

    return (
        <StoreLayout hideFooter={true}>
            <div className="pt-16 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Products Grid Status */}
                    <div className="mt-1">
                        <div className="flex items-center gap-6 py-12">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                            <div className="flex flex-col items-center text-center px-4">
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em]">
                                    Endpoint Registry
                                </h3>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-[250px] md:max-w-none">Protocol-level availability across all operational domains</p>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((p) => (
                                <div key={p.id} className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl hover:border-emerald-500/20 transition-all group overflow-hidden flex flex-col">
                                    <div className="h-40 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-900">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                        ) : (
                                            <div className="h-12 w-12 text-zinc-800 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-zinc-800">
                                                <Zap className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                            <Badge className={cn(
                                                "text-[8px] font-black tracking-widest uppercase border-0 rounded px-2 py-0.5",
                                                (p.status === 'Working' || p.status === 'Undetected') ? "bg-emerald-500/10 text-emerald-500" :
                                                    p.status === 'Updating' ? "bg-blue-500/10 text-blue-500" :
                                                        p.status === 'Maintenance' ? "bg-yellow-500/10 text-yellow-500" :
                                                            "bg-red-500/10 text-red-500"
                                            )}>
                                                {p.status === 'Working' ? 'Undetected' : (p.status || "Unknown")}
                                            </Badge>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">{p.platform}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h5 className="text-white font-black text-lg uppercase tracking-tight group-hover:text-emerald-500 transition-colors mb-1">{p.name}</h5>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-4">Availability Cluster: Operational</p>

                                        <div className="flex items-center gap-2 pt-4 border-t border-zinc-900">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                (p.status === 'Working' || p.status === 'Undetected') ? "bg-emerald-500 animate-pulse" :
                                                    p.status === 'Updating' ? "bg-blue-500 animate-pulse" :
                                                        p.status === 'Maintenance' ? "bg-yellow-500" :
                                                            "bg-red-500"
                                            )} />
                                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Linked Status Verified</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Log */}
                    <div className="mt-20">
                        <div className="flex items-center gap-6 py-12">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                            <div className="flex flex-col items-center text-center px-4">
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em]">
                                    Maintenance Log
                                </h3>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-[250px] md:max-w-none">Recorded protocol changes and synchronization history</p>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                        </div>

                        <div className="space-y-4">
                            {updates.length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-900 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Awaiting synchronization data...</p>
                                </div>
                            ) : (
                                updates.map((update) => (
                                    <div key={update.id} className="p-6 bg-[#0c0c0c] border border-zinc-900 rounded-2xl relative overflow-hidden group">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                                            <div className="flex-shrink-0">
                                                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">
                                                    {new Date(update.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs font-mono text-emerald-500/50">
                                                    {new Date(update.created_at).toLocaleTimeString([], { hour12: false })}
                                                </div>
                                            </div>

                                            <div className="h-4 w-[1px] bg-zinc-900 hidden md:block" />

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black tracking-widest uppercase border-0 rounded px-2 py-0.5",
                                                        update.type === 'alert' ? "bg-red-500/10 text-red-500" :
                                                            update.type === 'maintenance' ? "bg-yellow-500/10 text-yellow-500" :
                                                                update.type === 'feature' ? "bg-emerald-500/10 text-emerald-500" :
                                                                    "bg-zinc-800 text-zinc-400"
                                                    )}>
                                                        {update.type}
                                                    </Badge>
                                                    <h4 className="text-white font-black text-sm uppercase tracking-tight">{update.title}</h4>
                                                    {update.product_id && (
                                                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest ml-auto">
                                                            REF: {products.find(p => p.id === update.product_id)?.name || "ASSET-" + update.product_id}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-3xl">
                                                    {update.content}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 h-full w-1 bg-zinc-800 group-hover:bg-emerald-500 transition-all" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </StoreLayout>
    );
}
