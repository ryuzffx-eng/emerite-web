import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Zap,
    Shield,
    Search,
    ShoppingCart,
    Plus,
    Check,
    Globe,
    Monitor,
    Smartphone,
    Cpu,
    Crosshair,
    Terminal,
    ChevronRight,
    User,
    Play,
    Star,
    Users,
    ArrowLeft,
    ShieldCheck,
    Activity,
    X,
    Tag,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getStoreProducts } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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

export default function StoreProducts() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { addToCart } = useCart();
    const { selectedRegion, setIsMarketOpen } = useMarket();
    const [addedId, setAddedId] = useState<number | null>(null);
    const [selectedProductForPlan, setSelectedProductForPlan] = useState<Product | null>(null);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [playingProduct, setPlayingProduct] = useState<number | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    // Scroll to category function
    const scrollToCategory = (category: string) => {
        const element = document.getElementById(`category-${category}`);
        if (element) {
            const offset = 100; // Account for sticky navs
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveCategory(category);
        }
    };

    // Track active category on scroll
    useEffect(() => {
        const handleScroll = () => {
            const categories = Object.keys(productsByCategory);
            for (const category of categories) {
                const element = document.getElementById(`category-${category}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 120 && rect.bottom >= 120) {
                        setActiveCategory(category);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [products]);

    const fetchData = async () => {
        try {
            const data = await getStoreProducts();
            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data && Array.isArray(data.data)) {
                setProducts(data.data);
            } else {
                console.error("Invalid product data format:", data);
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedProductForPlan && selectedProductForPlan.plans && isPlanDialogOpen) {
            const bestValuePlan = selectedProductForPlan.plans.find(p => p.is_best_value);
            // Default to the first plan if no best value plan is set, or if user wants "none" by default, 
            // but effectively we auto-select the best value one if it exists.
            if (bestValuePlan) {
                setSelectedPlanId(bestValuePlan.id);
            } else if (selectedProductForPlan.plans.length > 0) {
                setSelectedPlanId(selectedProductForPlan.plans[0].id);
            }
        }
    }, [selectedProductForPlan, isPlanDialogOpen]);

    const handleBuyClick = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.plans && product.plans.length > 0) {
            setSelectedProductForPlan(product);
            setIsPlanDialogOpen(true);
        } else {
            handleAddToCart(product);
        }
    };

    const handleAddToCart = (product: Product, plan?: { id: number; name: string; price: number }) => {
        const displayPrice = plan ? plan.price : getDisplayPrice(product);
        const cartItem = {
            ...product,
            price: displayPrice,
            plan_id: plan?.id,
            plan_name: plan?.name,
            image: product.image_url
        };
        addToCart(cartItem);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 2000);
        setIsPlanDialogOpen(false);
    };

    const getDisplayPrice = (product: Product) => {
        if (product.region_prices && product.region_prices.length > 0 && selectedRegion) {
            const regionPrice = product.region_prices.find(rp => rp.region_id === selectedRegion.id);
            if (regionPrice) {
                return regionPrice.price;
            }
        }
        return product.price;
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.platform && p.platform.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const productsByCategory = filteredProducts.reduce((acc, product) => {
        const category = product.category || "General";
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const categories = Object.keys(productsByCategory);

    const getPlatformIcon = (platform: string) => {
        const p = platform?.toLowerCase() || "";
        if (p.includes("windows")) return <Monitor className="w-3.5 h-3.5" />;
        if (p.includes("android")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.07 13.8533 7.5 12 7.5s-3.5902.57-5.1362 1.4501L4.8415 5.447a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
        );
        if (p.includes("ios") || p.includes("iphone")) return (
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.552 9.127 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.403-2.363-2-.078-3.675 1.04-4.61 1.04zm-.39-2.935c.844-1.026 1.416-2.455 1.26-3.87-1.221.052-2.701.818-3.571 1.844-.78.896-1.454 2.312-1.273 3.714 1.35.104 2.74-.688 3.584-1.688z" />
            </svg>
        );
        return <Globe className="w-3.5 h-3.5" />;
    };

    const getDisplayProductPrice = (product: Product) => {
        if (product.plans && product.plans.length > 0) {
            const prices = product.plans.map(p => p.price);
            const minPrice = Math.min(...prices);
            return `₹${minPrice}`;
        }
        return `₹${getDisplayPrice(product)}`;
    }

    return (
        <StoreLayout hideFooter={true}>
            <div className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto relative">
                    {/* Header stripped as requested previously */}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[300px] rounded-3xl bg-zinc-900/50 border border-zinc-900 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <div key={category} id={`category-${category}`} className="space-y-6 scroll-mt-32">
                                        <div className="flex items-center gap-6 py-4">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em]">
                                                {category}
                                            </h3>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {productsByCategory[category].map((product, i) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.05, type: "spring", stiffness: 50 }}
                                                    className={cn(
                                                        "group h-full",
                                                        (!product.status || product.status === 'Working' || product.status === 'Undetected')
                                                            ? "cursor-pointer"
                                                            : "cursor-not-allowed"
                                                    )}
                                                    onClick={(e) => {
                                                        if (!product.status || product.status === 'Working' || product.status === 'Undetected') {
                                                            handleBuyClick(e, product);
                                                        }
                                                    }}
                                                >
                                                    {/* Card Wrapper with Gradient Border Glow */}
                                                    <div className="relative h-full p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent group-hover:from-emerald-500/50 transition-all duration-700">

                                                        {/* Desktop Inner Glow */}
                                                        <div className="absolute -inset-2 bg-emerald-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                        {/* Main Content Container */}
                                                        <div className={cn(
                                                            "bg-[#070707] rounded-2xl overflow-hidden transition-all duration-700 h-full flex flex-col relative z-20",
                                                            (!product.status || product.status === 'Working' || product.status === 'Undetected')
                                                                ? "group-hover:bg-[#0a0a0a]"
                                                                : "opacity-60"
                                                        )}>
                                                            {/* Image Section */}
                                                            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950 flex-shrink-0">
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
                                                                        {/* Advanced Overlays */}
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/20 z-10" />
                                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 mix-blend-overlay z-10 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_center,_#10b981_1px,_transparent_1px)] bg-[size:24px_24px]" />

                                                                        {product.image_url ? (
                                                                            <img
                                                                                src={product.image_url}
                                                                                alt={product.name}
                                                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900/40">
                                                                                <Zap className="w-12 h-12 text-emerald-500/10 group-hover:text-emerald-500/30 transition-colors" />
                                                                            </div>
                                                                        )}

                                                                        {/* Tactical Play Button */}
                                                                        {product.yt_video_url && (
                                                                            <div
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setPlayingProduct(product.id);
                                                                                }}
                                                                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 backdrop-blur-[3px]"
                                                                            >
                                                                                <motion.div
                                                                                    className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                                                                    whileHover={{ scale: 1.15 }}
                                                                                >
                                                                                    <Play className="w-7 h-7 fill-current ml-1" />
                                                                                </motion.div>
                                                                            </div>
                                                                        )}

                                                                        {/* Status Indicator (LED Style) */}
                                                                        {product.status && (
                                                                            <div className="absolute top-6 right-6 z-20">
                                                                                <div className={cn(
                                                                                    "px-3 py-1.5 rounded-full backdrop-blur-md border text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl",
                                                                                    (product.status === 'Working' || product.status === 'Undetected') ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                                                                        product.status === 'Updating' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                                                                                            product.status === 'Maintenance' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                                                "bg-red-500/10 border-red-500/30 text-red-300"
                                                                                )}>
                                                                                    <span className="flex h-1.5 w-1.5 relative">
                                                                                        <span className={cn(
                                                                                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                                                                            (product.status === 'Working' || product.status === 'Undetected') ? "bg-emerald-500" :
                                                                                                product.status === 'Updating' ? "bg-blue-500" :
                                                                                                    "bg-zinc-500"
                                                                                        )} />
                                                                                        <span className={cn(
                                                                                            "relative inline-flex rounded-full h-1.5 w-1.5",
                                                                                            (product.status === 'Working' || product.status === 'Undetected') ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                                                                                product.status === 'Updating' ? "bg-blue-500" :
                                                                                                    "bg-zinc-500"
                                                                                        )} />
                                                                                    </span>
                                                                                    {product.status === 'Working' ? 'Undetected' : product.status}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Info Section */}
                                                            <div className="p-8 flex flex-col flex-grow bg-[#070707] group-hover:bg-[#0a0a0a] transition-colors duration-700">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                                                                        {product.category || "General"}
                                                                    </span>
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-white/5" />
                                                                    <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                                                                        {getPlatformIcon(product.platform)}
                                                                        {product.platform}
                                                                    </div>
                                                                </div>

                                                                <h3 className="text-white font-black text-xl leading-tight uppercase tracking-tighter mb-6 group-hover:text-emerald-500 transition-colors duration-500 line-clamp-2">
                                                                    {product.name}
                                                                </h3>

                                                                <div className="flex-grow" />

                                                                {/* Pricing & CTA */}
                                                                <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between mt-auto">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Starting At</span>
                                                                        <span className={cn(
                                                                            "text-3xl font-black tracking-tight leading-none",
                                                                            (!product.status || product.status === 'Working' || product.status === 'Undetected') ? "text-white" : "text-zinc-700"
                                                                        )}>
                                                                            {getDisplayProductPrice(product)}
                                                                        </span>
                                                                    </div>

                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        className={cn(
                                                                            "h-12 px-7 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl",
                                                                            addedId === product.id
                                                                                ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                                                                : "bg-white text-black hover:bg-emerald-500 hover:text-black group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                                                                        )}
                                                                    >
                                                                        {addedId === product.id ? (
                                                                            <>
                                                                                <Check className="w-4 h-4" />
                                                                                Active
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                Buy Access
                                                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                                            </>
                                                                        )}
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/50">
                                    <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                                        <Search className="w-8 h-8 text-zinc-700" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-widest mb-2">No Products Found</h3>
                                    <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider">Try adjusting your search criteria</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="max-w-[95vw] md:max-w-4xl bg-[#070707] border-white/[0.05] p-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/99 focus:outline-none"
                >
                    <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:h-auto overflow-hidden">
                        {/* Left Column: Briefing */}
                        <div className="w-full md:w-[48%] bg-[#050505] border-r border-white/5 relative flex flex-col p-8">
                            <div className="flex-grow flex items-center justify-center py-10">
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-white/5">
                                    {selectedProductForPlan?.image_url ? (
                                        <img
                                            src={selectedProductForPlan?.image_url}
                                            alt={selectedProductForPlan?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Zap className="w-16 h-16 text-zinc-900" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                {selectedProductForPlan?.status && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                            {selectedProductForPlan.status === 'Working' ? 'Undetected' : selectedProductForPlan.status}
                                        </span>
                                    </div>
                                )}
                                <p className="text-[11px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                                    {selectedProductForPlan?.description || "High-performance software designed for competitive advantage."}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Selection */}
                        <div className="w-full md:w-[52%] p-10 flex flex-col relative bg-[#070707]">
                            <div className="flex items-center gap-4 mb-6">
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1">
                                    {selectedProductForPlan?.category || "Access"}
                                </Badge>
                                <span className="text-zinc-600 font-black text-[9px] tracking-widest">VERSION 1.0.0</span>
                            </div>

                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                {selectedProductForPlan?.name}
                            </h2>

                            <div className="flex items-center gap-6 mb-10 overflow-x-auto no-scrollbar pb-2">
                                <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                                    <Monitor className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Windows</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                                    <Zap className="w-4 h-4 text-emerald-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Instant</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] whitespace-nowrap">Select Plan</span>
                                <div className="h-px bg-white/[0.05] flex-grow" />
                            </div>

                            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                {selectedProductForPlan?.plans?.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className={cn(
                                            "w-full group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                                            selectedPlanId === plan.id
                                                ? "bg-emerald-500/10 border-emerald-500/50"
                                                : "bg-white/[0.02] border-white/[0.03] hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPlanId === plan.id ? "border-emerald-500" : "border-zinc-800"
                                            )}>
                                                {selectedPlanId === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-black uppercase tracking-widest",
                                                selectedPlanId === plan.id ? "text-white" : "text-zinc-500"
                                            )}>
                                                {plan.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {plan.is_best_value && (
                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[7px] font-black uppercase tracking-widest">Best Value</span>
                                            )}
                                            <span className={cn(
                                                "text-xl font-black tracking-tighter",
                                                selectedPlanId === plan.id ? "text-white" : "text-zinc-500"
                                            )}>
                                                ₹{plan.price}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/[0.05] flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!selectedPlanId}
                                    onClick={() => {
                                        const plan = selectedProductForPlan?.plans?.find(p => p.id === selectedPlanId);
                                        if (selectedProductForPlan && plan) {
                                            handleAddToCart(selectedProductForPlan, plan);
                                            navigate('/cart');
                                        }
                                    }}
                                    className={cn(
                                        "flex-grow h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
                                        selectedPlanId
                                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                            : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                                    )}
                                >
                                    Buy Now
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!selectedPlanId}
                                    onClick={() => {
                                        const plan = selectedProductForPlan?.plans?.find(p => p.id === selectedPlanId);
                                        if (selectedProductForPlan && plan) {
                                            handleAddToCart(selectedProductForPlan, plan);
                                            toast({ title: "Cart Updated", description: "Asset secured in cart." });
                                        }
                                    }}
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                                        selectedPlanId
                                            ? "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                                            : "bg-zinc-900 border-transparent text-zinc-800 pointer-events-none"
                                    )}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Mobile Category Slide-up Menu */}
            <AnimatePresence>
                {
                    isCategoryMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCategoryMenuOpen(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 z-[101] p-4 lg:hidden"
                            >
                                <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-t-2xl p-6 shadow-2xl relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <Tag className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Explore Categories</h3>
                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Filter results</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsCategoryMenuOpen(false)}
                                            className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white border border-white/5"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
                                        <button
                                            onClick={() => {
                                                setActiveCategory(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                setIsCategoryMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group border",
                                                !activeCategory
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    : "bg-white/[0.02] border-white/[0.03] text-zinc-500 hover:text-white"
                                            )}
                                        >
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">All Products</span>
                                            {!activeCategory && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                        </button>

                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    scrollToCategory(cat);
                                                    setIsCategoryMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group border",
                                                    activeCategory === cat
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        : "bg-white/[0.02] border-white/[0.03] text-zinc-500 hover:text-white"
                                                )}
                                            >
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">{cat}</span>
                                                {activeCategory === cat && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >
        </StoreLayout >
    );
}