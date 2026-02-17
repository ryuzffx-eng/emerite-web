import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/LoadingSkeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getVariables,
  createVariable,
  updateVariable,
  deleteVariable,
  getApplications,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Variable, Copy, RefreshCw, Layers, Save, X, Hash, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface Var {
  id: number;
  key: string;
  value: string;
  app_id: number;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: number;
  name: string;
}

export default function Variables() {
  const [variables, setVariables] = useState<Var[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVar, setEditVar] = useState<Var | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const fetchApplications = async () => {
    try {
      const data = await getApplications();
      setApplications(data || []);
    } catch (error: any) {
      console.error("[Variables] Error fetching apps:", error);
    }
  };

  const fetchVariables = async (appId: string) => {
    if (!appId) {
      setVariables([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getVariables(parseInt(appId));
      setVariables(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load variables",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchVariables(selectedAppId);
      setLastUpdated(new Date());
      toast({ title: "Variables refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchVariables(selectedAppId);
  }, [selectedAppId]);

  const handleSubmit = async () => {
    if (!selectedAppId) {
      toast({
        title: "Select an application",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editVar) {
        await updateVariable(editVar.id.toString(), { key, value });
        toast({ title: "Variable updated" });
      } else {
        await createVariable({ app_id: parseInt(selectedAppId), key, value });
        toast({ title: "Variable created" });
      }
      setDialogOpen(false);
      resetForm();
      fetchVariables(selectedAppId);
    } catch (error: any) {
      toast({
        title: editVar ? "Failed to update" : "Failed to create",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVariable(id.toString());
      toast({ title: "Variable deleted" });
      fetchVariables(selectedAppId);
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setKey("");
    setValue("");
    setEditVar(null);
  };

  const openEdit = (v: Var) => {
    setEditVar(v);
    setKey(v.key);
    setValue(v.value);
    setDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const columns = [
    {
      key: "key",
      header: "Key Identifier",
      render: (v: Var) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Hash className="h-4 w-4 text-cyan-500" />
          </div>
          <code className="font-mono text-xs sm:text-sm text-cyan-200 font-semibold bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
            {v.key}
          </code>
        </div>
      ),
    },
    {
      key: "value",
      header: "Config Value",
      render: (v: Var) => (
        <div className="flex items-center gap-2 group">
          <code className="font-mono text-xs sm:text-sm text-zinc-300 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800/50 max-w-xs truncate block">
            {v.value}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 opacity-0 group-hover:opacity-100 transition-all",
              copiedKey === v.value ? "text-emerald-500 opacity-100" : "text-zinc-500 hover:text-white"
            )}
            onClick={() => copyToClipboard(v.value)}
          >
            {copiedKey === v.value ? <Save className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      ),
    },
    {
      key: "created",
      header: "Registered",
      render: (v: Var) => (
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          {new Date(v.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (v: Var) => (
        <div className="flex justify-end gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(v)}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(v.id)}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Environment Variables"
      subtitle="Manage server-side application constants"
    >


      <div className="space-y-8 transition-all duration-300">
        {/* Top Summary Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
              <Code className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Global Config</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{variables.length} Active Variables</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || !selectedAppId}
              variant="outline"
              className="flex-1 md:flex-none border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-10 sm:h-11 px-4 sm:px-6 font-semibold transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
              Sync Config
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700">
              <Layers className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="flex-1 sm:flex-none">
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger className="w-full sm:w-64 h-10 bg-black/40 border-zinc-800 text-white focus:ring-cyan-500/20 focus:border-cyan-500/50">
                  <SelectValue placeholder="Select Application Scope..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id.toString()} className="text-zinc-300 focus:text-white focus:bg-zinc-800">
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAppId} className="w-full sm:w-auto h-10 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold uppercase tracking-widest text-xs transition-transform active:scale-95">
                <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                New Variable
              </Button>
            </DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Variable className="h-4 w-4 text-cyan-500" />
                  </div>
                  {editVar ? "Edit Configuration" : "New Configuration"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Variable Key</Label>
                  <Input
                    placeholder="e.g. API_ENDPOINT_URL"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="h-11 bg-black/40 border-zinc-800 font-mono text-sm text-cyan-400 placeholder:text-zinc-700 focus:border-cyan-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Value</Label>
                  <Input
                    placeholder="e.g. https://api.example.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-11 bg-black/40 border-zinc-800 font-mono text-sm text-white placeholder:text-zinc-700 focus:border-cyan-500 rounded-xl"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full h-12 bg-white hover:bg-cyan-500 hover:text-black text-black font-black uppercase tracking-widest text-xs transition-all rounded-xl mt-2">
                  {editVar ? "Update Variable" : "Create Variable"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-[#111111]/80 backdrop-blur-md shadow-2xl">
          <DataTable
            columns={columns}
            data={variables}
            keyExtractor={(v) => v.id.toString()}
            isLoading={isLoading}
            emptyMessage={selectedAppId ? "No configuration variables found for this scope" : "Select an application to view variables"}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
