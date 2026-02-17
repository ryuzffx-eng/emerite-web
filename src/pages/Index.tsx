import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ShieldCheck, Zap, MessageCircle, Globe, Server, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store/StoreLayout";
import { getStoreStatsPublic } from "@/lib/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 60, damping: 15 }
  },
} as const;

const letterContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const letterItem = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12
    }
  }
} as const;

export default function Index() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Active Users", value: "25k+", icon: <Globe className="w-5 h-5 text-emerald-500" /> },
    { label: "Products", value: "150+", icon: <Server className="w-5 h-5 text-emerald-500" /> },
    { label: "Satisfaction", value: "100%", icon: <Star className="w-5 h-5 text-emerald-500" /> },
    { label: "Uptime", value: "99.9%", icon: <Zap className="w-5 h-5 text-emerald-500" /> }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStoreStatsPublic();
        if (data) {
          setStats([
            {
              label: "Active Users",
              value: data.active_users > 1000
                ? `${(data.active_users / 1000).toFixed(1)}k+`
                : `${data.active_users}+`,
              icon: <Globe className="w-5 h-5 text-emerald-500" />
            },
            {
              label: "Products",
              value: `${data.products}+`,
              icon: <Server className="w-5 h-5 text-emerald-500" />
            },
            {
              label: "Satisfaction",
              value: `${data.satisfaction}%`,
              icon: <Star className="w-5 h-5 text-emerald-500" />
            },
            {
              label: "Uptime",
              value: `${data.uptime}%`,
              icon: <Zap className="w-5 h-5 text-emerald-500" />
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch public stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <StoreLayout>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full opacity-30" />
      </div>

      <div className="relative min-h-screen pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-24" // Increased vertical spacing between sections
          >
            {/* HERO SECTION */}
            <div className="flex flex-col items-center justify-center text-center pt-10 sm:pt-20">
              <motion.div variants={item} className="mb-8 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 mb-12">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-500 text-[10px] font-bold tracking-[0.2em] uppercase">System Online</span>
                </div>

                <div className="flex items-center justify-center gap-6 sm:gap-12 opacity-80 mb-6 w-full">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-zinc-500 flex-1 max-w-[40px] sm:max-w-[100px]"
                  />

                  <motion.h1
                    variants={letterContainer}
                    initial="hidden"
                    animate="show"
                    className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-[0.15em] uppercase whitespace-nowrap text-shadow-glow flex gap-3 sm:gap-6 items-center"
                  >
                    <span className="flex">
                      {"EMERITE".split("").map((char, i) => (
                        <motion.span key={i} variants={letterItem} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                    <span className="flex text-emerald-500">
                      {"STORE".split("").map((char, i) => (
                        <motion.span key={i} variants={letterItem} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  </motion.h1>

                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className="h-px bg-gradient-to-l from-transparent via-zinc-700 to-zinc-500 flex-1 max-w-[40px] sm:max-w-[100px]"
                  />
                </div>

                <motion.p variants={item} className="text-zinc-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light tracking-wide mt-4">
                  The definitive marketplace for elite digital assets. <br className="hidden sm:block" />
                  Verified security. Instant delivery.
                </motion.p>
              </motion.div>

              <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('/products')}
                >
                  Browse Products
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 border-zinc-800 bg-[#0a0a0a] text-zinc-400 hover:text-white hover:border-zinc-700 font-bold uppercase tracking-wider text-xs transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('/contact')}
                >
                  Contact Support
                </Button>
              </motion.div>
            </div>

            {/* STATS SECTION */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/20 transition-all group hover:-translate-y-1 duration-300 text-center">
                  <div className="p-2 bg-emerald-500/5 rounded-lg text-emerald-500/50 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight block">{stat.value}</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mt-1">{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* FEATURES SECTION */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                  title: "Verified Security",
                  desc: "Rigorous binary analysis and safety verification for every product listing."
                },
                {
                  icon: <Zap className="w-6 h-6 text-emerald-500" />,
                  title: "Instant Delivery",
                  desc: "Automated delivery system ensures keys reach your dashboard instantly."
                },
                {
                  icon: <MessageCircle className="w-6 h-6 text-emerald-500" />,
                  title: "Premium Support",
                  desc: "24/7 direct access to our engineering team for rapid resolution."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-8 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 group hover:-translate-y-1">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4 group-hover:border-emerald-500/50 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </StoreLayout>
  );
}
