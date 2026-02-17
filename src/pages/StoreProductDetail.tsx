import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Zap,
    Shield,
    ChevronLeft,
    ShoppingCart,
    CreditCard,
    Check,
    Star,
    Users,
    Monitor,
    Smartphone,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreLayout } from "@/components/store/StoreLayout";
import { getStoreProduct, apiRequest } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { cn } from "@/lib/utils";

interface Plan {
    id: number;
    name: string;
    duration_days: number | null;
    price: number;
    description?: string;
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
    app_id?: number;
    region_prices?: {
        region_id: number;
        price: number;
    }[];
}

export default function StoreProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    const { selectedRegion } = useMarket();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await getStoreProduct(id);
                setProduct(data);

                if (data.plans && data.plans.length > 0) {
                    setPlans(data.plans);
                    setSelectedPlan(data.plans[0]);
                } else if (data.app_id) {
                    // Fallback to old app plans if no direct plans
                    const plansData = await apiRequest(`/admin/subscriptions/plans?app_id=${data.app_id}`);
                    const activePlans = plansData.filter((p: any) => p.active);
                    setPlans(activePlans);
                    if (activePlans.length > 0) setSelectedPlan(activePlans[0]);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getDisplayPrice = (basePrice: number) => {
        return basePrice;
    };

    const handleAddToCart = () => {
        if (!product || !selectedPlan) return;
        addToCart({
            ...product,
            id: product.id,
            name: `${product.name} - ${selectedPlan.name}`,
            price: getDisplayPrice(selectedPlan.price || product.price),
            plan_id: selectedPlan.id
        });
        navigate('/cart');
    };

    if (isLoading) {
        return (
            <StoreLayout>
                <div className="pt-32 pb-20 px-6 flex justify-center text-zinc-500 font-black uppercase tracking-[0.5em]">
                    Initializing Asset Documentation...
                </div>
            </StoreLayout>
        );
    }

    if (!product) {
        return (
            <StoreLayout>
                <div className="pt-32 pb-20 px-6 text-center">
                    <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Asset Not Found</h2>
                    <Button onClick={() => navigate('/products')} variant="outline">Return to Repository</Button>
                </div>
            </StoreLayout>
        );
    }

    const platformIcon = () => {
        const p = product.platform?.toLowerCase() || "";
        if (p.includes("windows")) return <Monitor className="w-4 h-4" />;
        if (p.includes("android")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.07 13.8533 7.5 12 7.5s-3.5902.57-5.1362 1.4501L4.8415 5.447a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
        );
        if (p.includes("ios") || p.includes("iphone")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.552 9.127 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.403-2.363-2-.078-3.675 1.04-4.61 1.04zm-.39-2.935c.844-1.026 1.416-2.455 1.26-3.87-1.221.052-2.701.818-3.571 1.844-.78.896-1.454 2.312-1.273 3.714 1.35.104 2.74-.688 3.584-1.688z" />
            </svg>
        );
        return <Globe className="w-4 h-4" />;
    };

    return (
        <StoreLayout>
            <div className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-emerald-500 uppercase tracking-widest mb-8 md:mb-12 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Products
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Visuals & Description */}
                        <div className="lg:col-span-7 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900/40 border border-zinc-900 group"
                            >
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Zap className="w-20 h-20 text-zinc-800" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />

                                <div className="absolute top-6 right-6">
                                    <Badge className="bg-emerald-500/10 backdrop-blur-md text-emerald-500 border border-emerald-500/20 px-4 py-1.5 font-black text-[10px] tracking-widest uppercase rounded-lg">
                                        AVAILABLE
                                    </Badge>
                                </div>
                            </motion.div>

                            <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/30" />
                                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-emerald-500/50" />
                                    Technical Briefing
                                </h3>
                                <div className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                                    {product.details || product.description || "No further technical data available for this registry entry."}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Configuration & Purchase */}
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="sticky top-32 space-y-8 text-left"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className="bg-zinc-950 border border-zinc-900 text-zinc-500 font-black px-3 py-1 rounded-lg text-[9px] tracking-widest uppercase">
                                            {product.category}
                                        </Badge>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <span className="text-zinc-600 font-black text-[9px] uppercase tracking-widest">REG_ID: {product.id}</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                                        {product.name}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8">
                                        {product.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                                            {platformIcon()}
                                            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">{product.platform}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                                            </div>
                                            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">4.9 (44K+)</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                                            <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                                            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">48 SOLD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Configuration Profile</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {plans.length > 0 ? plans.map((plan) => (
                                            <button
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={cn(
                                                    "group relative flex items-center justify-between p-6 rounded-xl border transition-all duration-300",
                                                    selectedPlan?.id === plan.id
                                                        ? "bg-zinc-900/50 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                                        : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                                                )}
                                            >
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={cn(
                                                        "text-sm font-black uppercase tracking-widest",
                                                        selectedPlan?.id === plan.id ? "text-white" : "text-zinc-500 transition-colors group-hover:text-zinc-300"
                                                    )}>
                                                        {plan.name}
                                                    </span>
                                                    {plan.id === plans[1]?.id && (
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">BEST VALUE NODE</span>
                                                    )}
                                                </div>
                                                <div className="flex items-end gap-1.5">
                                                    <span className="text-[10px] font-black text-zinc-600 uppercase mb-1">₹</span>
                                                    <span className={cn(
                                                        "text-xl font-black tracking-tighter",
                                                        selectedPlan?.id === plan.id ? "text-white" : "text-zinc-400 transition-colors group-hover:text-zinc-200"
                                                    )}>
                                                        {getDisplayPrice(plan.price)}
                                                    </span>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 text-center">
                                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">No plans initialized for this asset</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={!selectedPlan}
                                        className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.2em] rounded-xl shadow-xl shadow-emerald-500/10 active:scale-[0.98] transition-all group"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-3" />
                                        Initialize Purchase Sequence
                                    </Button>
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                            <Shield className="w-3 h-3 text-emerald-500/30" />
                                            Secure Channel
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                            <Zap className="w-3 h-3 text-emerald-500/30" />
                                            Instant Sync
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
