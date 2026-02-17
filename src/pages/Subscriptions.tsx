import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/LoadingSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getSubscriptionPlans, createSubscriptionPlan, deleteSubscriptionPlan, assignSubscriptionToUser, getApplications } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users, Check, RefreshCw, Package, Zap, Crown, Shield, Activity, Search, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import emeriteLogo from "@/assets/emerite-logo.png";

interface Plan {
  id: number;
  app_id: number;
  app_name?: string | null;
  name: string;
  level: number;
  description?: string | null;
  active: boolean;
  max_seats?: number | null;
  created_at?: string;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [applications, setApplications] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [appId, setAppId] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [maxSeats, setMaxSeats] = useState<number | null>(null);

  // Assign form
  const [assignInput, setAssignInput] = useState<string>("");
  const [assignDuration, setAssignDuration] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        getSubscriptionPlans(),
        getApplications(),
      ]);

      const [plansResult, appsResult] = results;

      if (plansResult.status === "fulfilled") {
        setPlans(plansResult.value || []);
      } else {
        console.error("[Subscriptions] Failed to fetch plans:", plansResult.reason);
        toast({
          title: "Failed to load plans",
          description: plansResult.reason.message,
          variant: "destructive",
        });
      }

      if (appsResult.status === "fulfilled") {
        setApplications(appsResult.value || []);
      }
    } catch (error: any) {
      console.error("[Subscriptions] Critical fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPlans();
      setLastUpdated(new Date());
      toast({ title: "Plans refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!name || !appId) return toast({ title: "Invalid data", description: "Name and Application required", variant: "destructive" });
    try {
      await createSubscriptionPlan({
        name,
        app_id: appId,
        level,
        description,
        active: true,
        max_seats: maxSeats,
      });
      toast({ title: "Success", description: "Plan created successfully" });
      setDialogOpen(false);
      fetchPlans();
      resetCreateForm();
    } catch (error: any) {
      toast({ title: "Failed to create plan", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (plan: Plan) => {
    setDeleteConfirm({ open: true, id: plan.id, name: plan.name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id === null) return;
    setIsDeleting(true);
    try {
      await deleteSubscriptionPlan(deleteConfirm.id);
      toast({ title: "Success", description: "Plan deleted" });
      setDeleteConfirm({ open: false, id: null, name: "" });
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const openAssign = (plan: Plan) => {
    setSelectedPlan(plan);
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedPlan) return;
    if (!assignInput) return toast({ title: "Invalid input", description: "Please enter a User ID or License Key", variant: "destructive" });
    try {
      const isNum = /^\d+$/.test(assignInput);
      const payload: any = {
        plan_id: selectedPlan.id,
        duration_days: assignDuration ? Number(assignDuration) : undefined
      };

      if (isNum) {
        payload.user_id = Number(assignInput);
      } else {
        payload.license_key = assignInput;
      }

      await assignSubscriptionToUser(payload);
      toast({ title: "Success", description: "Plan assigned to user" });
      setAssignDialogOpen(false);
      setAssignInput("");
      setAssignDuration("");
    } catch (error: any) {
      toast({ title: "Failed to assign", description: error.message, variant: "destructive" });
    }
  };

  const resetCreateForm = () => {
    setName("");
    setAppId(null);
    setLevel(1);
    setDescription("");
    setMaxSeats(null);
  };

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.app_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Subscriptions" subtitle="Manage pricing tiers and access levels">


      <div className="space-y-8 transition-all duration-300">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Subscription Engine</p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{plans.length} Tier Architectures</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex-1 md:flex-none border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-10 sm:h-11 px-4 sm:px-6 font-bold transition-all active:scale-95 text-xs sm:text-sm"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
              Sync Archive
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: "Tiers", value: plans.length, icon: Package, color: "text-emerald-500", delay: '0ms' },
            { label: "Nodes", value: new Set(plans.map(p => p.app_id)).size, icon: Activity, color: "text-blue-500", delay: '100ms' },
            { label: "Temporal", value: lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: Clock, color: "text-zinc-500", delay: '200ms' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#111111]/80 border border-zinc-800/80 p-4 sm:p-6 rounded-xl animate-card-in backdrop-blur-md hover:border-zinc-700 transition-all duration-300 shadow-xl shadow-black/20"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate mr-1">{stat.label}</p>
                <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 opacity-60 flex-shrink-0", stat.color)} />
              </div>
              <p className={cn("text-xl sm:text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
              <div className="mt-3 sm:mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={cn("h-full opacity-40", stat.color.replace('text-', 'bg-'))}
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/40 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetCreateForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-semibold shadow-lg shadow-emerald-500/10 border-0">
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Create Subscription Plan</DialogTitle>
                <DialogDescription className="text-zinc-400">Define a new tier for your application access.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="plan-name" className="text-zinc-300">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pro Monthly"
                    className="bg-black/40 border-zinc-800 focus:border-emerald-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="app-select" className="text-zinc-300">Application</Label>
                  <select
                    id="app-select"
                    className="w-full px-3 py-2 border border-zinc-800 rounded-md bg-black/40 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={appId ?? ""}
                    onChange={(e) => setAppId(Number(e.target.value) || null)}
                  >
                    <option value="">Select an application</option>
                    {applications.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level" className="flex items-center gap-2 text-zinc-300">
                      Level <Crown className="h-3 w-3 text-yellow-500" />
                    </Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      value={level}
                      onChange={(e) => setLevel(Math.max(1, Number(e.target.value) || 1))}
                      className="pl-9 bg-black/40 border-zinc-800 transition-all"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seats" className="text-zinc-300">Max Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={maxSeats ?? ""}
                      onChange={(e) => setMaxSeats(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Unlimited"
                      className="bg-black/40 border-zinc-800"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-zinc-300">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Features included..."
                    className="bg-black/40 border-zinc-800"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-semibold">
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-zinc-900/50 animate-pulse" />
            ))
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-zinc-300">No plans found</p>
              <p className="text-sm opacity-70">Create a plan to get started</p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className="group relative overflow-hidden bg-zinc-900/40 border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Zap className="h-24 w-24 -mr-8 -mt-8 text-emerald-500 rotate-12" />
                </div>

                <CardHeader className="relative pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Level {plan.level}
                        </Badge>
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700">
                          {plan.app_name || applications.find(a => a.id === plan.app_id)?.name || 'Unknown App'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {plan.active ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Active" />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" title="Inactive" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative py-4 space-y-4">
                  <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
                    {plan.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{plan.max_seats ? `${plan.max_seats} Seats` : "Unlimited Seats"}</span>
                    </div>
                    <div className="h-3 w-px bg-zinc-700" />
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Secure Access</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="relative pt-2 gap-2">
                  <Button
                    onClick={() => openAssign(plan)}
                    variant="default"
                    className="bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 flex-1 h-9 hover:text-emerald-400 hover:border-emerald-500/30"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                  <Button
                    onClick={() => handleDelete(plan)}
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) {
            setAssignInput("");
            setAssignDuration("");
          }
        }}>
          <DialogContent className="sm:max-w-[400px] border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Plan</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Assign <b>{selectedPlan?.name}</b> to a user manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="user-id" className="text-zinc-300">User ID or License Key</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="user-id"
                    value={assignInput}
                    onChange={(e) => setAssignInput(e.target.value)}
                    placeholder="Enter ID (123) or Key (AAAA-BBBB)"
                    type="text"
                    className="pl-9 bg-black/40 border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-zinc-300">Duration (Days)</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="duration"
                    value={assignDuration}
                    onChange={(e) => setAssignDuration(e.target.value)}
                    placeholder="e.g. 30 (Optional)"
                    type="number"
                    min="1"
                    className="pl-9 bg-black/40 border-zinc-800 focus:border-emerald-500 text-white"
                  />
                </div>
                <p className="text-[10px] text-zinc-500">Leave blank to use default plan duration if configured, or unlimited.</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button
                  onClick={() => setAssignDialogOpen(false)}
                  variant="ghost"
                  className="w-full sm:w-auto text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  className="w-full sm:w-auto bg-[#3ECF8E] hover:bg-[#34b27b] text-zinc-900 font-semibold"
                >
                  Confirm Assignment
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Subscription Plan"
        description="This action will permanently remove this plan. Users assigned to this plan will no longer be able to use it."
        message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: "" })}
      />
    </DashboardLayout >
  );
}
