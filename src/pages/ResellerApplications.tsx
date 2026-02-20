import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingSkeletons } from "@/components/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { resellerGetApps } from "@/lib/api";
import {
  AppWindow,
  Search,
  RefreshCw,
  Box,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  Shield,
  Info,
  RotateCcw,
  FileText,
  Code,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description?: string;
  version: string;
  status?: "active" | "inactive" | "maintenance";
  created_at: string;
  licenses_count?: number;
  secret?: string;
}

export default function ResellerApplications() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      if (products.length > 0) setIsRefreshing(true);
      const data = await resellerGetApps();
      setProducts(data || []);
    } catch (err: any) {
      toast({
        title: "Connection Error",
        description: "Failed to retrieve products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, products.length]);

  const handleRefresh = async () => {
    await fetchProducts();
    toast({
      title: "Refreshed",
      description: "Product list synchronized",
    });
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 45000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.version.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Products">
        <LoadingSkeletons count={6} variant="card" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Products"
      subtitle="Browse and manage your available software products"
    >
      <div className="space-y-8 transition-all duration-300">
        <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5 transition-transform hover:rotate-12">
                <Box className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Product List</p>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  {products.length} Available Products
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </h2>
              </div>
            </div>


          </div>

          {/* Integrated Search Tools */}

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Products", value: products.length, icon: Box, color: "emerald", delay: '0ms' },
            { label: "Active Products", value: products.length, icon: CheckCircle, color: "emerald", delay: '75ms' },
            { label: "Secure", value: products.filter(p => p.status === 'active').length || products.length, icon: Shield, color: "blue", delay: '150ms' },
            { label: "Last Updated", value: formatDate(products[0]?.created_at || new Date().toISOString()).split(" ")[0], icon: Calendar, color: "zinc", delay: '225ms' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-black/40 border border-white/5 p-5 sm:p-6 rounded-lg backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 shadow-xl shadow-black/20 group"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
                  stat.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/10 group-hover:border-emerald-500/30" :
                    stat.color === "blue" ? "bg-blue-500/5 border-blue-500/10 group-hover:border-blue-500/30" :
                      "bg-zinc-500/5 border-zinc-500/10 group-hover:border-zinc-500/30"
                )}>
                  <stat.icon className={cn("h-4 w-4", stat.color === "emerald" ? "text-emerald-500" : stat.color === "blue" ? "text-blue-500" : "text-zinc-500")} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase">{stat.value}</p>
              <div className="mt-4 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5">
                <div
                  className={cn("h-full rounded-full opacity-60 shadow-[0_0_8px]",
                    stat.color === "emerald" ? "bg-emerald-500 shadow-emerald-500/50" :
                      stat.color === "blue" ? "bg-blue-500 shadow-blue-500/50" :
                        "bg-zinc-500 shadow-zinc-500/50"
                  )}
                  style={{ width: '70%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-black/40 border-white/5 h-10 md:h-12 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 rounded-xl transition-all hover:bg-black/60 focus:bg-black/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto md:overflow-visible shadow-lg shadow-black/20 backdrop-blur-md">
            {/* View Mode */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn("h-8 w-8 rounded-md transition-all", viewMode === "grid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white")}
              >
                <AppWindow className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn("h-8 w-8 rounded-md transition-all", viewMode === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white")}
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-zinc-800/80 mx-1" />

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 md:h-10 w-9 md:w-10 hover:bg-zinc-800/50 flex-shrink-0 text-zinc-500 transition-all active:scale-95 group"
            >
              <RefreshCw className={cn("h-4.25 w-4.25 group-hover:text-emerald-500 transition-colors", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>


        {/* Applications Grid/List */}
        {filteredProducts.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((app) => (
                <div
                  key={app.id}
                  className="group relative bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 hover:border-emerald-500/40 p-5 sm:p-6 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/5 overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative space-y-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:border-emerald-500/30 transition-colors">
                        <Box className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">V{app.version}</Badge>
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">ID #{app.id}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-black text-xl text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight leading-none">
                        {app.name}
                      </h3>
                      {app.description && (
                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed line-clamp-2">
                          {app.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/50 mt-auto">
                      <Button
                        onClick={() => navigate("/reseller/licenses")}
                        className="flex-1 h-11 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all duration-300"
                      >
                        MANAGE KEYS
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedProduct(app);
                          setInfoDialogOpen(true);
                        }}
                        size="icon"
                        className="h-11 w-11 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 border-0 shrink-0 transition-all active:scale-95"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Version</div>
                <div className="col-span-2">ID</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {filteredProducts.map((app) => (
                <div
                  key={app.id}
                  className="group bg-black/40 rounded-lg border border-white/5 hover:border-emerald-500/50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5 backdrop-blur-md"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-4">
                      <p className="font-semibold text-sm md:text-base text-white group-hover:text-emerald-400 transition-colors">
                        {app.name}
                      </p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-xs md:text-sm text-zinc-500">
                        v{app.version}
                      </p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <code className="text-xs font-mono text-zinc-600">
                        #{app.id}
                      </code>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400">
                        Active
                      </Badge>
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                      <Button
                        onClick={() => {
                          setSelectedProduct(app);
                          setInfoDialogOpen(true);
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => navigate("/reseller/licenses")}
                        size="sm"
                        className="h-8 bg-zinc-800 hover:bg-emerald-500 text-white hover:text-black font-medium text-xs border border-zinc-700 hover:border-emerald-500 transition-all"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="col-span-full">
            <div className="bg-black/40 rounded-xl border border-dashed border-white/5 p-12 text-center backdrop-blur-md">
              <div className="p-4 rounded-full bg-zinc-900/50 w-fit mx-auto mb-4 border border-zinc-800">
                <AppWindow className="h-12 w-12 text-zinc-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">No applications found</h3>
              <p className="text-zinc-500">Try adjusting your search criteria</p>
            </div>
          </div>
        )}

        {/* Documentation Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
          <DialogContent className="border-white/10 bg-black/90 backdrop-blur-3xl sm:max-w-3xl rounded-xl p-0 overflow-hidden shadow-2xl">
            <div className="relative">
              {/* Tactical Header */}
              <div className="relative p-6 sm:p-10 bg-gradient-to-br from-zinc-900 to-black border-b border-zinc-800/50 overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Box className="h-48 w-48 -mr-16 -mt-16 text-white" />
                </div>

                <div className="relative z-10 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                    <Box className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none">
                      {selectedProduct?.name}
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className="bg-emerald-500 text-black font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider">V{selectedProduct?.version}</Badge>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-3 py-1 bg-black/40 border border-white/5 rounded-lg">ID #{selectedProduct?.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <Tabs defaultValue="deployment" className="w-full relative z-10">
                  <TabsList className="grid grid-cols-3 bg-black/40 p-1.5 rounded-xl border border-white/5 mb-8 h-14">
                    <TabsTrigger value="deployment" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-500 data-[state=active]:shadow-lg rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Instructions</TabsTrigger>
                    <TabsTrigger value="generation" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-500 data-[state=active]:shadow-lg rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Creation</TabsTrigger>
                    <TabsTrigger value="info" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-500 data-[state=active]:shadow-lg rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Info</TabsTrigger>
                  </TabsList>

                  <div className="min-h-[250px]">
                    <TabsContent value="deployment" className="m-0 focus-visible:outline-none">
                      <DocSection
                        title="Instructions"
                        steps={[
                          "Generate unique license key for customer",
                          "Send key to customer",
                          "Customer enters key in software",
                          "Product activates instantly"
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="generation" className="m-0 focus-visible:outline-none">
                      <DocSection
                        title="License Creation"
                        steps={[
                          "Go to Licenses page",
                          "Click 'Create Licenses' button",
                          "Select product and plan",
                          "Confirm creation"
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="info" className="m-0 focus-visible:outline-none">
                      <div className="grid gap-4">
                        <DocCard icon={Search} title="Live Monitoring" desc="Monitor active user connections" />
                        <DocCard icon={RotateCcw} title="HWID Reset" desc="Reset hardware ID for user maintenance" />
                        <DocCard icon={FileText} title="Export Data" desc="Export license data to CSV/Text" />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="mt-10 flex gap-4 relative z-10">
                  <Button
                    onClick={() => {
                      navigate("/reseller/licenses");
                      setInfoDialogOpen(false);
                    }}
                    className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-emerald-500/10 transition-all active:scale-95 border-0"
                  >
                    Manage Licenses
                  </Button>
                  <Button
                    onClick={() => setInfoDialogOpen(false)}
                    variant="ghost"
                    className="px-8 h-14 text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-all group"
                  >
                    <X className="mr-2 h-4 w-4 group-hover:text-red-500 transition-colors" /> Abort
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function DocSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{title}</h4>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 items-start group">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 group-hover:border-emerald-500/50 group-hover:text-emerald-500 transition-colors">
              {i + 1}
            </div>
            <p className="text-sm font-medium text-zinc-300 pt-0.5 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:bg-black/60 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
        <Icon className="h-5 w-5 text-emerald-500" />
      </div>
      <div>
        <h5 className="text-sm font-bold text-white tracking-tight">{title}</h5>
        <p className="text-[11px] font-medium text-zinc-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
