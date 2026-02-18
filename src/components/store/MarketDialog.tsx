import React from 'react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useMarket } from '@/context/MarketContext';
import { Globe, X, Check, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MarketDialog = ({ open, onOpenChange }: MarketDialogProps) => {
    const { regions, selectedRegion, setSelectedRegion } = useMarket();

    const handleSelect = (region: any) => {
        setSelectedRegion(region);
        setTimeout(() => onOpenChange(false), 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-[#080808]/95 backdrop-blur-2xl border border-white/[0.08] max-w-2xl p-0 overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] gap-0 [&>button]:hidden"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                                    Region Select
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1">
                                    Global Currency Protocol
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-black/40 overflow-y-auto max-h-[60vh] custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {regions.map((region) => {
                                const isSelected = selectedRegion?.id === region.id;
                                return (
                                    <button
                                        key={region.id}
                                        onClick={() => handleSelect(region)}
                                        className={cn(
                                            "relative group overflow-hidden rounded-xl border transition-all duration-300 flex items-center h-[72px]",
                                            isSelected
                                                ? "bg-emerald-950/10 border-emerald-500/50"
                                                : "bg-[#0c0c0c] border-white/[0.04] hover:border-white/10 hover:bg-[#111]"
                                        )}
                                    >
                                        {/* Flag Section */}
                                        <div className="w-[72px] h-full relative border-r border-white/[0.04] overflow-hidden">
                                            {region.flag_code ? (
                                                <img
                                                    src={`https://flagcdn.com/w160/${region.flag_code.toLowerCase()}.png`}
                                                    alt=""
                                                    className={cn(
                                                        "w-full h-full object-cover transition-all duration-500",
                                                        isSelected ? "grayscale-0 opacity-100" : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80"
                                                    )}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-900" />
                                            )}
                                            <div className="absolute inset-0 bg-black/20" />
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 px-4 flex flex-col justify-center items-start text-left">
                                            <div className="flex items-center justify-between w-full">
                                                <span className={cn(
                                                    "text-lg font-black tracking-tight",
                                                    isSelected ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                                )}>
                                                    {region.currency_code}
                                                </span>
                                                {isSelected && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate max-w-[120px]">
                                                {region.name}
                                            </span>
                                        </div>

                                        {/* Active Corner Accent */}
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500/20">
                                                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#0c0c0c] rounded-tr-lg" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-[#080808] border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", selectedRegion ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                {selectedRegion?.currency_code || "Select"} Signal Active
                            </span>
                        </div>
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                            SECURE://V2
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
