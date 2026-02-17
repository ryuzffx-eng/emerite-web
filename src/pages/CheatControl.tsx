import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeletons } from "@/components/LoadingSkeleton";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    Zap,
    Activity,
    Lock,
    Settings,
    RefreshCw,
    Search,
    ListFilter,
    Cpu,
    Network,
    Terminal,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheatControl() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    // Mock global settings
    const [settings, setSettings] = useState({
        masterSwitch: true,
        debugMode: false,
        kernelProtection: true,
        antiCheatBypass: true,
        autoUpdate: true,
        silentMode: false
    });

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast({ title: "Cheat system status refreshed" });
        }, 1000);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        toast({
            title: "Setting Updated",
            description: `${key} has been ${!settings[key] ? 'enabled' : 'disabled'}`
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Cheat Control">
                <LoadingSkeletons count={3} variant="card" />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Cheat System Control"
            subtitle="Manage global cheat engine parameters and security protocols"
        >
            <div className="space-y-6">
                {/* Global Status Banner */}
                <Card className="bg-zinc-900/40 border-zinc-800 shadow-xl overflow-hidden group">
                    <CardHeader className="border-b border-zinc-800/50 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl border transition-all duration-500",
                                    settings.masterSwitch
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                        : "bg-red-500/10 border-red-500/20 text-red-500"
                                )}>
                                    <Activity className={cn("h-6 w-6", settings.masterSwitch && "animate-pulse")} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">System Master Switch</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium">
                                        {settings.masterSwitch ? "ALL SYSTEMS OPERATIONAL // GLOBAL INJECTION ACTIVE" : "SYSTEM OFFLINE // INJECTION BLOCKED"}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Switch
                                    checked={settings.masterSwitch}
                                    onCheckedChange={() => toggleSetting('masterSwitch')}
                                    className="scale-125 data-[state=checked]:bg-emerald-500"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="h-10 w-10 border-zinc-800 hover:bg-zinc-800"
                                >
                                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Active Nodes", value: "1,284", icon: Cpu, color: "text-emerald-500" },
                        { label: "Memory Payload", value: "42.8 MB", icon: Network, color: "text-blue-500" },
                        { label: "Bypass Integrity", value: "99.2%", icon: Lock, color: "text-purple-500" },
                        { label: "Detection Risk", value: "LOW", icon: AlertTriangle, color: "text-emerald-500" }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                                <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Primary Controls */}
                    <Card className="lg:col-span-2 bg-zinc-900/20 border-zinc-800 shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-zinc-800/50">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-emerald-500" />
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-100">Security Protocols</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-800/50">
                                {[
                                    { id: 'kernelProtection', label: "Kernel-Level Protection", desc: "Enable Ring0 driver-level security layers", icon: Shield },
                                    { id: 'antiCheatBypass', label: "Anti-Cheat Polymorphism", desc: "Dynamic payload mutation on every injection", icon: Zap },
                                    { id: 'autoUpdate', label: "Binary Sync Authority", desc: "Automatic distribution of hotfixed binaries", icon: RefreshCw },
                                    { id: 'debugMode', label: "Diagnostic Overlays", desc: "Enable detailed execution logs (Admin Only)", icon: Settings },
                                    { id: 'silentMode', label: "Stealth Execution", desc: "Hide injection footprint from memory scanners", icon: Lock },
                                ].map((protocol) => (
                                    <div key={protocol.id} className="flex items-center justify-between p-6 hover:bg-zinc-800/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-zinc-400">
                                                <protocol.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{protocol.label}</p>
                                                <p className="text-xs text-zinc-500 font-medium">{protocol.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={settings[protocol.id as keyof typeof settings]}
                                            onCheckedChange={() => toggleSetting(protocol.id as keyof typeof settings)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Access Card */}
                    <div className="space-y-6">
                        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Instant Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black uppercase text-xs h-11 tracking-widest">
                                    Force Global Sync
                                </Button>
                                <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-800 uppercase text-xs h-11 tracking-widest font-black">
                                    Purge Auth Cache
                                </Button>
                                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 uppercase text-xs h-11 tracking-widest font-black">
                                    Emergency Lockdown
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/20 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Network Telemetry</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: "Global Proxy", status: "Operational", delay: "4ms" },
                                        { name: "Binary Vault", status: "Operational", delay: "12ms" },
                                        { name: "Asset CDN", status: "Degraded", delay: "145ms" }
                                    ].map((hub) => (
                                        <div key={hub.name} className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-zinc-500 uppercase">{hub.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-600 font-mono tracking-tighter">{hub.delay}</span>
                                                <span className={cn("uppercase", hub.status === "Operational" ? "text-emerald-500" : "text-amber-500")}>
                                                    {hub.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
