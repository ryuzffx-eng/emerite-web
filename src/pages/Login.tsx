import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Mail, Loader2, ShieldCheck, ArrowRight, Zap, Globe, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientLogin, clientRegister, clientVerifyEmail, clientGoogleLogin, clientDiscordLogin, clientForgotPassword, clientResetPassword, setAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import emeriteLogo from "@/assets/emerite-logo.png";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration specific
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Forgot Password specific
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code + New Pass
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Load saved credentials and handle route
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsRegistering(true);
    }

    const savedIdentifier = localStorage.getItem('emerite_identifier');
    const savedPassword = localStorage.getItem('emerite_password');
    const savedRememberMe = localStorage.getItem('emerite_remember') === 'true';

    if (savedRememberMe && savedIdentifier && savedPassword) {
      setIdentifier(savedIdentifier);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [location.pathname]);

  // Handle Discord Login Redirect
  const handleDiscordLogin = () => {
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL DISCORD CLIENT ID
    const DISCORD_CLIENT_ID = "1470753285521674475";
    // The redirect URI must strictly match what is set in Discord Developer Portal
    const REDIRECT_URI = window.location.origin + "/login";
    const scope = encodeURIComponent("identify email");

    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;

    // Remember if we were registering
    sessionStorage.setItem('emerite_auth_mode', isRegistering ? 'register' : 'login');

    window.location.href = url;
  };

  // Handle Discord Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      const loginVideoDiscord = async () => {
        setIsLoading(true);
        try {
          const response = await clientDiscordLogin(code, window.location.origin + "/login");
          const userType = response.user_type || "client";
          setAuth(response.token, userType, response.user);

          if (userType === "admin") {
            navigate("/dashboard");
          } else if (userType === "reseller") {
            navigate("/reseller/dashboard");
          } else {
            navigate(location.state?.returnUrl || "/products");
          }
        } catch (error: any) {
          toast({
            title: "Discord Login Failed",
            description: error.message || "Could not verify identity.",
            variant: "destructive"
          });
          // Restore view state
          if (sessionStorage.getItem('emerite_auth_mode') === 'register') {
            setIsRegistering(true);
          }
        } finally {
          setIsLoading(false);
          sessionStorage.removeItem('emerite_auth_mode');
        }
      };

      loginVideoDiscord();
    }
  }, []);

  const handleUnifiedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Manual login now supports both Clients and Resellers
      const response = await clientLogin(identifier, password);
      const type = response.user_type || "client";
      setAuth(response.token, type, response.user);
      handleSuccess(type);
    } catch (error: any) {
      if (error.message.includes("Account not verified")) {
        setTempEmail(identifier);
        setIsVerifying(true);
        toast({ title: "Verification Required", description: "Standard authentication paused. Check your mailbox." });
        return;
      }
      toast({
        title: "Access Denied",
        description: error.message || "Verification failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast({ title: "Error", description: "Passwords must be identical.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await clientRegister(regEmail, regPassword, regUsername);
      setTempEmail(regEmail);
      setIsVerifying(true);
      toast({ title: "Code Sent", description: "Identity verification initiated. Check your email." });
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "Failed to create registry entry.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await clientVerifyEmail(tempEmail, verificationCode);
      setAuth(response.token, "client", response.user);
      toast({ title: "Verified", description: "Identity confirmed. Access granted." });
      navigate(location.state?.returnUrl || "/products");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Code invalid or expired.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await clientForgotPassword(forgotEmail);
      setForgotStep(2);
      toast({ title: "Code Sent", description: "If the email exists, a code has been sent." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send code.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "Passwords must match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await clientResetPassword(forgotEmail, forgotCode, newPassword);
      toast({ title: "Success", description: "Password reset successfully. Please login." });
      setIsForgotPassword(false);
      setForgotStep(1);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reset password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (type: "admin" | "reseller" | "client") => {
    if (rememberMe) {
      localStorage.setItem('emerite_identifier', identifier);
      localStorage.setItem('emerite_password', password);
      localStorage.setItem('emerite_remember', 'true');
    } else {
      localStorage.removeItem('emerite_identifier');
      localStorage.removeItem('emerite_password');
      localStorage.removeItem('emerite_remember');
    }

    toast({ title: "Verified", description: `Access granted as ${type}` });

    if (type === "admin") navigate("/dashboard");
    else if (type === "reseller") navigate("/reseller/dashboard");
    else navigate(location.state?.returnUrl || "/products");
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const response = await clientGoogleLogin(tokenResponse.access_token);
        const userType = response.user_type || "client";

        setAuth(response.token, userType, response.user);
        toast({ title: "Success", description: "Google identity verified." });

        if (userType === "admin") {
          navigate("/dashboard");
        } else if (userType === "reseller") {
          navigate("/reseller/dashboard");
        } else {
          navigate(location.state?.returnUrl || "/products");
        }
      } catch (error: any) {
        toast({
          title: "Failed",
          description: error.message || "Authentication failed.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => handleGoogleError(),
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const response = await clientGoogleLogin(credentialResponse.credential);
      const userType = response.user_type || "client";

      setAuth(response.token, userType, response.user);
      toast({ title: "Success", description: "Google identity verified." });

      if (userType === "admin") {
        navigate("/dashboard");
      } else if (userType === "reseller") {
        navigate("/reseller/dashboard");
      } else {
        navigate(location.state?.returnUrl || "/products");
      }
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "Authentication failed.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({ title: "Error", description: "Google Handshake Error.", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/10 via-[#050505] to-[#050505]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-800/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-center py-4 md:py-6 px-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md shadow-2xl hover:bg-white/[0.05] transition-colors cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img src={emeriteLogo} alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="h-3 md:h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest text-zinc-400 group-hover:text-white transition-colors">STORE ACCESS</span>
        </motion.div>
      </header>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative z-10 w-full max-w-[400px] lg:max-w-[900px] h-auto lg:h-[600px] bg-[#080808]/90 backdrop-blur-3xl rounded-3xl border border-white/[0.08] shadow-[0_30px_80px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden group/card"
      >
        {/* Glow Effect on Border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50" />

        {/* Left Panel - Visual/Brand */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[45%] bg-[#050505] relative overflow-hidden border-r border-white/[0.04]">

          {/* Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_100%)] opacity-60" />

          <div className="relative z-10 flex flex-col items-center p-8 text-center">

            {/* Logo Container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-10 group"
            >
              {/* Primary Ambient Glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />

              {/* Core intense Glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-400/30 blur-[40px] rounded-full animate-pulse pointer-events-none" />

              <img src={emeriteLogo} alt="Emerite" className="w-32 h-32 relative z-10 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] transform hover:scale-110 transition-transform duration-700 ease-out" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome to <span className="text-emerald-400">Emerite</span>
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-[280px] mx-auto">
                Securely manage your product licenses, subscriptions, and reseller portfolio in one unified dashboard.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <div className="mt-12 flex flex-wrap gap-2 justify-center max-w-[300px]">
              {[
                { icon: ShieldCheck, text: "Secure" },
                { icon: Zap, text: "Instant" },
                { icon: Globe, text: "Global" },
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-[10px] text-zinc-400 font-medium select-none cursor-default hover:bg-white/[0.05] hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                >
                  <feat.icon className="w-3 h-3" />
                  {feat.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </div>

        {/* Right Panel - Interactive Form */}
        <div className="flex-1 bg-gradient-to-br from-[#0A0A0A] via-[#050505] to-[#000000] flex flex-col items-center justify-center p-8 sm:p-12 relative min-h-[520px] lg:min-h-0">

          {/* Subtle Ambient Light (Top Right) */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">
            {isVerifying ? (
              <motion.div
                key="verify-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm"
              >
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight uppercase">Verify Identity</h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">
                    Enter the 6-digit code sent to <br />
                    <span className="text-emerald-400/80">{tempEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyEmail} className="space-y-6">
                  <div className="group">
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      className="h-16 bg-white/[0.02] border-white/[0.06] rounded-2xl text-3xl font-black tracking-[0.5em] text-center focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-800 placeholder:tracking-normal placeholder:font-medium text-emerald-500"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button disabled={isLoading} className="w-full h-13 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.1em] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
                  </Button>

                  <div className="text-center">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Didn't get the code? </span>
                    <button type="button" onClick={handleRegister} className="text-[10px] font-black text-zinc-400 hover:text-emerald-400 transition-colors ml-1 uppercase tracking-[0.1em]">
                      Resend Code
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center border-t border-white/[0.04] pt-6">
                  <button onClick={() => setIsVerifying(false)} className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            ) : isForgotPassword ? (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm"
              >
                <div className="mb-6 md:mb-8 text-center lg:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight uppercase">Reset Password</h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">
                    {forgotStep === 1 ? "Enter your email to receive a code." : "Set your new password."}
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 md:space-y-5">
                    <div className="group">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <Input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Email Address"
                          className="pl-11 h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                          required
                        />
                      </div>
                    </div>
                    <Button disabled={isLoading} className="w-full h-12 md:h-13 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.1em] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Code"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4 md:space-y-5">
                    <div className="group">
                      <Input
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-lg font-bold text-center tracking-[0.2em] focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-emerald-500"
                        required
                      />
                    </div>
                    <div className="group space-y-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          className="pl-11 h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                          required
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <Input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm Password"
                          className="pl-11 h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                          required
                        />
                      </div>
                    </div>
                    <Button disabled={isLoading} className="w-full h-12 md:h-13 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.1em] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change Password"}
                    </Button>
                  </form>
                )}

                <div className="mt-8 text-center border-t border-white/[0.04] pt-6">
                  <button onClick={() => { setIsForgotPassword(false); setForgotStep(1); }} className="text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            ) : !isRegistering ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm"
              >
                <div className="mb-6 md:mb-8 text-center lg:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight uppercase">Access Portal</h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">Enter your credentials to continue.</p>
                </div>

                <form onSubmit={handleUnifiedLogin} className="space-y-4 md:space-y-5">
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <Input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Username or Email"
                        className="pl-11 h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="pl-11 h-12 md:h-13 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[9px] md:text-[10px] font-black text-zinc-600 hover:text-emerald-400 transition-colors uppercase tracking-[0.15em]">
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <Button disabled={isLoading} className="w-full h-12 md:h-13 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.1em] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6 md:my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-[#0c0c0c] px-4 text-zinc-600">Or continue with</span>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleDiscordLogin} type="button" className="h-10 rounded-lg bg-[#151515] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white text-zinc-400 transition-all group">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1892.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.1023.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 00-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" /></svg>
                    <span className="text-[11px] font-semibold">Discord</span>
                  </button>

                  <button
                    onClick={() => loginWithGoogle()}
                    type="button"
                    className="h-10 rounded-lg bg-[#151515] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all group relative overflow-hidden"
                  >
                    <svg className="w-4 h-4 transition-all z-10" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-[11px] font-semibold transition-colors z-10">Google</span>
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <span className="text-[10px] md:text-[11px] text-zinc-600 font-bold uppercase tracking-wider">New to Emerite? </span>
                  <button onClick={() => setIsRegistering(true)} className="text-[10px] md:text-[11px] font-black text-zinc-400 hover:text-emerald-400 transition-colors ml-1 uppercase tracking-[0.1em]">
                    Create Account
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm"
              >
                <div className="mb-6 text-center lg:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight uppercase">Create Account</h1>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">Join the community today.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <Input
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Username"
                        className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <Input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group">
                      <Input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                    <div className="group">
                      <Input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm"
                        required
                        className="h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 text-zinc-300"
                      />
                    </div>
                  </div>

                  <Button disabled={isLoading} className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-[0.1em] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6 md:my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                  </div>
                  <div className="relative flex justify-center text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-[#0c0c0c] px-4 text-zinc-600">Or sign up with</span>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={handleDiscordLogin} type="button" className="h-10 rounded-lg bg-[#151515] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white text-zinc-400 transition-all group">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1892.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.1023.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 00-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" /></svg>
                    <span className="text-[11px] font-semibold">Discord</span>
                  </button>

                  <button
                    onClick={() => loginWithGoogle()}
                    type="button"
                    className="h-10 rounded-lg bg-[#151515] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all group relative overflow-hidden"
                  >
                    <svg className="w-4 h-4 transition-all z-10" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84z" fill="#EA4335" />
                    </svg>
                    <span className="text-[11px] font-semibold transition-colors z-10">Google</span>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button onClick={() => setIsRegistering(false)} className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-[10px] text-zinc-700 font-medium tracking-wide">
        &copy; {new Date().getFullYear()} Emerite Systems. All rights reserved.
      </div>
    </div>
  );
}
