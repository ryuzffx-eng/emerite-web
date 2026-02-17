import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resellerGetProfile, resellerUpdateProfile, clearAuth, updateUser } from "@/lib/api";
import {
  Mail,
  Building2,
  Shield,
  User,
  Fingerprint,
  Cpu,
  Laptop,
  Key,
  LogOut,
  History,
  Terminal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Profile {
  id: number;
  username: string;
  email: string;
  company_name?: string;
  credits: number;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  has_password?: boolean;
  google_id?: string;
  avatar_url?: string;
}

export default function ResellerProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await resellerGetProfile();
      setProfile(data);
      updateUser(data);
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

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
      await resellerUpdateProfile({
        old_password: oldPassword,
        new_password: newPassword
      });

      toast({
        title: "Security Update",
        description: "Access credentials updated successfully",
        className: "bg-emerald-500 border-0 text-black font-bold",
      });

      // Re-fetch profile to update has_password instantly
      loadData();

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

  if (isLoading || !profile) {
    return (
      <DashboardLayout title="Profile">
        <div className="space-y-6 animate-pulse p-1">
          <div className="h-48 rounded-xl bg-zinc-900 border border-zinc-800" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 rounded-xl bg-zinc-900 border border-zinc-800" />
            <div className="h-96 rounded-xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your identity and security settings"
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">

        {/* ==================== IDENTITY HEADER ==================== */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
            <Fingerprint className="h-64 w-64 -mr-20 -mt-20 text-emerald-500" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative group/avatar">
                <div className="h-24 w-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg transition-all group-hover/avatar:border-emerald-500/30 group-hover/avatar:shadow-emerald-500/10 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-3xl font-black text-emerald-500 select-none">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-lg bg-[#111111] border border-zinc-800 flex items-center justify-center shadow-xl" title="Verified Reseller">
                    <Shield className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                  </div>
                )}
                {profile.google_id && (
                  <div className={cn(
                    "absolute h-7 w-7 rounded-lg bg-[#111111] border border-zinc-800 flex items-center justify-center shadow-xl group/google",
                    profile.is_verified ? "-top-2 -right-2" : "-bottom-2 -right-2"
                  )} title="Google Account Linked">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">{profile.username}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <Terminal className="h-3 w-3" /> Reseller ID: #{profile.id}
                  </span>
                  <span className="hidden sm:inline text-zinc-800">|</span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> {profile.company_name || "Individual Reseller"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-end min-w-[140px]">
                <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-0.5">Balance</span>
                <span className="text-xl font-black text-emerald-500 tabular-nums tracking-tight">
                  ${Number(profile.credits).toFixed(2)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-14 px-6 border-zinc-800 bg-zinc-900/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 text-zinc-400 gap-2 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==================== LEFT: PROFILE INFORMATION ==================== */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Account Information</h3>
                </div>
                <Badge variant="outline" className="bg-zinc-900/50 border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  <Lock className="h-3 w-3 mr-1.5 inline" />
                  Read Only
                </Badge>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Display Name</Label>
                    <div className="relative group">
                      <Input
                        value={profile.username}
                        readOnly
                        className="bg-zinc-900/30 border-zinc-800 h-11 text-zinc-300 text-sm pl-10 cursor-not-allowed focus:ring-0 focus:border-zinc-800 transition-colors"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Address</Label>
                    <div className="relative group">
                      <Input
                        value={profile.email}
                        readOnly
                        className="bg-zinc-900/30 border-zinc-800 h-11 text-zinc-300 text-sm pl-10 cursor-not-allowed focus:ring-0 focus:border-zinc-800 transition-colors"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Organization</Label>
                    <div className="relative group">
                      <Input
                        value={profile.company_name || ""}
                        readOnly
                        placeholder="Independent"
                        className="bg-zinc-900/30 border-zinc-800 h-11 text-zinc-300 text-sm pl-10 cursor-not-allowed focus:ring-0 focus:border-zinc-800 transition-colors"
                      />
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Joined Date</Label>
                    <div className="relative group">
                      <Input
                        value={new Date(profile.created_at).toLocaleDateString()}
                        readOnly
                        className="bg-zinc-900/30 border-zinc-800 h-11 text-zinc-300 text-sm pl-10 cursor-not-allowed focus:ring-0 focus:border-zinc-800 transition-colors"
                      />
                      <History className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Card for Mobile/Desktop layout flow */}
            <div className="rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/20 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Session Info</h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="flex-1 p-4 rounded-xl bg-black/40 border border-zinc-800/50 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Laptop className="h-5 w-5 text-zinc-400" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse border-2 border-zinc-950" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Windows NT 10.0</span>
                        <span className="text-[10px] font-mono text-zinc-500">Web Client</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-Emerald-500/20 text-[9px] font-black uppercase tracking-widest">Active</Badge>
                  </div>

                  <div className="flex-1 p-4 rounded-xl bg-black/40 border border-zinc-800/50 flex flex-col justify-center group hover:border-zinc-700 transition-colors">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Last Authentication</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {profile.last_login ? new Date(profile.last_login).toLocaleString() : "First Session"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT: SECURITY ==================== */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-[#111111]/80 backdrop-blur-md overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/20 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Key className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Security</h3>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  {profile?.has_password && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Current Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="bg-black/40 border-zinc-800 h-11 text-white text-sm focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-800/50"></div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">New Password</Label>
                    <Input
                      type="password"
                      placeholder="New secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-black/40 border-zinc-800 h-11 text-white text-sm focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-black/40 border-zinc-800 h-11 text-white text-sm focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword}
                    className="w-full h-11 mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                  >
                    {isUpdatingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      profile?.has_password ? "Update Credentials" : "Add Password"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
