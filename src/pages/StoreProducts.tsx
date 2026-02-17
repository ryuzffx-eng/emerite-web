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
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.05 }}
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
                                                    {/* Card Container */}
                                                    <div className={cn(
                                                        "bg-[#0c0c0c] border border-zinc-900/50 rounded-3xl overflow-hidden transition-all duration-400 h-full flex flex-col",
                                                        (!product.status || product.status === 'Working' || product.status === 'Undetected')
                                                            ? "group-hover:border-zinc-700/80 group-hover:shadow-2xl group-hover:shadow-black/80"
                                                            : "opacity-80"
                                                    )}>

                                                        {/* Image Section */}
                                                        <div className="relative aspect-video overflow-hidden bg-zinc-900 group-image flex-shrink-0">
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
                                                                    {product.image_url ? (
                                                                        <img
                                                                            src={product.image_url}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                                                            <Zap className="w-12 h-12 text-zinc-700" />
                                                                        </div>
                                                                    )}

                                                                    {/* Play Button Overlay */}
                                                                    {product.yt_video_url && (
                                                                        <div
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setPlayingProduct(product.id);
                                                                            }}
                                                                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm"
                                                                        >
                                                                            <motion.div
                                                                                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30"
                                                                                whileHover={{ scale: 1.1 }}
                                                                            >
                                                                                <Play className="w-7 h-7 fill-current ml-0.5" />
                                                                            </motion.div>
                                                                        </div>
                                                                    )}

                                                                    {/* Platform Badge */}
                                                                    <div className="absolute top-4 left-4 z-20">
                                                                        <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white/85 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                                                            {getPlatformIcon(product.platform)}
                                                                            {product.platform}
                                                                        </div>
                                                                    </div>

                                                                    {/* Status Badge */}
                                                                    {product.status && (
                                                                        <div className="absolute top-4 right-4 z-20">
                                                                            <div className={cn(
                                                                                "px-3 py-1.5 rounded-lg backdrop-blur-md border text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg",
                                                                                (product.status === 'Working' || product.status === 'Undetected') ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300" :
                                                                                    product.status === 'Updating' ? "bg-blue-500/25 border-blue-500/40 text-blue-300" :
                                                                                        product.status === 'Maintenance' ? "bg-yellow-500/25 border-yellow-500/40 text-yellow-300" :
                                                                                            product.status === 'Testing' ? "bg-purple-500/25 border-purple-500/40 text-purple-300" :
                                                                                                "bg-red-500/25 border-red-500/40 text-red-300"
                                                                            )}>
                                                                                <div className={cn(
                                                                                    "w-2 h-2 rounded-full animate-pulse",
                                                                                    (product.status === 'Working' || product.status === 'Undetected') ? "bg-emerald-400" :
                                                                                        product.status === 'Updating' ? "bg-blue-400" :
                                                                                            product.status === 'Maintenance' ? "bg-yellow-400" :
                                                                                                product.status === 'Testing' ? "bg-purple-400" :
                                                                                                    "bg-red-400"
                                                                                )} />
                                                                                {product.status === 'Working' ? 'Undetected' : product.status}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Content Section */}
                                                        <div className="p-4 md:p-5 flex flex-col flex-grow">
                                                            <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-tight mb-3 group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2">
                                                                {product.name}
                                                            </h3>

                                                            {/* Spacer */}
                                                            <div className="flex-grow" />

                                                            {/* Price and Buy Button Container */}
                                                            <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800/50">
                                                                {/* Price Display */}
                                                                <div className={cn(
                                                                    "text-lg md:text-xl font-black tracking-tighter",
                                                                    (!product.status || product.status === 'Working' || product.status === 'Undetected') ? "text-white" : "text-zinc-500"
                                                                )}>
                                                                    {getDisplayProductPrice(product)}
                                                                </div>

                                                                {/* Buy Button */}
                                                                <motion.button
                                                                    onClick={(e) => {
                                                                        if (!product.status || product.status === 'Working' || product.status === 'Undetected') {
                                                                            handleBuyClick(e, product);
                                                                        }
                                                                    }}
                                                                    disabled={product.status && product.status !== 'Working' && product.status !== 'Undetected'}
                                                                    whileHover={(!product.status || product.status === 'Working' || product.status === 'Undetected') ? { scale: 1.05 } : {}}
                                                                    whileTap={(!product.status || product.status === 'Working' || product.status === 'Undetected') ? { scale: 0.95 } : {}}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-bold uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 whitespace-nowrap",
                                                                        addedId === product.id
                                                                            ? "bg-emerald-500 text-[#0a0a0a] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                                                            : (!product.status || product.status === 'Working' || product.status === 'Undetected')
                                                                                ? "bg-white text-black hover:bg-zinc-100 shadow-lg hover:shadow-xl"
                                                                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                                                                    )}
                                                                >
                                                                    {addedId === product.id ? (
                                                                        <>
                                                                            <Check className="w-3 h-3 md:w-4 md:h-4" />
                                                                            Added
                                                                        </>
                                                                    ) : (!product.status || product.status === 'Working' || product.status === 'Undetected') ? (
                                                                        <>
                                                                            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                                                                            Buy
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Shield className="w-3 h-3 md:w-4 md:h-4" />
                                                                            {product.status}
                                                                        </>
                                                                    )}
                                                                </motion.button>
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
                    className="max-w-[95vw] md:max-w-4xl bg-[#050505] border border-white/10 p-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/90 focus:outline-none"
                >
                    <div className="flex flex-col md:flex-row h-full max-h-[85vh] md:h-auto overflow-hidden relative">

                        {/* Interactive Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/10 blur-[80px] rounded-full pointer-events-none" />

                        {/* Left Column: Image & visuals (Adjusted width and positioning) */}
                        <div className="w-full md:w-[50%] bg-zinc-950 relative flex flex-col items-center justify-center overflow-hidden border-r border-white/5">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={selectedProductForPlan?.image_url}
                                    alt=""
                                    className="w-full h-full object-cover blur-3xl opacity-50 scale-125"
                                />
                                <div className="absolute inset-0 bg-black/30" />
                            </div>

                            <div className="flex-1 w-full relative z-10 flex flex-col justify-end p-0 md:p-0">
                                <div className="relative group w-full h-full md:h-[60vh] overflow-hidden">
                                    <img
                                        src={selectedProductForPlan?.image_url}
                                        alt={selectedProductForPlan?.name}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />
                                </div>

                                {/* Desktop Features Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 hidden md:flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded bg-black/40 border border-emerald-500/20 backdrop-blur-md flex items-center gap-2 shadow-lg ring-1 ring-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Undetected</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3 font-medium text-shadow-sm opacity-90 max-w-md">
                                        {selectedProductForPlan?.description || "High-performance software designed for competitive advantage."}
                                    </p>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none md:hidden" />
                            </div>
                        </div>

                        {/* Right Column: Interaction (Main content) */}
                        <div className="w-full md:w-[55%] flex flex-col bg-[#050505] relative z-20">
                            {/* Header */}
                            <div className="p-6 md:p-8 pb-0 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 h-5">
                                            {selectedProductForPlan?.category || "Software"}
                                        </Badge>
                                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">•</span>
                                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">v2.4.0</span>
                                    </div>
                                    <button
                                        onClick={() => setIsPlanDialogOpen(false)}
                                        className="hidden md:flex w-8 h-8 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white items-center justify-center hover:bg-zinc-800 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-3">
                                    {selectedProductForPlan?.name}
                                </h2>

                                <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mt-1">
                                    <span className="flex items-center gap-1.5">
                                        {(selectedProductForPlan?.platform || "").toLowerCase().includes('ios') ? (
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                        ) : (selectedProductForPlan?.platform || "").toLowerCase().includes('android') || (selectedProductForPlan?.platform || "").toLowerCase().includes('mobile') ? (
                                            <Smartphone className="w-3.5 h-3.5" />
                                        ) : (
                                            <Monitor className="w-3.5 h-3.5" />
                                        )}
                                        {selectedProductForPlan?.platform || "Windows"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        Secure
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                        Instant
                                    </span>
                                </div>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="p-6 md:p-8 py-6 overflow-y-auto custom-scrollbar flex-grow">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                        Select Plan
                                        <div className="h-px bg-zinc-800 flex-grow" />
                                    </span>

                                    {selectedProductForPlan?.plans?.map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 px-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                                                selectedPlanId === plan.id
                                                    ? "bg-emerald-500/10 border-emerald-500/50"
                                                    : "bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                    selectedPlanId === plan.id
                                                        ? "border-emerald-500 bg-emerald-500"
                                                        : "border-zinc-600 bg-transparent"
                                                )}>
                                                    {selectedPlanId === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider",
                                                    selectedPlanId === plan.id ? "text-white" : "text-zinc-400"
                                                )}>
                                                    {plan.name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 relative z-10">
                                                {plan.is_best_value && (
                                                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                                                        Best Value
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "font-black text-sm tracking-tight",
                                                    selectedPlanId === plan.id ? "text-white" : "text-zinc-300"
                                                )}>
                                                    ₹{plan.price}
                                                </span>
                                            </div>

                                            {selectedPlanId === plan.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 md:p-8 pt-4 bg-[#050505] border-t border-white/5 mt-auto">
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            const plan = selectedProductForPlan?.plans?.find(p => p.id === selectedPlanId);
                                            if (selectedProductForPlan && plan) {
                                                handleAddToCart(selectedProductForPlan, plan);
                                                navigate('/cart');
                                            } else {
                                                toast({
                                                    title: "Selection Required",
                                                    description: "Please choose a plan.",
                                                    variant: "destructive"
                                                });
                                            }
                                        }}
                                        className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                                    >
                                        Buy Now
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const plan = selectedProductForPlan?.plans?.find(p => p.id === selectedPlanId);
                                            if (selectedProductForPlan && plan) {
                                                handleAddToCart(selectedProductForPlan, plan);
                                                toast({ title: "Added", description: "Item added to cart." });
                                            } else {
                                                toast({
                                                    title: "Selection Required",
                                                    description: "Please choose a plan.",
                                                    variant: "destructive"
                                                });
                                            }
                                        }}
                                        className="h-11 px-4 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold rounded-lg transition-all"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Mobile Category Slide-up Menu */}
            <AnimatePresence>
                {isCategoryMenuOpen && (
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
                            <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-t-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
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
                )}
            </AnimatePresence>
        </StoreLayout >
    );
}