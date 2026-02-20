import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Lock, Zap, CreditCard, Bitcoin, Loader2, CheckCircle2, Copy, AlertCircle, X, ShoppingBag,
    Terminal, Globe, Key, ArrowRight
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { initiateRazorpayOrder, verifyRazorpayPayment, getAuth, submitManualStoreOrder } from "@/lib/api";

interface CheckoutProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    // If these are provided, it's a direct purchase of a single item
    product?: any;
    selectedPlan?: any;
    initialPaymentMethod?: string;
}

export const Checkout: React.FC<CheckoutProps> = ({ isOpen, onOpenChange, product, selectedPlan, initialPaymentMethod }) => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const { selectedRegion } = useMarket();
    const auth = getAuth();

    const [isVerifying, setIsVerifying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [verificationMessage, setVerificationMessage] = useState("");
    const [purchasedKeys, setPurchasedKeys] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState(initialPaymentMethod || 'razorpay');
    const [cryptoNetwork, setCryptoNetwork] = useState<'bep20' | 'trc20' | 'erc20'>('bep20');
    const [txHash, setTxHash] = useState("");

    useEffect(() => {
        if (isOpen && initialPaymentMethod) {
            setSelectedPayment(initialPaymentMethod);
        }
    }, [isOpen, initialPaymentMethod]);

    const currencySymbol = selectedRegion?.currency_symbol || '$';

    // Figure out if we are checking out the cart or a single product
    const isDirectPurchase = !!product && !!selectedPlan;
    const checkoutItems = isDirectPurchase
        ? [{ ...product, plan_id: selectedPlan.id, plan_name: selectedPlan.name, price: selectedPlan.price, quantity: 1 }]
        : items;

    const displayTotalPrice = isDirectPurchase
        ? (product.region_prices && selectedRegion
            ? (product.region_prices.find((rp: any) => rp.region_id === selectedRegion.id)?.price || selectedPlan.price)
            : selectedPlan.price)
        : totalPrice;

    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!auth.token) {
            toast({
                title: "Login Required",
                description: "You must be logged in to complete a purchase.",
                variant: "destructive"
            });
            onOpenChange(false);
            navigate("/login");
            return;
        }

        if (checkoutItems.length === 0) return;

        setIsProcessing(true);

        if (selectedPayment !== 'razorpay') {
            if (!txHash || txHash.length < 5) {
                toast({ title: "Invalid TXID", description: "Please enter a valid Transaction Hash", variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            try {
                await submitManualStoreOrder({
                    amount: displayTotalPrice,
                    items: checkoutItems.map(item => ({
                        product_id: item.id,
                        plan_id: item.plan_id,
                        price: item.price,
                        quantity: item.quantity || 1
                    })),
                    payment_method: selectedPayment,
                    transaction_id: txHash
                });

                setIsProcessing(false);
                setIsVerifying(true);
                setVerificationStatus('success');
                setVerificationMessage("Transaction Submitted. Your order is pending manual verification.");
                if (!isDirectPurchase) clearCart();
                return;
            } catch (err: any) {
                console.error("Manual Payment Error:", err);
                toast({
                    title: "Submission Error",
                    description: err.message || "Could not submit manual payment.",
                    variant: "destructive"
                });
                setIsProcessing(false);
                return;
            }
        }

        try {
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) throw new Error("Payment Gateway Protocol Failed to Load");

            const orderData = await initiateRazorpayOrder({
                amount: displayTotalPrice,
                items: checkoutItems.map(item => ({
                    product_id: item.id,
                    plan_id: item.plan_id,
                    price: item.price,
                    quantity: item.quantity || 1
                }))
            });

            const options = {
                key: (orderData as any).key_id || "rzp_live_SGSDs7w1ie6YS8",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Emerite Store",
                description: isDirectPurchase ? `Purchase: ${product.name}` : `Purchase: ${checkoutItems.length} items`,
                image: "/favicon.ico",
                order_id: orderData.id,
                handler: async (response: any) => {
                    setIsProcessing(false);
                    setIsVerifying(true);
                    setVerificationStatus('processing');
                    setVerificationMessage("Verifying Transaction Signature...");

                    try {
                        const verification = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verification.status === "success") {
                            setVerificationStatus('success');
                            setVerificationMessage("Payment Successful. Your assets are ready.");

                            if (verification.keys_data) {
                                setPurchasedKeys(verification.keys_data);
                            } else if (verification.keys) {
                                setPurchasedKeys(verification.keys.map((k: string) => ({
                                    product_name: isDirectPurchase ? product.name : "Item",
                                    key: k
                                })));
                            }

                            toast({
                                title: "Transaction Successful",
                                description: "Your purchase is complete.",
                            });

                            if (!isDirectPurchase) clearCart();
                        } else {
                            throw new Error(verification.message || "Verification Failed");
                        }
                    } catch (err: any) {
                        setVerificationStatus('error');
                        setVerificationMessage(err.message || "Payment verification failed.");
                    }
                },
                prefill: {
                    name: auth.user?.username || "",
                    email: auth.user?.email || "",
                },
                theme: { color: "#10b981" },
                modal: { ondismiss: () => setIsProcessing(false) }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast({
                title: "Transaction Error",
                description: error.message || "Could not initiate payment.",
                variant: "destructive"
            });
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl bg-zinc-950/90 backdrop-blur-2xl border-white/10 p-0 overflow-hidden shadow-2xl rounded-xl border-white/10 [&>button]:hidden">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                        <div className="absolute inset-0 bg-zinc-950/40" />
                    </div>

                    <div className="relative z-10 flex flex-col">
                        <div className="p-8 pb-6 flex items-center justify-between border-b border-white/[0.08]">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-white uppercase tracking-tight">Secure Checkout</DialogTitle>
                                    <DialogDescription className="sr-only">Review your order and complete payment.</DialogDescription>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Instant Delivery Guaranteed</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all focus:outline-none z-50 cursor-pointer pointer-events-auto"
                            >
                                <X className="w-5 h-5 pointer-events-none" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order Details</p>
                                        <div className="space-y-3">
                                            {checkoutItems.map((item, idx) => (
                                                <div key={idx} className="group relative rounded-lg overflow-hidden border border-white/[0.1] bg-white/[0.02] p-4 flex gap-4">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                                        <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1 truncate">{item.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                                {item.plan_name}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">x{item.quantity || 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end justify-center">
                                                        <span className="text-sm font-bold text-emerald-400">{currencySymbol}{item.price * (item.quantity || 1)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <Lock className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-white uppercase tracking-widest">Secure Link</p>
                                                <p className="text-[8px] font-medium text-zinc-500 uppercase mt-0.5">Encrypted Connection</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-white uppercase tracking-widest">Auto Delivery</p>
                                                <p className="text-[8px] font-medium text-zinc-500 uppercase mt-0.5">Instant Activation</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Summary</p>
                                        <div className="space-y-4 p-5 rounded-lg bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Items Subtotal</span>
                                                <span className="text-sm text-zinc-300 font-bold">{currencySymbol}{displayTotalPrice}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Service Fee</span>
                                                <span className="text-[10px] text-emerald-500 font-bold tracking-widest">Free</span>
                                            </div>
                                            <div className="h-px bg-white/[0.08] my-2" />
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Final Amount</p>
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-3xl font-bold text-white tracking-tight">
                                                        <span className="text-lg text-emerald-500 mr-1">{currencySymbol}</span>
                                                        {displayTotalPrice}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payment Method</p>
                                        {selectedPayment === 'razorpay' ? (
                                            <div className="p-5 rounded-xl bg-[#0a0a0a]/50 border border-white/5 shadow-inner h-full flex flex-col justify-start">
                                                <div className="flex flex-col gap-6 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-[56px] h-[56px] rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10 shadow-2xl bg-[#0a0a0a] flex items-center justify-center p-0.5 relative group">
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <img src="https://cdn.discordapp.com/icons/1472607924982648903/d0c087e880ecf64d3caebc70d598fa6f.webp?size=1024" alt="Razorpay" className="w-full h-full object-cover rounded-md" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">UPI / Card Payment</h4>
                                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                                                Powered by Razorpay
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-emerald-500/[0.03] px-4 py-3 rounded-lg border border-emerald-500/10 mt-auto">
                                                        <Zap className="w-4 h-4 text-emerald-500" />
                                                        <div className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest">
                                                            Everything is ready.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-6 shadow-inner">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center p-2.5 border border-emerald-500/20 shadow-lg">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-500">
                                                            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="currentColor" />
                                                            <path d="M13.2359 10.3724V7.55018H17.4208V4.32031H6.5791V7.55018H10.7641V10.3724C8.01639 10.4901 6.00288 11.1683 6.00288 11.9678C6.00288 12.7674 8.01639 13.4455 10.7641 13.5633V19.6797H13.2359V13.5633C15.9836 13.4455 17.9971 12.7674 17.9971 11.9678C17.9971 11.1683 15.9836 10.4901 13.2359 10.3724ZM11.9996 12.636C9.52985 12.636 7.50207 12.2139 7.50207 11.6661C7.50207 11.1182 9.52985 10.6961 11.9996 10.6961C14.4694 10.6961 16.4972 11.1182 16.4972 11.6661C16.4972 12.2139 14.4694 12.636 11.9996 12.636Z" fill="#0a0a0a" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Tether (USDT) Transfer</h4>
                                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                                                            Manual Crypto Payment
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">1</div>
                                                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Select Network</div>
                                                    </div>
                                                    <div className="flex bg-black/40 p-1.5 rounded-lg border border-white/5 gap-1.5 shadow-inner">
                                                        {['BEP20', 'trc20', 'erc20'].map((net) => (
                                                            <button
                                                                key={net}
                                                                onClick={(_) => setCryptoNetwork(net as any)}
                                                                className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${cryptoNetwork === net ? "bg-emerald-500 text-black shadow-md scale-[1.02]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
                                                            >
                                                                {net === 'trc20' ? 'TRC20' : net === 'erc20' ? 'ERC20' : 'BEP20'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">2</div>
                                                            <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Send Payment</div>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                                                            <Zap className="w-3 h-3" /> Only {cryptoNetwork.toUpperCase()}
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner flex flex-col sm:flex-row gap-5 items-center">
                                                        <div className="w-24 h-24 rounded-lg bg-white p-2 shrink-0 shadow-2xl ring-1 ring-white/10 mx-auto sm:mx-0">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cryptoNetwork === 'trc20' ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP" : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90"}&bgcolor=fff&color=000&margin=0`}
                                                                alt="QR Code"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0 w-full space-y-3">
                                                            <div>
                                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 text-center sm:text-left">Send Exactly:</div>
                                                                <div className="text-2xl font-black text-white tracking-tight flex items-baseline justify-center sm:justify-start gap-1.5">
                                                                    <span className="text-emerald-500 font-bold">$</span>
                                                                    {currencySymbol === '₹' ? (displayTotalPrice / 80).toFixed(2) : displayTotalPrice}
                                                                    <span className="text-sm text-emerald-500 font-bold uppercase tracking-widest">USDT</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 text-center sm:text-left">To Address:</div>
                                                                <div
                                                                    className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 p-1.5 pl-3 rounded-lg cursor-pointer transition-all group/copy"
                                                                    onClick={(_) => {
                                                                        navigator.clipboard.writeText(cryptoNetwork === 'trc20' ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP" : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90");
                                                                        toast({ title: "Copied!", description: "Address copied to clipboard" });
                                                                    }}
                                                                >
                                                                    <code className="text-xs text-zinc-300 font-mono truncate">
                                                                        {cryptoNetwork === 'trc20' ? "TT2fYWs2gfUbbyMzU3wdUps6ECqGPUt7zP" : "0x680e71e7733a8333f1a8dca2532a4d3f87724e90"}
                                                                    </code>
                                                                    <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center shrink-0 border border-white/5 group-hover/copy:border-emerald-500/30 group-hover/copy:bg-emerald-500/10">
                                                                        <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/copy:text-emerald-500 transition-colors" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">3</div>
                                                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Verify Transfer</div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={txHash}
                                                            onChange={(e) => setTxHash(e.target.value)}
                                                            placeholder="Paste Transaction ID (TXID)..."
                                                            className="w-full h-12 bg-black/40 border border-white/10 rounded-lg pl-4 pr-12 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-emerald-500/5 transition-all shadow-inner"
                                                        />
                                                        {txHash && txHash.length > 5 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 animate-in zoom-in">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-white/[0.08] bg-black/40">
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm uppercase tracking-widest rounded-lg shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Redirecting to Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        <span>Complete Order</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {isVerifying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="flex flex-col items-center text-center">
                                {verificationStatus === 'processing' && (
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-emerald-500/20 blur-2xl -z-10"
                                        />
                                    </div>
                                )}

                                {verificationStatus === 'success' && (
                                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </div>
                                )}

                                {verificationStatus === 'error' && (
                                    <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                                        <AlertCircle className="w-12 h-12 text-red-500" />
                                    </div>
                                )}

                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                                    {verificationStatus === 'processing' ? 'Verifying Protocol' :
                                        verificationStatus === 'success' ? 'Access Granted' : 'Handshake Failed'}
                                </h3>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed max-w-xs">
                                    {verificationMessage}
                                </p>

                                {verificationStatus === 'success' && purchasedKeys.length > 0 && (
                                    <div className="w-full space-y-4 mb-10">
                                        {purchasedKeys.map((keyData, idx) => (
                                            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20 group transition-all hover:bg-white/[0.04]">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">{keyData.product_name}</span>
                                                    <Key className="w-4 h-4 text-emerald-500/40" />
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <code className="text-lg font-black text-white tracking-widest truncate">{keyData.key}</code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(keyData.key);
                                                            toast({ title: "Copied", description: "Key copied to clipboard." });
                                                        }}
                                                        className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {verificationStatus === 'success' && (
                                    <div className="flex flex-col w-full gap-3">
                                        <Button
                                            onClick={() => {
                                                onOpenChange(false);
                                                setIsVerifying(false);
                                                navigate("/client/dashboard");
                                            }}
                                            className="w-full h-14 bg-white text-black hover:bg-emerald-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Dashboard
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                onOpenChange(false);
                                                setIsVerifying(false);
                                            }}
                                            className="w-full h-14 bg-white/5 text-white hover:bg-white/10 border border-white/10 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                )}

                                {verificationStatus === 'error' && (
                                    <Button
                                        onClick={() => setIsVerifying(false)}
                                        className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Retry Sequence
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
