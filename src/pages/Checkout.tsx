import React, { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { getAuth } from "@/lib/api";
import { useNavigate }
    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, ShieldCheck, Lock, CreditCard, Wallet,
    Bitcoin, User, CheckCircle2, ChevronRight, ChevronLeft,
    Terminal, Cpu, AlertCircle, Loader2, Copy, Key, Zap, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const Checkout = () => {
    const { items, totalPrice, clearCart } = useCart();
    const { selectedRegion } = useMarket();
    const navigate = useNavigate();
    const { toast } = useToast();
    const auth = getAuth();

    // State
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'crypto'>('razorpay');
    const [selectedCrypto, setSelectedCrypto] = useState<'usdt_trc20' | 'usdt_bep20' | 'ltc' | 'btc'>('usdt_trc20');


    const [isAgreed, setIsAgreed] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Verification State
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [verificationMessage, setVerificationMessage] = useState("Initializing Secure Handshake...");
    const [purchasedKeys, setPurchasedKeys] = useState<{ product_name: string; key: string }[]>([]);

    // Crypto Dialog State
    const [isCryptoDialogOpen, setIsCryptoDialogOpen] = useState(false);

    useEffect(() => {
        if (!auth.token) {
            navigate("/login", { state: { returnUrl: "/checkout" } });
        } else if (items.length === 0) {
            navigate("/cart");
        }
    }, [auth.token, items.length, navigate]);

    // Set default payment method based on region
    useEffect(() => {
        if (selectedRegion?.currency_code === 'INR') {
            setPaymentMethod('razorpay');
        } else {
            setPaymentMethod('crypto');
        }
    }, [selectedRegion]);

    // Currency Conversion
    const displayTotal = items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const cryptoAccounts = {
        usdt_trc20: {
            name: "USDT (TRC20)",
            address: "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP",
            network: "TRON (TRC20)",
            color: "text-emerald-500",
            qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP`
        },
        usdt_bep20: {
            name: "USDT (BEP20)",
            address: "0x680e71e7733a8333f1a8dca2532a4d3f87724e90",
            network: "Binance Smart Chain",
            color: "text-yellow-500",
            qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x680e71e7733a8333f1a8dca2532a4d3f87724e90`
        },
        ltc: {
            name: "Litecoin (LTC)",
            address: "Contact support for address",
            network: "Litecoin Network",
            color: "text-blue-400",
            qr: ""
        },
        btc: {
            name: "Bitcoin (BTC)",
            address: "Contact support for address",
            network: "Bitcoin Network",
            color: "text-orange-500",
            qr: ""
        }
    };

    const handlePayment = async () => {
        if (!isAgreed) {
            toast({
                title: "Terms Required",
                description: "Please agree to the Terms of Service to proceed.",
                variant: "destructive"
            });
            return;
        }

        if (paymentMethod === 'crypto') {
            setIsCryptoDialogOpen(true);
            return;
        }

        setIsProcessing(true);

        try {
            // Load Razorpay Script
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) {
                throw new Error("Payment Gateway Protocol Failed to Load");
            }

            const orderData = await import("@/lib/api").then(api => api.initiateRazorpayOrder({
                amount: displayTotal,
                items: items.flatMap(item => Array(item.quantity).fill({
                    product_id: item.id,
                    plan_id: item.plan_id,
                    price: item.price
                }))
            }));

            const options = {
                key: (orderData as any).key_id || "rzp_live_SGSDs7w1ie6YS8",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Emerite Store",
                description: `Authorized Transaction: ${items.length} Items`,
                image: "/favicon.ico",
                order_id: orderData.id,
                handler: async (response: any) => {
                    setIsProcessing(false);
                    setIsVerifying(true);
                    setVerificationStatus('processing');
                    setVerificationMessage("Verifying Transaction Signature...");

                    try {
                        const verification = await import("@/lib/api").then(api => api.verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }));

                        if (verification.status === "success") {
                            setVerificationStatus('success');
                            setVerificationMessage("Transaction Authorized. Access Granted.");

                            if (verification.keys_data) {
                                setPurchasedKeys(verification.keys_data);
                            } else if (verification.keys) {
                                setPurchasedKeys(verification.keys.map((k: string) => ({ product_name: "License Key", key: k })));
                            }

                            toast({
                                title: "Transaction Successful",
                                description: "Your assets are now available.",
                                variant: "default"
                            });
                        } else {
                            throw new Error(verification.message || "Verification Failed");
                        }
                    } catch (err: any) {
                        setVerificationStatus('error');
                        setVerificationMessage(err.message || "Cryptographic Handshake Failed");
                    }
                },
                prefill: {
                    name: auth.user?.username || "",
                    email: auth.user?.email || "",
                },
                theme: {
                    color: "#10b981",
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast({
                title: "Transaction Error",
                description: error.message || "Could not initiate payment sequence.",
                variant: "destructive"
            });
            setIsProcessing(false);
        }
    };

    if (!auth.user) return null;

    return (
        <StoreLayout hideFooter={true}>
            <div className="min-h-screen pt-20 pb-20 px-4 flex items-center justify-center relative overflow-hidden">


                <div className="w-full max-w-7xl relative z-10">
                    {/* Breadcrumb Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-12"
                    >
                        <button
                            onClick={() => navigate('/cart')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wide transition-all duration-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Cart
                        </button>
                        <div className="h-5 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                            <Zap className="w-3.5 h-3.5" />
                            Secure Checkout
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN - Billing & Payment (2 cols) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            {/* Header */}
                            <div className="space-y-3">
                                <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white">
                                    Complete <span className="text-emerald-500">Your Order</span>
                                </h1>
                                <p className="text-sm text-zinc-400 font-medium">Review your items and choose a secure payment method</p>
                            </div>

                            {/* Billing Identity Card */}
                            <motion.div
                                whileHover={{ borderColor: 'rgb(16, 185, 129)' }}
                                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                                            {auth.user.avatar || auth.user.avatar_url ? (
                                                <img src={auth.user.avatar || auth.user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Account Holder</p>
                                            <h3 className="text-lg font-bold text-white mb-0.5">{auth.user.username}</h3>
                                            <p className="text-xs text-zinc-500 font-medium">{auth.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="w-4 h-4" />
                                        Verified
                                    </div>
                                </div>
                            </motion.div>

                            {/* Divider */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Payment Methods Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Payment Method</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedRegion?.currency_code === 'INR' ? (
                                        /* Razorpay Option */
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setPaymentMethod('razorpay')}
                                            className={cn(
                                                "cursor-pointer rounded-xl p-5 border transition-all duration-300 relative group overflow-hidden sm:col-span-2",
                                                paymentMethod === 'razorpay'
                                                    ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                                                    : "bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/20"
                                            )}
                                        >
                                            {paymentMethod === 'razorpay' && (
                                                <div className="absolute top-4 right-4 text-emerald-500 animate-pulse">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                                                    paymentMethod === 'razorpay'
                                                        ? "bg-emerald-500/20 border border-emerald-500/30"
                                                        : "bg-blue-500/10 border border-blue-500/20"
                                                )}>
                                                    <CreditCard className={cn(
                                                        "w-6 h-6",
                                                        paymentMethod === 'razorpay' ? "text-emerald-400" : "text-blue-400"
                                                    )} />
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">Razorpay / UPI</h4>
                                                    <p className="text-zinc-500 text-xs font-medium mt-0.5">Cards, UPI, Bank Transfer - Instant Activation</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* Crypto Option */
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setPaymentMethod('crypto')}
                                            className={cn(
                                                "cursor-pointer rounded-xl p-5 border transition-all duration-300 relative group overflow-hidden sm:col-span-2",
                                                paymentMethod === 'crypto'
                                                    ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                                                    : "bg-black/40 border-white/5 hover:bg-black/60 hover:border-white/20"
                                            )}
                                        >
                                            {paymentMethod === 'crypto' && (
                                                <div className="absolute top-4 right-4 text-yellow-500 animate-pulse">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                                                    paymentMethod === 'crypto'
                                                        ? "bg-yellow-500/20 border border-yellow-500/30"
                                                        : "bg-yellow-500/10 border border-yellow-500/20"
                                                )}>
                                                    <Bitcoin className={cn(
                                                        "w-6 h-6",
                                                        paymentMethod === 'crypto' ? "text-yellow-400" : "text-yellow-400"
                                                    )} />
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">Cryptocurrency</h4>
                                                    <p className="text-zinc-500 text-xs font-medium mt-0.5">USDT, BTC, LTC - Manual processing via support</p>
                                                </div>

                                                <div className="px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                    Global
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Security Notification */}
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                                        Your payment information is encrypted and processed through industry-standard secure gateways. Emerite does not store sensitive payment credentials.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN - Order Summary (1 col) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-7 sticky top-24 shadow-xl overflow-hidden">
                                {/* Decorative accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                                {/* Header */}
                                <div className="flex items-center gap-2.5 mb-6 relative z-10">
                                    <Terminal className="w-4 h-4 text-emerald-500" />
                                    <h2 className="text-xs font-black text-white uppercase tracking-widest">Order Summary</h2>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex justify-between items-start p-3 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors duration-200 group"
                                        >
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide mt-1.5">
                                                    {item.plan_name || "Permanent"} • ×{item.quantity}
                                                </span>
                                            </div>
                                            <span className="text-white font-semibold text-sm ml-2 whitespace-nowrap">
                                                {selectedRegion?.currency_symbol || '₹'}{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Promo Code */}
                                <div className="flex gap-2 mb-6">
                                    <div className="relative flex-1">
                                        <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Promo code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white text-xs font-medium rounded-lg h-10 pl-10 pr-3 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <Button className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs h-10 px-4 rounded-lg border border-white/10 transition-all">
                                        Apply
                                    </Button>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/10 mb-6" />

                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-7">
                                    <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span>{selectedRegion?.currency_symbol || '₹'}{displayTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                                        <span className="text-sm font-black text-white uppercase tracking-tight">Total Amount</span>
                                        <span className="text-2xl font-black text-white tracking-tight tabular-nums">
                                            {selectedRegion?.currency_symbol || '₹'}{displayTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                                    <Checkbox
                                        id="terms"
                                        checked={isAgreed}
                                        onCheckedChange={(c) => setIsAgreed(c as boolean)}
                                        className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded mt-0.5"
                                    />
                                    <label htmlFor="terms" className="text-xs text-zinc-400 font-medium leading-relaxed cursor-pointer select-none">
                                        I agree to the <span className="text-white font-semibold hover:text-emerald-400 transition-colors">Terms of Service</span>. Refunds are not available.
                                    </label>
                                </div>

                                {/* Pay Button */}
                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed duration-200"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Pay {selectedRegion?.currency_symbol || '₹'}{displayTotal.toFixed(2)}
                                        </span>
                                    )}
                                </Button>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center gap-2 mt-5 pt-5 border-t border-white/10">
                                    <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">256-bit SSL Encrypted</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {isVerifying && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: -20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="relative max-w-md w-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Status Icon */}
                                <div className="relative mb-8 h-28 w-28 flex items-center justify-center">
                                    {verificationStatus === 'processing' && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="relative w-full h-full"
                                        >
                                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500/30" />
                                            <div className="absolute inset-2 rounded-full flex items-center justify-center">
                                                <Shield className="w-10 h-10 text-emerald-500" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {verificationStatus === 'success' && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                            className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                                        >
                                            <CheckCircle2 className="w-14 h-14 text-black" />
                                        </motion.div>
                                    )}

                                    {verificationStatus === 'error' && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: 180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                            className="w-full h-full bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/10"
                                        >
                                            <AlertCircle className="w-14 h-14 text-red-500" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Status Text */}
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                                    {verificationStatus === 'processing' ? 'Processing Payment' :
                                        verificationStatus === 'success' ? 'Payment Successful' : 'Transaction Failed'}
                                </h3>

                                <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 mb-8 inline-block">
                                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                        {verificationMessage}
                                    </p>
                                </div>

                                {/* Keys Display */}
                                {verificationStatus === 'success' && purchasedKeys.length > 0 && (
                                    <div className="w-full space-y-4 mb-8">
                                        <div className="flex items-center justify-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest">
                                            <Key className="w-4 h-4" />
                                            License Keys
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2.5 pr-2">
                                            {purchasedKeys.map((item, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                    className="bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-3.5 text-left transition-all duration-200"
                                                >
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">{item.product_name}</span>
                                                    <div className="flex items-center justify-between gap-2 bg-black/60 rounded-lg p-2.5 border border-white/5">
                                                        <code className="text-xs font-mono text-emerald-400 tracking-wider truncate select-all break-all">{item.key}</code>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.key);
                                                                toast({ title: "Copied!", description: "License key copied to clipboard." });
                                                            }}
                                                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {verificationStatus === 'success' && (
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                onClick={() => {
                                                    clearCart();
                                                    navigate("/client/dashboard");
                                                }}
                                                className="w-full h-12 bg-white text-black hover:bg-emerald-100 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                            >
                                                Dashboard
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                onClick={() => {
                                                    clearCart();
                                                    navigate("/products");
                                                }}
                                                className="w-full h-12 bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                            >
                                                Browse More
                                            </Button>
                                        </motion.div>
                                    </div>
                                )}

                                {verificationStatus === 'error' && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full"
                                    >
                                        <Button
                                            onClick={() => setIsVerifying(false)}
                                            className="w-full h-12 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Retry Payment
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Crypto Payment Dialog */}
            <Dialog open={isCryptoDialogOpen} onOpenChange={setIsCryptoDialogOpen}>
                <DialogContent className="max-w-2xl bg-black border border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,1)]">
                    <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                        {/* Sidebar - Coin Selection */}
                        <div className="md:col-span-2 bg-[#050505] border-r border-white/5 p-6 flex flex-col gap-6">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1">Choose Asset</h3>
                                <div className="space-y-2">
                                    {Object.entries(cryptoAccounts).map(([key, coin]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedCrypto(key as any)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group text-left",
                                                selectedCrypto === key
                                                    ? "bg-white/5 border-white/20 shadow-lg"
                                                    : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center", coin.color)}>
                                                    {key.includes('btc') ? <Bitcoin className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white leading-none mb-1">{coin.name.split(' ')[0]}</p>
                                                    <p className="text-[9px] font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">{coin.network.split(' ')[0]}</p>
                                                </div>
                                            </div>
                                            {selectedCrypto === key && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Need Help?
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                        Contact our team on Discord or Telegram for instant assistance.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open("https://discord.gg/bCBn7hFe4B", "_blank")}
                                        className="flex-1 h-10 bg-[#5865F2] hover:bg-[#4752c4] rounded-xl flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                                    >
                                        <Zap className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => window.open("https://t.me/DevImGui", "_blank")}
                                        className="flex-1 h-10 bg-[#0088cc] hover:bg-[#0077b3] rounded-xl flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                                    >
                                        <Terminal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Selected Coin Details */}
                        <div className="md:col-span-3 p-8 flex flex-col items-center justify-center relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedCrypto}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full flex flex-col items-center text-center"
                                >
                                    <div className="mb-6 relative">
                                        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                                        <div className="relative w-40 h-40 bg-white/[0.03] border border-white/10 rounded-3xl p-3 shadow-2xl backdrop-blur-sm group overflow-hidden">
                                            {cryptoAccounts[selectedCrypto].qr ? (
                                                <img
                                                    src={cryptoAccounts[selectedCrypto].qr}
                                                    alt="QR Code"
                                                    className="w-full h-full object-contain filter invert opacity-90 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                                                    <AlertCircle className="w-10 h-10 opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-4 text-center">Address via Ticket Only</span>
                                                </div>
                                            )}
                                            <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 w-full">
                                        <div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{cryptoAccounts[selectedCrypto].name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Network: {cryptoAccounts[selectedCrypto].network}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Deposit Address</label>
                                            <div className="flex items-center gap-2 bg-black border border-white/5 rounded-2xl p-4 group hover:border-white/10 transition-all">
                                                <code className="flex-1 text-[11px] font-mono text-emerald-400 truncate tracking-wider">
                                                    {cryptoAccounts[selectedCrypto].address}
                                                </code>
                                                {cryptoAccounts[selectedCrypto].address.includes('0x') || cryptoAccounts[selectedCrypto].address.startsWith('T') ? (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(cryptoAccounts[selectedCrypto].address);
                                                            toast({ title: "Copied!", description: "Address copied to clipboard." });
                                                        }}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-emerald-500 transition-all active:scale-90"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={() => window.open("https://discord.gg/bCBn7hFe4B", "_blank")}
                                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                                Finalize Transaction
                                            </Button>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-4">
                                                Provide TXID or Screenshot in your ticket for instant verification
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCryptoDialogOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                    >
                        <Lock className="w-4 h-4" />
                    </button>
                </DialogContent>
            </Dialog>
        </StoreLayout>
    );
};

export default Checkout;
