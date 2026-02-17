import { getAuth, getAdminProfile, updateUser } from "@/lib/api";
import ResellerProfile from "./ResellerProfile";
import ClientProfile from "./client/Profile";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, Info, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Profile() {
    const auth = getAuth();
    const [adminData, setAdminData] = useState<any>(null);

    useEffect(() => {
        if (auth?.userType === "admin") {
            getAdminProfile().then(data => {
                setAdminData(data);
                updateUser(data);
            });
        }
    }, [auth?.userType]);

    if (auth?.userType === "reseller") {
        return <ResellerProfile />;
    }

    if (auth?.userType === "client") {
        return <ClientProfile />;
    }

    // Admin Profile (Simple View)
    return (
        <DashboardLayout
            title="Admin Profile"
            subtitle="System administrator account details"
        >
            <div className="space-y-6">
                {/* Main Profile Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="h-24 w-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                                {adminData?.avatar_url ? (
                                    <img src={adminData.avatar_url} alt="Admin" className="h-full w-full object-cover" />
                                ) : (
                                    <Shield className="h-10 w-10 text-emerald-500" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{adminData?.username || "Administrator"}</h2>
                                <p className="text-emerald-500/80 font-medium text-sm mt-1 uppercase tracking-wider">Super Admin Access</p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                            Verified System Owner
                        </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-4 p-5 rounded-xl bg-black/20 border border-zinc-800/50">
                            <Mail className="h-6 w-6 text-zinc-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Primary Contact</p>
                                <p className="text-zinc-200 mt-1">{adminData?.email || "admin@emerite.store"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 rounded-xl bg-black/20 border border-zinc-800/50">
                            <Calendar className="h-6 w-6 text-zinc-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Created</p>
                                <p className="text-zinc-200 mt-1">{adminData?.created_at ? new Date(adminData.created_at).toLocaleDateString() : "System Initialization"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Notice */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="space-y-2">
                            <h3 className="font-bold text-zinc-200 text-sm">Deployment Notice</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Administrator credentials for this instance are managed directly via the core database and environment configuration.
                                To modify security parameters or rotate keys, please refer to the system orchestration documentation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
