import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store/StoreLayout";

const Index = () => {
  const navigate = useNavigate();

  return (
    <StoreLayout>
      {/* Background Grid & Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-4 sm:px-6 text-center select-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full"
        >
          {/* Version / Status Badge */}
          <div className="flex items-center justify-center mb-8">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Protocol x2.4 // Online</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-[5rem] sm:text-[8rem] lg:text-[11rem] font-bold text-white tracking-tight leading-[0.85] uppercase">
            Emerite<br />
            <span className="text-zinc-800">Store</span>
          </h1>

          {/* Subtext Grid */}
          <div className="max-w-xl mx-auto mt-10 px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8">
              {["PREMIUM", "INSTANT", "SECURE"].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500/30" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{text}</span>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
              Industrial grade infrastructure for the modern digital landscape. <br className="hidden sm:block" />
              The world's most elite marketplace for specialized software assets.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 px-6">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-10 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 group transition-all duration-300 active:scale-95"
              onClick={() => navigate('/products')}
            >
              Access Armory
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-10 border-zinc-800 bg-zinc-900/40 text-zinc-100 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-xl backdrop-blur-md hover:bg-zinc-800 transition-all active:scale-95"
            >
              Contact Authority
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Bridge */}
      <section className="py-16 border-y border-zinc-900 bg-[#050505]/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {[
            { label: "Active Nodes", value: "25.4K+" },
            { label: "Asset Manifest", value: "850+" },
            { label: "Success Rate", value: "100%" },
            { label: "System Uptime", value: "99.9%" }
          ].map((stat, i) => (
            <div key={i} className="text-center lg:text-left flex flex-col items-center lg:items-start group border-l sm:border-0 border-zinc-800/50 pl-6 sm:pl-0 first:border-0">
              <p className="text-3xl font-bold text-white group-hover:text-emerald-500 transition-colors duration-300 tracking-tight leading-none">{stat.value}</p>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-3">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
};

export default Index;
