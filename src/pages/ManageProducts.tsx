import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit3, Image as ImageIcon, Tag, Package, RefreshCw, Search, Video, Shield, ExternalLink, Globe, IndianRupee, DollarSign, Monitor, Smartphone, MessageSquare, AlertCircle, FileText, Zap, History, Key, Copy, PlusCircle, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct, apiRequest, createStoreUpdate, getStoreUpdates, deleteStoreUpdate, clearStoreUpdates, createLicenses, getSubscriptionPlans } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { formatIST } from "@/lib/utils";

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
    status?: string;
    is_active: boolean;
    plans?: { id?: number; name: string; price: number }[];
}

interface App {
    id: number;
    name: string;
}

export default function ManageProducts() {
    const { regions } = useMarket();
    const [products, setProducts] = useState<Product[]>([]);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
    const [statusUpdateTarget, setStatusUpdateTarget] = useState<number | null>(null);
    const [logsDialogOpen, setLogsDialogOpen] = useState(false);
    const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

    const { toast } = useToast();

    const [statusUpdateForm, setStatusUpdateForm] = useState({
        title: "",
        content: "",
        type: "update", // update, maintenance, feature, alert
    });

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        details: "",
        image_url: "",
        yt_video_url: "",
        category: "General",
        platform: "Windows",
        status: "Undetected",
        app_id: "" as string | number,
        plans: [] as { id?: number; name: string; price: string; duration_days: string; is_lifetime: boolean; subscription_plan_id?: string | number; is_best_value: boolean }[]
    });

    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
    const [regionPrice, setRegionPrice] = useState("");
    const [logFilter, setLogFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsData, appsData, plansData] = await Promise.all([
                getStoreProducts(),
                apiRequest('/admin/apps/'),
                getSubscriptionPlans(),
            ]);
            setProducts(productsData || []);
            setApps(appsData || []);
            setSubscriptionPlans(plansData || []);
        } catch (error: any) {
            toast({ title: "Fetch Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.platform.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async () => {
        // Validation
        if (!formData.name || !formData.price) {
            toast({ title: "Incomplete Data", description: "Name and price are required core metrics.", variant: "destructive" });
            return;
        }

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                app_id: formData.app_id ? Number(formData.app_id) : null,
                plans: formData.plans.map(p => ({
                    ...p,
                    price: parseFloat(p.price),
                    duration_days: p.duration_days ? parseInt(p.duration_days) : null,
                    subscription_plan_id: p.subscription_plan_id ? Number(p.subscription_plan_id) : null,
                    is_best_value: !!p.is_best_value
                }))
            };

            if (editingProduct) {
                await updateStoreProduct(editingProduct.id, payload);
                toast({ title: "Node Synchronized", description: `${formData.name} configuration updated successfully.` });
            } else {
                await createStoreProduct(payload);
                toast({ title: "Asset Initialized", description: `${formData.name} has been added to the repository.` });
            }
            setDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleSetRegionPrice = async () => {
        // ... previous regional price logic
    };

    const handleCreateStatusUpdate = async () => {
        if (!statusUpdateForm.title || !statusUpdateForm.content) {
            toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
            return;
        }

        try {
            await createStoreUpdate({
                ...statusUpdateForm,
                product_id: statusUpdateTarget || undefined
            });
            toast({ title: "Broadcasted", description: "Status update published successfully" });
            setStatusUpdateOpen(false);
            setStatusUpdateForm({ title: "", content: "", type: "update" });
            setStatusUpdateTarget(null);
            fetchMaintenanceLogs();
        } catch (error: any) {
            toast({ title: "Broadcast Failed", description: error.message, variant: "destructive" });
        }
    };

    const fetchMaintenanceLogs = async () => {
        try {
            const data = await getStoreUpdates();
            setMaintenanceLogs(data || []);
        } catch (error: any) {
            toast({ title: "Fetch Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleDeleteLog = async (id: number) => {
        try {
            await deleteStoreUpdate(id);
            toast({ title: "Deleted", description: "Log entry removed" });
            fetchMaintenanceLogs();
        } catch (error: any) {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleClearLogs = async () => {
        try {
            await clearStoreUpdates();
            toast({ title: "Cleared", description: "All maintenance logs removed" });
            fetchMaintenanceLogs();
        } catch (error: any) {
            toast({ title: "Clear Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteStoreProduct(id);
            toast({ title: "Deleted", description: "Product removed" });
            fetchData();
        } catch (error: any) {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            price: "",
            description: "",
            details: "",
            image_url: "",
            yt_video_url: "",
            category: "General",
            platform: "Windows",
            status: "Undetected",
            app_id: "",
            plans: []
        });
        setEditingProduct(null);
        setSelectedRegionId(null);
        setRegionPrice("");
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description || "",
            details: product.details || "",
            image_url: product.image_url || "",
            yt_video_url: product.yt_video_url || "",
            category: product.category || "General",
            platform: product.platform || "Windows",
            status: product.status === "Working" ? "Undetected" : (product.status || "Undetected"),
            app_id: product.app_id || "",
            plans: product.plans ? product.plans.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price.toString(),
                duration_days: p.duration_days?.toString() || "",
                is_lifetime: !!p.is_lifetime,
                subscription_plan_id: p.subscription_plan_id || "",
                is_best_value: !!p.is_best_value
            })) : []
        });
        setDialogOpen(true);
    };

    const openStatusLog = (productId: number | null) => {
        setStatusUpdateTarget(productId);
        setStatusUpdateOpen(true);
    };

    return (
        <DashboardLayout title="Store Management" subtitle="Configure marketplace storefront and assets">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight uppercase">Registry Authority</h2>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Shield className="h-3 w-3 text-emerald-500/50" />
                                {products.length} Products in Repository
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                    {/* Integrated Search Console */}
                    <div className="flex-1 relative group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products in repository..."
                            className="w-full bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/50 h-12 pl-12 rounded-xl backdrop-blur-md transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Master Action Nexus */}
                    <div className="flex items-center bg-zinc-900/40 border border-zinc-800 rounded-xl h-12 px-1 backdrop-blur-md">
                        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setEditingProduct(null);
                                        setDialogOpen(true);
                                    }}
                                    className="p-2.5 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                    title="Add Product"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] bg-zinc-950 border-zinc-800 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden rounded-2xl flex flex-col max-h-[85vh]">
                                <div className="bg-gradient-to-br from-zinc-900 to-black p-6 border-b border-zinc-800/50 relative shrink-0">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                        <Package className="h-24 w-24 -mr-6 -mt-6 text-white rotate-12" />
                                    </div>
                                    <DialogTitle className="text-2xl text-white uppercase font-black tracking-tight">{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
                                    <DialogDescription className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">Configure marketplace parameters</DialogDescription>
                                </div>

                                <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
                                    <div className="px-6 py-4 border-b border-zinc-800/50 bg-black/20 shrink-0">
                                        <TabsList className="bg-zinc-900/60 p-1 w-full h-auto grid grid-cols-3 gap-1 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                                            <TabsTrigger
                                                value="details"
                                                className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950 data-[state=active]:shadow-lg shadow-emerald-500/20 transition-all hover:text-zinc-300 data-[state=active]:hover:text-zinc-950"
                                            >
                                                Details
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="pricing"
                                                className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950 data-[state=active]:shadow-lg shadow-emerald-500/20 transition-all hover:text-zinc-300 data-[state=active]:hover:text-zinc-950"
                                            >
                                                Plans & Pricing
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="media"
                                                className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950 data-[state=active]:shadow-lg shadow-emerald-500/20 transition-all hover:text-zinc-300 data-[state=active]:hover:text-zinc-950"
                                            >
                                                Media & Meta
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                        <TabsContent value="details" className="m-0 space-y-6 focus-visible:outline-none">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Product Name</Label>
                                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 focus:ring-emerald-500/20" placeholder="e.g. Aimbot Pro" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Linked App</Label>
                                                    <select
                                                        value={formData.app_id}
                                                        onChange={e => setFormData({ ...formData, app_id: e.target.value })}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 h-11 px-4 text-sm text-white rounded-md appearance-none focus:ring-emerald-500/20 outline-none transition-all"
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Application</option>
                                                        {apps.map(app => (
                                                            <option key={app.id} value={app.id} className="bg-zinc-950">{app.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</Label>
                                                    <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 focus:ring-emerald-500/20" placeholder="e.g. Utility" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Platform</Label>
                                                    <select
                                                        value={formData.platform}
                                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 h-11 px-4 text-sm text-white rounded-md appearance-none focus:ring-emerald-500/20 outline-none transition-all"
                                                    >
                                                        <option value="Windows">Windows</option>
                                                        <option value="Android">Android</option>
                                                        <option value="iOS">iOS</option>
                                                        <option value="macOS">macOS</option>
                                                        <option value="Linux">Linux</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Status</Label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 h-11 px-4 text-sm text-white rounded-md appearance-none focus:ring-emerald-500/20 outline-none transition-all"
                                                    >
                                                        <option value="Undetected">Undetected</option>
                                                        <option value="Running">Running</option>
                                                        <option value="Updating">Updating</option>
                                                        <option value="Maintenance">Maintenance</option>
                                                        <option value="Testing">Testing</option>
                                                        <option value="Risk">Risk</option>
                                                        <option value="Detected">Detected</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Short Description</Label>
                                                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 focus:ring-emerald-500/20" placeholder="Brief tagline or summary" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Documentation</Label>
                                                <Textarea value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="bg-zinc-900/50 border-zinc-800 min-h-[200px] focus:ring-emerald-500/20 resize-none font-mono text-xs" placeholder="Markdown supported details..." />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="pricing" className="m-0 space-y-8 focus-visible:outline-none">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="flex-1 space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Base Price (INR)</Label>
                                                        <div className="relative group">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">₹</span>
                                                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 pl-8 focus:ring-emerald-500/20 font-mono text-lg font-bold" placeholder="0.00" />
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500">Global baseline currency value.</p>
                                                    </div>

                                                    {formData.app_id && (
                                                        <div className="space-y-2 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                            <Label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Zap className="h-3 w-3" /> Global Plan Binding
                                                            </Label>
                                                            <select
                                                                className="w-full bg-black/40 border border-emerald-500/20 h-10 px-3 text-sm text-emerald-400 rounded-lg appearance-none focus:ring-emerald-500/20 outline-none transition-all font-bold mt-2"
                                                                onChange={e => {
                                                                    const subId = e.target.value;
                                                                    const newPlans = formData.plans.map(p => ({ ...p, subscription_plan_id: subId }));
                                                                    setFormData({ ...formData, plans: newPlans });
                                                                    toast({ title: "Plans Updated", description: "All plans linked to selected protocol.", duration: 2000 });
                                                                }}
                                                            >
                                                                <option value="" className="bg-zinc-950">Select Global Protocol...</option>
                                                                {subscriptionPlans
                                                                    .filter(sp => sp.app_id === Number(formData.app_id))
                                                                    .map(sp => (
                                                                        <option key={sp.id} value={sp.id} className="bg-zinc-950 text-white">{sp.name} [Level {sp.level}]</option>
                                                                    ))}
                                                            </select>
                                                            <p className="text-[10px] text-zinc-500 pt-1">Instantly links all plans below to this protocol.</p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4 pt-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Globe className="h-4 w-4 text-zinc-400" />
                                                                <h4 className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">Regional Pricing</h4>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            {regions.map(r => (
                                                                <div
                                                                    key={r.id}
                                                                    onClick={() => setSelectedRegionId(r.id)}
                                                                    className={cn(
                                                                        "cursor-pointer p-2 rounded-lg border flex items-center gap-2 transition-all",
                                                                        selectedRegionId === r.id
                                                                            ? "bg-emerald-500/10 border-emerald-500/40"
                                                                            : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                                                                    )}
                                                                >
                                                                    <div className="w-5 h-3 rounded-[1px] overflow-hidden opacity-80">
                                                                        <img
                                                                            src={`https://flagcdn.com/${(r.flag_code || "IN").toLowerCase()}.svg`}
                                                                            alt={r.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://flagcdn.com/un.svg'; }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={cn("text-[9px] font-black uppercase tracking-wider", selectedRegionId === r.id ? "text-emerald-400" : "text-zinc-500")}>
                                                                            {r.currency_code}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="flex gap-2 items-center mt-2">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">
                                                                    {selectedRegionId ? regions.find(r => r.id === selectedRegionId)?.currency_symbol : '$'}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    disabled={!selectedRegionId}
                                                                    value={regionPrice}
                                                                    onChange={e => setRegionPrice(e.target.value)}
                                                                    className="bg-black/20 border-zinc-800 h-10 pl-8 text-sm font-mono"
                                                                    placeholder={!selectedRegionId ? "Select region above" : "0.00"}
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={handleSetRegionPrice}
                                                                disabled={!selectedRegionId || !editingProduct}
                                                                size="sm"
                                                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-10 px-4"
                                                            >
                                                                Set Price
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-[1.5] space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Tag className="h-3 w-3" /> Subscription Plans
                                                        </Label>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            type="button"
                                                            onClick={() => {
                                                                const lastSubId = formData.plans.length > 0 ? formData.plans[formData.plans.length - 1].subscription_plan_id : "";
                                                                setFormData({ ...formData, plans: [...formData.plans, { name: "", price: "", duration_days: "30", is_lifetime: false, subscription_plan_id: lastSubId, is_best_value: false }] });
                                                            }}
                                                            className="h-7 text-[9px] font-bold uppercase tracking-widest border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Add Plan
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {formData.plans.length === 0 ? (
                                                            <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center">
                                                                <p className="text-zinc-500 text-xs">No plans configured.</p>
                                                            </div>
                                                        ) : (
                                                            formData.plans.map((plan: any, index) => (
                                                                <div key={index} className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl space-y-3 relative group hover:border-zinc-700 transition-all">
                                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md"
                                                                            onClick={() => {
                                                                                const newPlans = formData.plans.filter((_, i) => i !== index);
                                                                                setFormData({ ...formData, plans: newPlans });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="flex gap-3">
                                                                        <div className="flex-1 space-y-1">
                                                                            <Label className="text-[9px] text-zinc-600 uppercase tracking-wider">Plan Name</Label>
                                                                            <Input
                                                                                placeholder="e.g. 1 Month"
                                                                                className="bg-black/20 border-zinc-800 h-8 text-xs focus:ring-emerald-500/20"
                                                                                value={plan.name}
                                                                                onChange={e => {
                                                                                    const newPlans = [...formData.plans];
                                                                                    newPlans[index].name = e.target.value;
                                                                                    setFormData({ ...formData, plans: newPlans });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="w-24 space-y-1">
                                                                            <Label className="text-[9px] text-zinc-600 uppercase tracking-wider">Price</Label>
                                                                            <div className="relative">
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-[10px]">₹</span>
                                                                                <Input
                                                                                    type="number"
                                                                                    className="bg-black/20 border-zinc-800 h-8 pl-5 text-xs font-mono"
                                                                                    value={plan.price}
                                                                                    onChange={e => {
                                                                                        const newPlans = [...formData.plans];
                                                                                        newPlans[index].price = e.target.value;
                                                                                        setFormData({ ...formData, plans: newPlans });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3">
                                                                        <div className="w-24 space-y-1">
                                                                            <Label className="text-[9px] text-zinc-600 uppercase tracking-wider">Days</Label>
                                                                            <Input
                                                                                type="number"
                                                                                disabled={plan.is_lifetime}
                                                                                className="bg-black/20 border-zinc-800 h-8 text-xs font-mono text-center disabled:opacity-50"
                                                                                value={plan.duration_days || ""}
                                                                                onChange={e => {
                                                                                    const newPlans = [...formData.plans];
                                                                                    newPlans[index].duration_days = e.target.value;
                                                                                    setFormData({ ...formData, plans: newPlans });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 space-y-1">
                                                                            <Label className="text-[9px] text-zinc-600 uppercase tracking-wider">Linked Protocol</Label>
                                                                            <select
                                                                                className="w-full bg-black/20 border border-zinc-800 h-8 text-[11px] rounded px-2 text-zinc-300 outline-none focus:ring-emerald-500/20 focus:border-emerald-500/30 block"
                                                                                value={plan.subscription_plan_id || ""}
                                                                                onChange={e => {
                                                                                    const newPlans = [...formData.plans];
                                                                                    newPlans[index].subscription_plan_id = e.target.value;
                                                                                    setFormData({ ...formData, plans: newPlans });
                                                                                }}
                                                                            >
                                                                                <option value="">None</option>
                                                                                {subscriptionPlans
                                                                                    .filter(sp => !formData.app_id || sp.app_id === Number(formData.app_id))
                                                                                    .map(sp => (
                                                                                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                                                                                    ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 pt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`lifetime-${index}`}
                                                                            className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
                                                                            checked={plan.is_lifetime}
                                                                            onChange={e => {
                                                                                const newPlans = [...formData.plans];
                                                                                newPlans[index].is_lifetime = e.target.checked;
                                                                                if (e.target.checked) newPlans[index].duration_days = "";
                                                                                setFormData({ ...formData, plans: newPlans });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`lifetime-${index}`} className="text-[10px] font-bold text-zinc-400 cursor-pointer select-none">Lifetime Access (No Expiry)</Label>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 pt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`bestvalue-${index}`}
                                                                            className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500/20 focus:ring-offset-0"
                                                                            checked={plan.is_best_value}
                                                                            onChange={e => {
                                                                                const newPlans = formData.plans.map((p, i) => ({
                                                                                    ...p,
                                                                                    is_best_value: i === index ? e.target.checked : (e.target.checked ? false : p.is_best_value)
                                                                                }));
                                                                                setFormData({ ...formData, plans: newPlans });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`bestvalue-${index}`} className="text-[10px] font-bold text-zinc-400 cursor-pointer select-none">Best Value Badge</Label>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="media" className="m-0 space-y-6 focus-visible:outline-none">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Card Image URL</Label>
                                                        <div className="relative">
                                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                                            <Input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 pl-10 focus:ring-emerald-500/20" placeholder="https://..." />
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500">Displayed on the store grid.</p>
                                                    </div>

                                                    <div className="aspect-video bg-black/40 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                                                        {formData.image_url ? (
                                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        ) : (
                                                            <div className="text-zinc-700 flex flex-col items-center">
                                                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                                                <span className="text-[10px] uppercase font-bold tracking-widest">No Image Preview</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">YouTube Video URL</Label>
                                                        <div className="relative">
                                                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                                            <Input value={formData.yt_video_url} onChange={e => setFormData({ ...formData, yt_video_url: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-11 pl-10 focus:ring-emerald-500/20" placeholder="https://youtube.com/..." />
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500">Embedded on the product details page.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                <div className="p-6 bg-zinc-900/30 border-t border-zinc-800/50 shrink-0">
                                    <Button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase text-xs tracking-[0.2em] h-14 shadow-xl shadow-emerald-500/10 active:scale-[0.98] transition-all rounded-xl">
                                        {editingProduct ? "Update Product" : "Create Product"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="w-[1px] h-6 bg-zinc-800/50 mx-1" />

                        <button
                            onClick={() => {
                                fetchMaintenanceLogs();
                                setLogsDialogOpen(true);
                            }}
                            className="p-2.5 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all"
                            title="Manage Logs"
                        >
                            <History className="h-5 w-5" />
                        </button>

                        <div className="w-[1px] h-6 bg-zinc-800/50 mx-1" />

                        <button
                            onClick={() => openStatusLog(null)}
                            className="p-2.5 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Global Broadcast"
                        >
                            <MessageSquare className="h-5 w-5" />
                        </button>

                        <div className="w-[1px] h-6 bg-zinc-800/50 mx-1" />

                        <Link
                            to="/products"
                            target="_blank"
                            className="p-2.5 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="View Customer Store"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </Link>

                        <div className="w-[1px] h-6 bg-zinc-800/50 mx-1" />

                        <button
                            onClick={fetchData}
                            className="p-2.5 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Status Update Dialog */}
                <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden rounded-2xl">
                        <div className="bg-gradient-to-br from-zinc-900 to-black p-6 border-b border-zinc-800/50 relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <MessageSquare className="h-20 w-20 text-emerald-500" />
                            </div>
                            <DialogTitle className="text-xl text-white uppercase font-black tracking-tight">Broadcast Protocol</DialogTitle>
                            <DialogDescription className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                                {statusUpdateTarget ? `Publish update for ${products.find(p => p.id === statusUpdateTarget)?.name}` : "Publish global system broadcast"}
                            </DialogDescription>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Update Vector (Type)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'update', label: 'Update', icon: RefreshCw, color: 'text-blue-500' },
                                        { id: 'maintenance', label: 'Maintenance', icon: RefreshCw, color: 'text-yellow-500' },
                                        { id: 'feature', label: 'Feature', icon: Zap, color: 'text-emerald-500' },
                                        { id: 'alert', label: 'Alert', icon: AlertCircle, color: 'text-red-500' }
                                    ].map(t => (
                                        <Button
                                            key={t.id}
                                            onClick={() => setStatusUpdateForm({ ...statusUpdateForm, type: t.id })}
                                            variant="outline"
                                            className={cn(
                                                "h-10 px-4 text-[10px] font-black uppercase tracking-widest border-zinc-800 rounded-xl transition-all",
                                                statusUpdateForm.type === t.id ? "bg-white/10 border-white/20 text-white" : "bg-black/20 hover:bg-white/5 text-zinc-500"
                                            )}
                                        >
                                            <t.icon className={cn("h-3.5 w-3.5 mr-2", statusUpdateForm.type === t.id ? t.color : "text-zinc-700")} />
                                            {t.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Header (Title)</Label>
                                <Input
                                    value={statusUpdateForm.title}
                                    onChange={e => setStatusUpdateForm({ ...statusUpdateForm, title: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-800 h-11 focus:ring-emerald-500/20"
                                    placeholder="Brief summary of update"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Transmission Data (Content)</Label>
                                <Textarea
                                    value={statusUpdateForm.content}
                                    onChange={e => setStatusUpdateForm({ ...statusUpdateForm, content: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-800 min-h-[120px] focus:ring-emerald-500/20 resize-none"
                                    placeholder="Detailed technical notes..."
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-900/30 border-t border-zinc-800/50">
                            <Button onClick={handleCreateStatusUpdate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase text-xs tracking-widest h-12 shadow-xl shadow-emerald-500/10 active:scale-95 transition-all rounded-xl">
                                Initiate Broadcast
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Maintenance Logs Management Dialog */}
                <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
                    <DialogContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="sm:max-w-[700px] bg-[#0a0a0a] border-zinc-900 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden rounded-2xl"
                    >
                        <div className="bg-gradient-to-br from-zinc-900/50 to-black p-8 border-b border-zinc-900/50 relative">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                <History className="h-32 w-32 text-emerald-500" />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <History className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] px-2">Log Authority</Badge>
                                    </div>
                                    <DialogTitle className="text-3xl text-white uppercase font-black tracking-tighter">Maintenance Repository</DialogTitle>
                                    <DialogDescription className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">Review and manage protocol synchronization history</DialogDescription>
                                </div>
                                <Button
                                    onClick={handleClearLogs}
                                    variant="outline"
                                    className="bg-red-500/5 hover:bg-red-500 border-red-500/20 hover:border-red-500 text-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-xl transition-all shadow-lg shadow-red-500/5 active:scale-95 focus:ring-0 focus-visible:ring-0 outline-none"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Clear History
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                {['all', 'update', 'maintenance', 'feature', 'alert'].map((type) => (
                                    <Button
                                        key={type}
                                        onClick={() => setLogFilter(type)}
                                        variant="outline"
                                        className={cn(
                                            "h-8 px-3 text-[9px] font-black uppercase tracking-widest border-zinc-800 rounded-lg transition-all",
                                            logFilter === type
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                : "bg-black/20 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        {type === 'all' ? 'All Logs' : type}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                            {maintenanceLogs.filter(log => logFilter === 'all' || log.type === logFilter).length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-900 rounded-xl text-center">
                                    <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">No logs found in repository</p>
                                </div>
                            ) : (
                                maintenanceLogs.filter(log => logFilter === 'all' || log.type === logFilter).map((log) => (
                                    <div key={log.id} className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl group hover:border-zinc-700 transition-all flex items-start gap-4">
                                        <div className="flex-shrink-0 pt-1">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                log.type === 'alert' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                                                    log.type === 'maintenance' ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" :
                                                        log.type === 'feature' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                                                            "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-zinc-800 text-zinc-400 text-[8px] font-black tracking-widest uppercase border-0">{log.type}</Badge>
                                                {log.product_id && (
                                                    <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">
                                                        {products.find(p => p.id === log.product_id)?.name || "Asset"}
                                                    </span>
                                                )}
                                                <span className="text-[9px] font-mono text-zinc-600 ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <h5 className="text-white font-bold text-xs uppercase tracking-tight mb-1">{log.title}</h5>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{log.content}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleDeleteLog(log.id)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(p => (
                                <Card key={p.id} className="bg-zinc-900/20 border-zinc-800/80 group hover:border-emerald-500/40 transition-all overflow-hidden backdrop-blur-sm">
                                    <div className="h-48 bg-zinc-950 flex items-center justify-center relative overflow-hidden border-b border-zinc-800/50">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <ImageIcon className="h-12 w-12 text-zinc-800" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                        <div className="absolute top-3 right-3 flex gap-2 translate-y-2 md:translate-y-2 group-hover:translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
                                            <Button onClick={() => openStatusLog(p.id)} size="icon" variant="secondary" title="Maintain Log" className="h-9 w-9 bg-black/60 border border-zinc-800 backdrop-blur-md hover:bg-blue-500 hover:text-black hover:border-blue-400 transition-all rounded-xl">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => openEdit(p)} size="icon" variant="secondary" className="h-9 w-9 bg-black/60 border border-zinc-800 backdrop-blur-md hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all rounded-xl">
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleDelete(p.id)} size="icon" variant="destructive" className="h-9 w-9 bg-red-950/40 border border-red-900/20 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all rounded-xl">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {p.yt_video_url && (
                                            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Badge className="bg-red-600/10 text-red-500 border-red-500/20 flex items-center gap-1.5 px-2 py-1 rounded-lg">
                                                    <Video className="h-3 w-3" />
                                                    <span className="text-[9px] font-black tracking-widest uppercase">Intel Linked</span>
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-1.5 flex items-center gap-1.5">
                                                    {p.platform?.toLowerCase().includes('windows') ? <Monitor className="w-3 h-3" /> : (p.platform?.toLowerCase().includes('android') || p.platform?.toLowerCase().includes('ios') ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />)}
                                                    {p.category || "Protocol"} • {p.platform}
                                                </p>
                                                <CardTitle className="text-xl font-black text-white uppercase tracking-tight truncate">{p.name}</CardTitle>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Base Price</p>
                                                <p className="text-xl font-black text-white tracking-tighter">₹{p.price}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-2 h-8 leading-relaxed mb-4">{p.description}</p>

                                        <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                                            <div className="flex items-center gap-1.5 text-zinc-600">
                                                <Shield className="h-3 w-3" />
                                                <span className="text-[9px] font-bold uppercase">Locked Entry</span>
                                            </div>
                                            <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                            <div className={cn(
                                                "flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest",
                                                (p.status === 'Working' || p.status === 'Undetected' || p.status === 'Running') ? "text-emerald-500/60" :
                                                    p.status === 'Updating' ? "text-blue-500/60" :
                                                        p.status === 'Maintenance' ? "text-yellow-500/60" :
                                                            p.status === 'Testing' ? "text-purple-500/60" :
                                                                p.status === 'Risk' ? "text-orange-500/60" :
                                                                    "text-red-500/60"
                                            )}>
                                                Status: {p.status === 'Working' ? 'Undetected' : (p.status || "Unknown")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {products.length === 0 && (
                            <div className="col-span-full py-32 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                                <Package className="h-16 w-16 mb-4 opacity-10 relative z-10" />
                                <p className="font-black uppercase tracking-[0.4em] text-[10px] relative z-10">Data Repository Empty</p>
                                <p className="text-[9px] font-bold text-zinc-700 uppercase mt-2 relative z-10">Awaiting asset initialization</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </DashboardLayout >
    );
}
