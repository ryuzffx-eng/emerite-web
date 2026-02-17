import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full text-center relative z-10 p-8 rounded-xl border border-zinc-800/80 bg-[#111111]/80 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group">
            <AlertCircle className="h-10 w-10 text-emerald-500/50 group-hover:text-emerald-500 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          </div>
        </div>

        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600 tracking-tighter mb-2">404</h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Signal Lost in Void</p>

        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 mb-8 font-mono text-xs text-red-400 break-all">
          GET {location.pathname} {"->"} ERR_NOT_FOUND
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1 h-12 rounded-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Link to="/login">
              <ArrowLeft className="h-3 w-3" /> Go Back
            </Link>
          </Button>
          <Button asChild className="flex-1 h-12 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20">
            <Link to="/dashboard">
              <Home className="h-3 w-3" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
