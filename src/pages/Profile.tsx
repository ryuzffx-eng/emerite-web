import { getAuth, getAdminProfile, updateUser, updateAdminProfile, updateAdminPassword } from "@/lib/api";
import ResellerProfile from "./ResellerProfile";
import ClientProfile from "./client/Profile";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, Info, User, Lock, Camera, Check, RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

export default function Profile() {
    const auth = getAuth();
    const { toast } = useToast();
    const [adminData, setAdminData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"details" | "security">("details");

    // Form States
    const [profileForm, setProfileForm] = useState({
        username: "",
        email: "",
        avatar_url: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (auth?.userType === "admin") {
            fetchAdminProfile();
        }
    }, [auth?.userType]);

    const fetchAdminProfile = async () => {
        try {
            const data = await getAdminProfile();
            setAdminData(data);

            const avatar = data.avatar_url || DEFAULT_AVATAR;

            setProfileForm({
                username: data.username || "",
                email: data.email || "",
                avatar_url: data.avatar_url || ""
            });

            // Ensure BOTH keys are updated for compatibility with all navigation components
            updateUser({
                ...data,
                avatar: avatar,
                avatar_url: avatar
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use default if empty
        const submissionData = {
            ...profileForm,
            avatar_url: profileForm.avatar_url.trim() || DEFAULT_AVATAR
        };

        setIsUpdating(true);
        try {
            await updateAdminProfile(submissionData);
            toast({ title: "Success", description: "Profile updated successfully" });
            fetchAdminProfile();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            return toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        }

        setIsUpdating(true);
        try {
            await updateAdminPassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });
            toast({ title: "Success", description: "Password updated successfully" });
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update password", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    if (auth?.userType === "reseller") return <ResellerProfile />;
    if (auth?.userType === "client") return <ClientProfile />;

    if (isLoading) {
        return (
            <DashboardLayout title="Admin Profile" subtitle="Loading account details...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Admin Profile"
            subtitle="Manage your account settings"
        >
            <div className="space-y-6">
                {/* Profile Header Bar */}
                <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/10 rounded-xl p-6 backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="h-20 w-20 rounded-2xl bg-zinc-950 border-2 border-white/5 flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-emerald-500/50 transition-all duration-500">
                                    {adminData?.avatar_url ? (
                                        <img src={adminData.avatar_url} alt="Admin" className="h-full w-full object-cover" />
                                    ) : (
                                        <Shield className="h-8 w-8 text-emerald-500" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-emerald-500 rounded-lg border-[3px] border-[#0c0c0c] flex items-center justify-center text-black shadow-lg">
                                    <Shield className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div className="text-center md:text-left space-y-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">
                                        {adminData?.username || "Emerite Admin"}
                                    </h2>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 font-bold text-[10px]">
                                        Admin
                                    </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-x-4 gap-y-1 text-zinc-500 text-xs font-medium">
                                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {adminData?.email}</span>
                                    <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(adminData?.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/5 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Session Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 bg-white/[0.02]">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === "details" ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <User className="w-4 h-4" /> Profile Details
                            </span>
                            {activeTab === "details" && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === "security" ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" /> Security Settings
                            </span>
                            {activeTab === "security" && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
                        </button>
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === "details" ? (
                                <motion.form
                                    key="details"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onSubmit={handleUpdateProfile}
                                    className="space-y-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400 ml-1">Username</label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <Input
                                                    value={profileForm.username}
                                                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                                    className="bg-zinc-950/50 border-white/5 pl-11 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400 ml-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                <Input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="bg-zinc-950/50 border-white/5 pl-11 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                    placeholder="Enter email"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 ml-1">Profile Photo (URL)</label>
                                        <div className="relative">
                                            <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <Input
                                                value={profileForm.avatar_url}
                                                onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                                className="bg-zinc-950/50 border-white/5 pl-11 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                placeholder="https://example.com/photo.png"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg"
                                    >
                                        {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                        Save Changes
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="security"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onSubmit={handleUpdatePassword}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 ml-1">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <Input
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                className="bg-zinc-950/50 border-white/5 pl-11 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400 ml-1">New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                className="bg-zinc-950/50 border-white/5 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-400 ml-1">Confirm New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                                className="bg-zinc-950/50 border-white/5 h-12 text-sm focus:border-emerald-500/50 focus:ring-emerald-500/10 rounded-xl"
                                                placeholder="Repeat new password"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                                    >
                                        {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                                        Update Password
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-zinc-950/30 border border-white/5 rounded-xl p-6 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <AlertCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-zinc-200 font-bold text-sm">Security Note</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            You are the Emerite Admin. Keep your login details safe and change your password regularly to keep the store secure.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
