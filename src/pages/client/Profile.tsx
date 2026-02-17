import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientGetProfile, clientUpdatePassword, apiRequest, updateUser } from "@/lib/api";
import {
    User, Mail, Shield, Camera,
    Save, Key, CheckCircle2,
    AlertCircle, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ClientProfile = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // Password Update State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ["client-profile"],
        queryFn: clientGetProfile
    });

    const [formData, setFormData] = useState({
        username: "",
        avatar_url: ""
    });

    // Initialize form when data loads
    React.useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || "",
                avatar_url: profile.avatar_url || ""
            });
        }
    }, [profile]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return await apiRequest("/auth/client/me", {
                method: "PUT",
                body: JSON.stringify(data)
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["client-profile"] });
            // Update global user state for nav bar to reflect changes immediately
            if (data) {
                updateUser(data);
            }

            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved.",
                className: "bg-emerald-500 border-0 text-white font-bold",
            });
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Could not save profile changes.",
                variant: "destructive"
            });
        }
    });

    const handlePasswordUpdate = async () => {
        if (!newPassword || !confirmPassword) {
            toast({
                title: "Validation Error",
                description: "New password and confirmation are required",
                variant: "destructive",
            });
            return;
        }

        if (profile?.has_password && !oldPassword) {
            toast({
                title: "Validation Error",
                description: "Current password is required",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Mismatch",
                description: "New password and confirmation do not match",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUpdatingPassword(true);
            await clientUpdatePassword({
                old_password: oldPassword,
                new_password: newPassword
            });

            toast({
                title: "Success",
                description: "Password updated successfully",
                className: "bg-emerald-500 border-0 text-white font-bold",
            });

            // Trigger re-fetch to update has_password status instantly
            queryClient.invalidateQueries({ queryKey: ["client-profile"] });

            // Clear fields
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err: any) {
            toast({
                title: "Update Failed",
                description: err.message || "Failed to update password",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Profile" subtitle="Manage your account settings.">
                <div className="w-full space-y-6 pb-12">
                    <div className="h-48 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                    <div className="h-96 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    if (isError || !profile) {
        return (
            <DashboardLayout title="Profile" subtitle="Manage your account settings.">
                <div className="w-full space-y-6 pb-12">
                    <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="text-xl font-bold text-white">Profile Error</h3>
                        <p className="text-zinc-400">Unable to load your profile. Please try refreshing.</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            Retry
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Profile"
            subtitle="Manage your personal information and security settings."
        >
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-8 rounded-2xl bg-[#0c0c0c]/80 border border-zinc-800/60 shadow-xl backdrop-blur-xl relative overflow-hidden group transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        {/* Avatar Sector */}
                        <div className="relative group/avatar">
                            <div className="w-24 h-24 rounded-xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300 group-hover/avatar:border-zinc-700">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-zinc-700 group-hover/avatar:text-zinc-500 transition-colors" />
                                )}
                            </div>
                        </div>

                        {/* Identity Info */}
                        <div className="flex-1 text-center md:text-left space-y-3 pt-2">
                            <div className="space-y-1">
                                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">
                                        {profile?.username || "Commander"}
                                    </h2>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px] tracking-wider font-bold px-2.5 py-0.5 rounded-full">
                                        Verified System Client
                                    </Badge>
                                </div>
                                <p className="text-zinc-500 font-medium flex items-center justify-center md:justify-start gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-zinc-600" />
                                    {profile?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Update Profile */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-7 space-y-6"
                    >
                        <div className="p-8 rounded-2xl bg-[#0c0c0c]/80 border border-zinc-800/60 shadow-xl backdrop-blur-xl space-y-6 h-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">General Information</h3>
                                    <p className="text-sm text-zinc-500 font-medium">Update your public profile details.</p>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        className="h-9 px-4 rounded-lg border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-bold text-xs"
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            variant="ghost"
                                            className="h-9 px-3 rounded-lg text-zinc-500 hover:text-zinc-300 font-bold text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => updateProfileMutation.mutate(formData)}
                                            disabled={updateProfileMutation.isPending}
                                            className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
                                        >
                                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <Input
                                            disabled={!isEditing}
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-11 pl-10 text-white font-medium focus:border-emerald-500/50 transition-all focus:ring-1 focus:ring-emerald-500/20"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <Input
                                            disabled={true}
                                            value={profile?.email || ""}
                                            className="bg-zinc-900/30 border-zinc-800/50 rounded-lg h-11 pl-10 text-zinc-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Change Password */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-5 space-y-6"
                    >
                        <div className="p-8 rounded-2xl bg-[#0c0c0c]/80 border border-zinc-800/60 shadow-xl backdrop-blur-xl space-y-6 h-full">
                            <div>
                                <h3 className="text-lg font-bold text-white">Security</h3>
                                <p className="text-sm text-zinc-500 font-medium">
                                    {profile?.has_password ? "Change your account password." : "Set a secure password for your account."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {profile?.has_password && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Current Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <Input
                                                type="password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-800 rounded-lg h-11 pl-10 text-white font-medium focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-11 pl-10 text-white font-medium focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                            placeholder="New password"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Confirm Password</Label>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-11 pl-10 text-white font-medium focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        disabled={isUpdatingPassword}
                                        className="w-full h-11 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700/50 hover:border-zinc-600 transition-all"
                                    >
                                        {isUpdatingPassword ? "Processing..." : (profile?.has_password ? "Update Password" : "Add Password")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientProfile;
