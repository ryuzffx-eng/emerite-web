import { StoreLayout } from "@/components/store/StoreLayout";
import { Checkout } from "@/components/store/Checkout";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, Zap, Shield, Check, QrCode, Coins, FileText, Lock, CreditCard, ChevronLeft, Info, Key, Copy, Bitcoin, Wallet, MessageSquare, Plus, Minus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
    const { items, removeFromCart, updateQuantity, clearCart } = useCart();
    const { selectedRegion } = useMarket();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCryptoDialogOpen, setIsCryptoDialogOpen] = useState(false);

    useEffect(() => {
        const { token } = getAuth();
        if (!token) {
            navigate("/login", { state: { returnUrl: "/cart" } });
        }
    }, [navigate]);



    if (!getAuth().token) return null;

    const displayTotal = items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    return (
        <StoreLayout hideFooter={true}>
            <div className="relative pt-32 pb-32 px-4 sm:px-8 min-h-screen overflow-hidden">


                <div className="max-w-7xl mx-auto relative z-10">
                    {/* New Tech Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <h1 className="text-3xl font-bold text-white tracking-tight">Your Cart</h1>
                    </motion.div>


                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 rounded-2xl bg-[#080808]/50 border border-white/[0.03] relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-zinc-900 shadow-xl rounded-xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-emerald-500/30 transition-all duration-500">
                                    <ShoppingCart className="w-8 h-8 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
                                <p className="text-sm text-zinc-500 font-medium mb-8 max-w-xs text-center leading-relaxed">Explore our marketplace to find the best assets for your needs.</p>
                                <Button
                                    onClick={() => navigate('/products')}
                                    className="h-12 px-8 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-sm rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                                >
                                    Browse Catalogue
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            {/* Inventory Manifest */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Active Assets ({items.length})</span>
                                    </div>
                                    <button
                                        onClick={clearCart}
                                        className="text-xs font-semibold text-zinc-500 hover:text-red-500 transition-all flex items-center gap-2 group"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Empty Cart
                                    </button>
                                </div>

                                {/* Manifest Structure */}
                                <div className="bg-[#080808]/40 border border-white/[0.04] rounded-2xl overflow-hidden backdrop-blur-sm">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/[0.05] invisible md:visible">
                                        <div className="col-span-5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Product</div>
                                        <div className="col-span-3 text-center text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Duration</div>
                                        <div className="col-span-2 text-center text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Quantity</div>
                                        <div className="col-span-2 text-right text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Price</div>
                                    </div>

                                    <div className="divide-y divide-white/[0.03]">
                                        {items.map((item, idx) => (
                                            <motion.div
                                                key={`${item.id}-${item.plan_id || 'base'}-${idx}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-8 py-8 group hover:bg-white/[0.01] transition-colors"
                                            >
                                                {/* Product Identity */}
                                                <div className="col-span-1 md:col-span-5 flex items-center gap-5">
                                                    <div className="relative shrink-0">
                                                        <div className="w-16 h-16 bg-zinc-900/50 rounded-lg border border-white/[0.05] overflow-hidden group-hover:border-emerald-500/30 transition-all duration-500 flex items-center justify-center p-2">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            {(item.image || (item as any).image_url) ? (
                                                                <img
                                                                    src={item.image || (item as any).image_url}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <Zap className="w-6 h-6 text-zinc-800" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeFromCart(item.id, item.plan_id)}
                                                            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 transition-colors w-fit group/rm"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Duration / Plan */}
                                                <div className="col-span-1 md:col-span-3 flex justify-center">
                                                    <div className="bg-zinc-900/50 border border-white/[0.05] px-3 py-1.5 rounded-md">
                                                        <span className="text-xs font-semibold text-zinc-400">
                                                            {item.plan_name || "Permanent"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Quantity Control */}
                                                <div className="col-span-1 md:col-span-2 flex justify-center">
                                                    <div className="flex items-center gap-1 bg-zinc-900/50 border border-white/[0.05] rounded-lg px-1.5 py-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.plan_id)}
                                                            className="text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all w-6 h-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-bold text-zinc-300 w-6 text-center tabular-nums">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.plan_id)}
                                                            className="text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-all w-6 h-6 flex items-center justify-center"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Valuation */}
                                                <div className="col-span-1 md:col-span-2 flex flex-col items-end gap-1">
                                                    <span className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Access Navigator */}
                                <div
                                    role="button"
                                    onClick={() => navigate('/products')}
                                    className="flex items-center gap-3 text-[10px] font-black text-zinc-600 hover:text-emerald-500 uppercase tracking-[0.3em] transition-all px-4 mt-2 group w-fit cursor-pointer select-none outline-none"
                                >
                                    <Info className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                    Access Armory
                                </div>
                            </div>

                            {/* Payment Terminal */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-4 space-y-4 sticky top-32"
                            >
                                {/* Master Summary Card */}
                                <div className="bg-[#080808]/60 border border-white/[0.06] rounded-xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
                                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/[0.06]">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/[0.05]">
                                            <FileText className="w-4 h-4 text-emerald-500/80" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center group/item">
                                            <span className="text-xs text-zinc-500 font-medium">Subtotal</span>
                                            <span className="text-base font-bold text-white tabular-nums">
                                                ₹{displayTotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="h-px bg-white/[0.05]" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white font-bold">Total</span>
                                            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
                                                ₹{displayTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setIsCheckoutOpen(true)}
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all duration-300 group/btn flex items-center justify-center gap-3"
                                    >
                                        <span>Proceed to Checkout</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>

                                    {/* Security Status */}
                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                                        <Lock className="w-3 h-3 text-emerald-500/50" />
                                        Encrypted Connection
                                    </div>
                                </div>

                                {/* Secure Logistics Card */}
                                <div className="bg-[#080808]/40 border border-white/[0.04] rounded-2xl p-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500/80 transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Secure Checkout</span>
                                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Encrypted Payments • Instant Delivery</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                            <CreditCard className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                            <Zap className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Modal */}
            <Checkout isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />


            {/* Crypto Payment Dialog */}
            <Dialog open={isCryptoDialogOpen} onOpenChange={setIsCryptoDialogOpen}>
                <DialogContent className="max-w-md bg-[#0a0a0a] border border-zinc-800 p-0 overflow-hidden gap-0 rounded-2xl">
                    <div className="p-6 pb-2">
                        <DialogHeader className="mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 mx-auto">
                                <Bitcoin className="w-6 h-6 text-orange-500" />
                            </div>
                            <DialogTitle className="text-xl font-black text-white uppercase tracking-tight text-center">
                                Crypto Payment
                            </DialogTitle>
                            <DialogDescription className="text-center text-zinc-500 text-xs font-medium uppercase tracking-wide">
                                Secure decentralized transaction protocol
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 text-center">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Total Payable Amount</span>
                                <span className="text-2xl font-black text-white block">
                                    {selectedRegion?.currency_symbol || '$'}{displayTotal.toFixed(2)} USD
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Wallet className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-zinc-300">Manual Processing Required</p>
                                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Please contact our support team to complete this transaction securely.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-2 bg-zinc-900/30 border-t border-zinc-800/50">
                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                onClick={() => window.open("https://discord.gg/bCBn7hFe4B", "_blank")}
                                className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold h-11 rounded-xl uppercase tracking-wider text-[10px] flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Open Support Ticket
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCryptoDialogOpen(false)}
                                className="w-full text-zinc-500 hover:text-white font-bold h-10 rounded-xl uppercase tracking-wider text-[10px]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </StoreLayout >
    );
};



export default Cart;
