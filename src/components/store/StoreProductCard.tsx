
import React from "react";
import { motion } from "framer-motion";
import {
    Zap,
    Play,
    Check,
    ChevronRight,
    Monitor,
    Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarket } from "@/context/MarketContext";
import emeriteLogo from "@/assets/emerite-logo.png";

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    details: string;
    image_url: string;
    yt_video_url?: string;
    category: string;
    platform: string;
    status?: string;
    is_active: boolean;
    region_prices?: {
        region_id: number;
        price: number;
    }[];
    plans?: {
        id: number;
        name: string;
        price: number;
        description?: string;
        is_best_value?: boolean;
        duration_days?: number;
    }[];
}

interface StoreProductCardProps {
    product: Product;
    onBuy: (e: React.MouseEvent, product: Product) => void;
    playingProduct: number | null;
    setPlayingProduct: (id: number | null) => void;
    addedId: number | null;
    index?: number;
}

export const StoreProductCard = ({
    product,
    onBuy,
    playingProduct,
    setPlayingProduct,
    addedId,
    index = 0
}: StoreProductCardProps) => {
    const { selectedRegion } = useMarket();

    const getDisplayPrice = (product: Product) => {
        if (product.region_prices && product.region_prices.length > 0 && selectedRegion) {
            const regionPrice = product.region_prices.find(rp => rp.region_id === selectedRegion.id);
            if (regionPrice) {
                return regionPrice.price;
            }
        }
        return product.price;
    };

    const getDisplayProductPrice = (product: Product) => {
        const symbol = selectedRegion?.currency_symbol || "₹";
        if (product.plans && product.plans.length > 0) {
            const prices = product.plans.map(p => p.price);
            const minPrice = Math.min(...prices);
            return `${symbol}${minPrice}`;
        }
        return `${symbol}${getDisplayPrice(product)}`;
    }

    const getPlatformIcon = (platform: string) => {
        const p = platform?.toLowerCase() || "";
        if (p.includes("windows")) return <Monitor className="w-3 h-3" />;
        if (p.includes("android")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.07 13.8533 7.5 12 7.5s-3.5902.57-5.1362 1.4501L4.8415 5.447a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
        );
        if (p.includes("ios") || p.includes("iphone")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.552 9.127 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.403-2.363-2-.078-3.675 1.04-4.61 1.04zm-.39-2.935c.844-1.026 1.416-2.455 1.26-3.87-1.221.052-2.701.818-3.571 1.844-.78.896-1.454 2.312-1.273 3.714 1.35.104 2.74-.688 3.584-1.688z" />
            </svg>
        );
        return <Globe className="w-3 h-3" />;
    };

    const isWorking = !product.status || product.status === 'Working' || product.status === 'Undetected';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => isWorking && onBuy(e, product)}
            className={cn(
                "group relative bg-white/[0.01] backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-500 flex flex-col cursor-pointer",
                !isWorking && "opacity-40 grayscale cursor-not-allowed"
            )}
        >
            {/* Top Gloss Edge */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 group-hover:via-emerald-500/60 to-transparent z-30" />

            {/* Image Container */}
            <div className="relative aspect-video overflow-hidden bg-zinc-950 flex-shrink-0">
                {playingProduct === product.id && product.yt_video_url ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${(() => {
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                            const match = product.yt_video_url.match(regExp);
                            return (match && match[2].length === 11) ? match[2] : null;
                        })()}?autoplay=1&modestbranding=1&rel=0`}
                        title={product.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                ) : (
                    <>
                        {/* Gradient Cover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent z-10 opacity-60" />

                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#070707]">
                                <Zap className="w-10 h-10 text-emerald-500/5" />
                            </div>
                        )}

                        {/* Top Overlays */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                            <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                {getPlatformIcon(product.platform)}
                            </div>

                            {product.status && (
                                <div className={cn(
                                    "px-2.5 py-1 rounded-full backdrop-blur-md border text-[8px] font-black uppercase tracking-widest flex items-center gap-2",
                                    isWorking ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                )}>
                                    <div className={cn("w-1 h-1 rounded-full", isWorking ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500")} />
                                    {isWorking ? 'Undetected' : product.status}
                                </div>
                            )}
                        </div>

                        {/* Play Action */}
                        {product.yt_video_url && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayingProduct(product.id);
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="p-4 flex flex-col flex-grow relative z-20">
                <div className="flex-grow space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">{product.category || 'Access'}</span>
                        <span className="w-1 h-1 rounded-full bg-emerald-500/20" />
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Global Link</span>
                    </div>
                    <h3 className="text-white font-black text-sm uppercase tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                            <img src={emeriteLogo} alt="Logo" className="w-3.5 h-3.5 object-contain opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">Emerite</span>
                    </div>

                    <div className="flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-lg bg-emerald-500/[0.03] hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/20 transition-all duration-300 shadow-sm">
                        <span className="text-xs font-black tracking-tighter tabular-nums">
                            {getDisplayProductPrice(product)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
