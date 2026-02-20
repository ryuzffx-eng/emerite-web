import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    ChevronLeft,
    Terminal,
    Globe,
    Play,
    Tag,
    Clock,
    Lock,
    ChevronRight,
    Download,
    ShoppingCart,
    HelpCircle,
    X,
    Zap,
    Star,
    Check,
    CheckCircle2,
    ArrowRight,
    CreditCard,
    Wallet,
    Bitcoin,
    Copy,
    Key,
    MessageSquare,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store/StoreLayout";
import { getStoreProduct, getStoreProducts, apiRequest, getAuth, initiateRazorpayOrder, verifyRazorpayPayment } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { cn, formatIST } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import emeriteLogo from "@/assets/emerite-logo.png";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Checkout } from "@/components/store/Checkout";

interface Plan {
    id: number;
    name: string;
    duration_days: number | null;
    price: number;
    description?: string;
    is_best_value?: boolean;
}

interface Product {
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
    tags?: string;
    showcase_images?: string;
    author?: string;
    app_id?: number;
    updated_at: string;
    plans?: Plan[];
    region_prices?: { region_id: number; price: number }[];
    is_active: boolean;
}

const paymentMethods = [
    {
        id: 'razorpay',
        name: "Razorpay",
        subtitle: "UPI / Card / Net",
        status: "READY",
        logo: "https://cdn.discordapp.com/icons/1472607924982648903/d0c087e880ecf64d3caebc70d598fa6f.webp?size=1024",
        badge: "RECOMMENDED",
        active: true,
    },
    {
        id: 'eth',
        name: "Ethereum",
        subtitle: "ETH Network",
        status: "OFF",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040",
        badge: "CRYPTO",
        active: false,
    },
    {
        id: 'ltc',
        name: "Litecoin",
        subtitle: "LTC Network",
        status: "OFF",
        logo: "https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=040",
        badge: "CRYPTO",
        active: true,
    },
    {
        id: 'sol',
        name: "Solana",
        subtitle: "SOL Network",
        status: "OFF",
        logo: "https://cryptologos.cc/logos/solana-sol-logo.png?v=040",
        badge: "CRYPTO",
        active: false,
    },
    {
        id: 'usdt_trc20',
        name: "USDT",
        subtitle: "TRC20 Network",
        status: "READY",
        logo: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=040",
        badge: "CRYPTO",
        active: true,
    },
    {
        id: 'paypal',
        name: "PayPal",
        subtitle: "PayPal",
        status: "OFF",
        logo: "https://logo.svgcdn.com/simple-icons/paypal-dark.png",
        badge: "FIAT",
        active: false,
    },
];

const howItWorks = [
    { icon: ShoppingCart, title: "Purchase", desc: "Secure checkout through our platform", step: "01" },
    { icon: Download, title: "Download", desc: "Instant delivery link to your access", step: "02" },
    { icon: HelpCircle, title: "Support", desc: "Dedicated help from the developer", step: "03" },
];

export default function StoreProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string>('razorpay');
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>("");
    const [progress, setProgress] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [showFloatingBar, setShowFloatingBar] = useState(false);

    const { addToCart, clearCart } = useCart();
    const { selectedRegion } = useMarket();
    const { toast } = useToast();
    const auth = getAuth();

    const showcaseImages = product?.showcase_images
        ? product.showcase_images.split(',').map((img) => img.trim())
        : [];
    const allImages = product
        ? [product.image_url, ...showcaseImages].filter(Boolean)
        : [];

    const handleNext = () => {
        const currentIndex = allImages.indexOf(activeImage);
        setActiveImage(allImages[(currentIndex + 1) % allImages.length]);
        setProgress(0);
    };

    const handlePrev = () => {
        const currentIndex = allImages.indexOf(activeImage);
        setActiveImage(allImages[(currentIndex - 1 + allImages.length) % allImages.length]);
        setProgress(0);
    };

    useEffect(() => {
        if (!allImages.length || isLoading || isHovering) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [allImages.length, isLoading, isHovering, activeImage]);

    useEffect(() => {
        const handleScroll = () => {
            const purchaseCard = document.getElementById('purchase-card');
            if (purchaseCard) {
                const rect = purchaseCard.getBoundingClientRect();
                setShowFloatingBar(rect.bottom < 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await getStoreProduct(id);
                setProduct(data);
                if (data.image_url) setActiveImage(data.image_url);

                if (data.plans && data.plans.length > 0) {
                    setPlans(data.plans);
                    setSelectedPlan(data.plans.find((p: any) => p.is_best_value) || data.plans[0]);
                } else if (data.app_id) {
                    const plansData = await apiRequest(`/admin/subscriptions/plans?app_id=${data.app_id}`);
                    const activePlans = plansData.filter((p: any) => p.active);
                    setPlans(activePlans);
                    if (activePlans.length > 0) setSelectedPlan(activePlans[0]);
                }

                const allProducts = await getStoreProducts();
                setRelatedProducts(allProducts.filter((p: any) => p.id !== parseInt(id)).slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getDisplayPrice = (basePrice: number) => {
        if (product?.region_prices && selectedRegion) {
            const regionPrice = product.region_prices.find((rp) => rp.region_id === selectedRegion.id);
            if (regionPrice) return regionPrice.price;
        }
        return basePrice;
    };

    const handlePurchaseClick = () => {
        if (!auth.token) {
            toast({
                title: "Login Required",
                description: "You must be logged in to complete a purchase.",
                variant: "destructive"
            });
            navigate("/login", { state: { returnUrl: `/product/${id}` } });
            return;
        }
        if (!product || !selectedPlan) return;
        setIsCheckoutOpen(true);
    };

    const handleAddToCart = () => {
        if (!product || !selectedPlan) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: getDisplayPrice(selectedPlan.price || product.price),
            image: product.image_url,
            plan_id: selectedPlan.id,
            plan_name: selectedPlan.name,
        });
        toast({
            title: "Added to Cart",
            description: `${product.name} (${selectedPlan.name}) has been added to your cart.`,
        });
    };

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
        setIsCheckoutOpen(true);
    };

    const tags = product?.tags ? product.tags.split(',').map((tag) => tag.trim()) : [];
    const currencySymbol = selectedRegion?.currency_symbol || '$';

    return (
        <StoreLayout hideFooter={true}>
            <div className="text-zinc-100 min-h-screen font-sans relative overflow-x-hidden">

                {/* Ambient background glow */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                </div>

                {isLoading ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="relative flex flex-col items-center gap-6">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full bg-emerald-500/30 blur-3xl scale-150"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.06, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-20 h-20 relative z-10"
                                >
                                    <img src={emeriteLogo} alt="Emerite" className="w-full h-full object-contain" />
                                </motion.div>
                            </div>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i} className="w-1 h-1 rounded-full bg-emerald-500"
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : !product ? (
                    <div className="pt-32 pb-20 px-6 text-center min-h-screen flex flex-col items-center justify-center gap-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Product Not Found</h2>
                        <Button onClick={() => navigate('/products')} className="bg-emerald-500 text-black hover:bg-emerald-400">
                            Return to Store
                        </Button>
                    </div>
                ) : (
                    <div className="product-detail-container relative">
                        <div className="relative z-10 pt-28 pb-32 w-[96%] max-w-7xl mx-auto">

                            {/* Breadcrumb */}
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-8 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                                <button onClick={() => navigate('/products')} className="hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                                    <ChevronLeft className="w-3.5 h-3.5" /> Marketplace
                                </button>
                                <span>/</span>
                                <span className="text-zinc-400">{product.name}</span>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_400px] gap-6 xl:gap-8">

                                {/* -- Left: Thumbnail Strip -- */}
                                <div className="hidden lg:flex flex-col gap-3 sticky top-24 self-start pt-1">
                                    {allImages.map((img, i) => {
                                        const isActive = activeImage === img;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => { setActiveImage(img); setProgress(0); }}
                                                className={cn(
                                                    "w-[85px] aspect-[4/3] rounded-[10px] overflow-hidden border-[1.5px] transition-all duration-300 relative group flex-shrink-0",
                                                    isActive
                                                        ? "border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.2)] z-10 scale-105"
                                                        : "border-transparent opacity-80 hover:opacity-100"
                                                )}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumb ${i + 1}`}
                                                    className={cn("w-full h-full object-cover transition-all duration-500", isActive && "blur-[2px] scale-110 brightness-[0.6]")}
                                                />
                                                {isActive && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                                        <Check className="w-7 h-7 text-emerald-500 drop-shadow-[0_2px_10px_rgba(16,185,129,0.8)]" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                    {product.yt_video_url && (
                                        <button
                                            onClick={() => window.open(product.yt_video_url, "_blank")}
                                            className="w-[85px] aspect-[4/3] rounded-[10px] overflow-hidden border-[1.5px] border-transparent opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 relative group flex-shrink-0"
                                            title="Watch Video"
                                        >
                                            {allImages[0] ? (
                                                <img src={allImages[0]} alt="Video" className="w-full h-full object-cover brightness-50" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-900" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <Play className="w-6 h-6 text-white drop-shadow-md" fill="white" strokeWidth={1} />
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* -- Middle: Content -- */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6 min-w-0">

                                    {/* Gallery */}
                                    <div
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl group bg-black cursor-zoom-in"
                                        onClick={() => setIsLightboxOpen(true)}
                                    >
                                        {/* Progress bar */}
                                        <div className={cn("absolute top-3 left-4 right-4 h-1 bg-white/20 rounded-full z-20 overflow-hidden backdrop-blur-md transition-opacity duration-500", isHovering ? "opacity-0" : "opacity-100")}>
                                            <motion.div
                                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                                            />
                                        </div>

                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={activeImage}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.35 }}
                                                src={activeImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                            />
                                        </AnimatePresence>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Nav arrows */}
                                        {allImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/60 hover:bg-black/80 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/60 hover:bg-black/80 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        {/* Image counter */}
                                        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest z-10">
                                            {allImages.indexOf(activeImage) + 1} / {allImages.length}
                                        </div>
                                    </div>

                                    {/* Description Card */}
                                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Product Overview</span>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-zinc-400 text-sm leading-[1.85] font-medium whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                {product.details || product.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* How It Works */}
                                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">How It Works</span>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-2">
                                                {howItWorks.map((step, i) => (
                                                    <div key={i} className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
                                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                                                            <step.icon className="w-5 h-5 text-emerald-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-white uppercase tracking-wide">{step.title}</p>
                                                            <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">{step.desc}</p>
                                                        </div>
                                                        <span className="text-sm font-black text-zinc-700 shrink-0">{step.step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* -- Right: Purchase Sidebar -- */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">

                                    {/* Purchase Card */}
                                    <div id="purchase-card" className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden">

                                        {/* Product header */}
                                        <div className="p-6 border-b border-white/[0.05] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                                            <div className="flex items-start justify-between gap-3 mb-4 relative">
                                                <div>
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Product #{product.id}</span>
                                                    <h1 className="text-xl font-black text-white uppercase tracking-tight leading-tight mt-1.5">{product.name}</h1>
                                                </div>
                                                <span className={cn(
                                                    "shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                    product.status === 'Undetected'
                                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                        : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                                                )}>
                                                    {product.status || 'Active'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 relative">
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">One-Hand</span>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">by {product.author || 'Lyapos'}</span>
                                            </div>

                                            {tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3 relative">
                                                    {tags.map((tag) => (
                                                        <span key={tag} className="text-[9px] font-bold text-emerald-500/50 hover:text-emerald-400 transition-colors uppercase tracking-wide cursor-pointer">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 space-y-5">

                                            {/* Plan Selection */}
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em]">Select Plan</p>
                                                <div className="space-y-2">
                                                    {plans.map((plan) => {
                                                        const isSelected = selectedPlan?.id === plan.id;
                                                        return (
                                                            <button
                                                                key={plan.id}
                                                                onClick={() => setSelectedPlan(plan)}
                                                                onPointerDown={(e) => e.preventDefault()}
                                                                className={cn(
                                                                    "w-full px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between outline-none focus:outline-none relative overflow-hidden",
                                                                    isSelected
                                                                        ? "bg-emerald-500/[0.07] border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                                                                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                                                                )}
                                                            >
                                                                {isSelected && (
                                                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 rounded-r-full shadow-[0_0_12px_#10b981]" />
                                                                )}
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full transition-all duration-200 shrink-0",
                                                                        isSelected ? "bg-emerald-500 shadow-[0_0_8px_#10b981] scale-125" : "bg-white/[0.12]"
                                                                    )} />
                                                                    <div className="text-left">
                                                                        <p className={cn("text-xs font-black uppercase tracking-wide", isSelected ? "text-emerald-400" : "text-zinc-400")}>
                                                                            {plan.name}
                                                                        </p>
                                                                        <p className="text-[9px] text-zinc-600 font-semibold mt-0.5">
                                                                            {plan.duration_days ? `${plan.duration_days} Days` : 'Lifetime Access'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={cn("text-sm font-black", isSelected ? "text-emerald-400" : "text-zinc-500")}>
                                                                        {currencySymbol}{getDisplayPrice(plan.price)}
                                                                    </p>
                                                                    {plan.is_best_value && (
                                                                        <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Best Value</span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Payment Methods */}
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em]">Payment Method</p>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {paymentMethods.map((m) => {
                                                        const isSelected = selectedPayment === m.id;
                                                        const isOff = m.status === 'OFF';
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                disabled={isOff}
                                                                onPointerDown={(e) => e.preventDefault()}
                                                                onClick={() => setSelectedPayment(m.id)}
                                                                className={cn(
                                                                    "py-2.5 px-2 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1.5 outline-none focus:outline-none relative",
                                                                    isSelected
                                                                        ? "bg-emerald-500/[0.08] border-emerald-500/50"
                                                                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]",
                                                                    isOff && "opacity-20 cursor-not-allowed grayscale pointer-events-none"
                                                                )}
                                                            >
                                                                {isSelected && (
                                                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                                                                )}
                                                                <div className="w-7 h-7 flex items-center justify-center">
                                                                    <img src={m.logo} alt={m.name} className="w-full h-full object-contain" />
                                                                </div>
                                                                <span className={cn(
                                                                    "text-[8px] font-bold uppercase tracking-wide leading-none",
                                                                    isSelected ? "text-emerald-400" : "text-zinc-500"
                                                                )}>{m.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Order Total */}
                                            <div className="pt-4 space-y-3 border-t border-white/[0.06]">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-zinc-500 font-semibold">Subtotal</span>
                                                        <span className="text-xs text-zinc-300 font-bold">{currencySymbol}{getDisplayPrice(selectedPlan?.price || product.price)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-zinc-500 font-semibold">Tax (0%)</span>
                                                        <span className="text-xs text-emerald-500 font-bold">+ {currencySymbol}0.00</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                                                    <span className="text-xs font-black text-white uppercase tracking-wider">Total</span>
                                                    <span className="text-2xl font-black text-emerald-400">
                                                        {currencySymbol}{getDisplayPrice(selectedPlan?.price || product.price)}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handlePurchaseClick}
                                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_8px_32px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2"
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        Buy Now
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-center gap-3 pt-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">
                                                        <Shield className="w-3 h-3 text-emerald-500/40" /> Secure
                                                    </div>
                                                    <div className="w-px h-3 bg-white/10" />
                                                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">
                                                        <Zap className="w-3 h-3 text-emerald-500/40" /> Instant Delivery
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* How It Works Removed from Sidebar */}

                                </motion.div>
                            </div>

                            {/* Related Products */}
                            {relatedProducts.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-24 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-[2px] bg-emerald-500" />
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Similar Assets</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">More Creations</h2>
                                        </div>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="flex items-center gap-2 px-5 py-2.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest border border-white/[0.06] rounded-xl hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                                        >
                                            Browse all <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                        {relatedProducts.map((p, i) => (
                                            <StoreProductCard
                                                key={p.id}
                                                product={{ ...p, is_active: p.is_active ?? true }}
                                                index={i}
                                                onBuy={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                                                playingProduct={null}
                                                setPlayingProduct={() => { }}
                                                addedId={null}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Floating Purchase Bar */}
                        <AnimatePresence>
                            {showFloatingBar && !isCheckoutOpen && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    className="fixed bottom-0 left-0 right-0 z-[80] p-4 lg:hidden"
                                >
                                    <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{product.name}</span>
                                            <span className="text-xl font-black text-emerald-400">{currencySymbol}{getDisplayPrice(selectedPlan?.price || product.price)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePurchaseClick}
                                                className="px-8 h-12 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2"
                                            >
                                                <Zap className="w-4 h-4" /> Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Checkout Dialog & Verification Modal */}
                        <Checkout
                            isOpen={isCheckoutOpen}
                            onOpenChange={setIsCheckoutOpen}
                            product={product}
                            selectedPlan={selectedPlan}
                            initialPaymentMethod={selectedPayment}
                        />

                        {/* Floating Support Button */}
                        <div className="fixed bottom-6 right-6 z-[100]">
                            <button className="flex items-center gap-2.5 px-5 h-11 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-2xl hover:border-emerald-500/40 transition-all text-zinc-400 hover:text-white group">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] group-hover:scale-125 transition-transform" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
                            </button>
                        </div>

                        {/* Lightbox */}
                        <AnimatePresence>
                            {isLightboxOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-16"
                                    onClick={() => setIsLightboxOpen(false)}
                                >
                                    <button
                                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[210]"
                                        onClick={() => setIsLightboxOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="relative w-full h-full max-w-6xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={handlePrev} className="absolute -left-2 md:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[220]">
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button onClick={handleNext} className="absolute -right-2 md:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-[220]">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.06] bg-black/50 shadow-2xl">
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={activeImage}
                                                    initial={{ opacity: 0, scale: 0.97 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.02 }}
                                                    transition={{ duration: 0.3 }}
                                                    src={activeImage}
                                                    alt="Product Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </AnimatePresence>
                                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                                    {product?.name} <span className="text-emerald-500 mx-2">//</span> Asset Preview
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
