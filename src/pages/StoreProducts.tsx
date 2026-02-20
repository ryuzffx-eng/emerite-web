import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Zap,
    Search,
    ShoppingCart,
    Check,
    Monitor,
    ChevronRight,
    ShieldCheck,
    X,
    Tag
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
import { StoreProductCard } from "@/components/store/StoreProductCard";

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
    const [playingProduct, setPlayingProduct] = useState<number | null>(null);
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


    const handleBuyClick = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
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

    return (
        <StoreLayout hideFooter={true}>
            <div className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto relative">
                    {/* Header stripped as requested previously */}

                    {/* Decorative Aurora Glow */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[300px] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-20 relative z-10">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <div key={category} id={`category-${category}`} className="space-y-8 scroll-mt-32">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                                <h3 className="text-base font-black text-white uppercase tracking-[0.3em]">
                                                    {category}
                                                </h3>
                                            </div>
                                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {productsByCategory[category].map((product, i) => (
                                                <StoreProductCard
                                                    key={product.id}
                                                    product={product}
                                                    index={i}
                                                    onBuy={handleBuyClick}
                                                    playingProduct={playingProduct}
                                                    setPlayingProduct={setPlayingProduct}
                                                    addedId={addedId}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01] backdrop-blur-xl">
                                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                        <Search className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-white font-black uppercase tracking-widest mb-2">No Signal Detected</h3>
                                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Adjust parameters and try again</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

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
                                <div className="bg-black/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
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
