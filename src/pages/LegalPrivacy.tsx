import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Server, Globe } from "lucide-react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50 }
    },
} as const;

export default function LegalPrivacy() {
    return (
        <StoreLayout hideFooter={true}>
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full opacity-30" />
            </div>

            <div className="relative min-h-screen pt-32 pb-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto w-full">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-12"
                    >
                        {/* Header Style from Reviews Page */}
                        <motion.div variants={item} className="w-full max-w-4xl mx-auto px-4">
                            <div className="flex items-center justify-center gap-6 sm:gap-12 opacity-80">
                                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-zinc-500 flex-1 max-w-[100px] sm:max-w-xs" />
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-[0.3em] uppercase whitespace-nowrap text-shadow-glow">
                                    Privacy <span className="text-emerald-500">Policy</span>
                                </h2>
                                <div className="h-px bg-gradient-to-l from-transparent via-zinc-700 to-zinc-500 flex-1 max-w-[100px] sm:max-w-xs" />
                            </div>
                            <p className="text-zinc-500 text-xs text-center mt-4 font-mono tracking-widest uppercase opacity-70">
                                Last Updated: February 2026
                            </p>
                        </motion.div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Eye className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Data Collection</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    We collect basic info (email, username, payment details) to process orders. We never store sensitive credit card data.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Server className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Data Usage</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    Information is used solely for order processing, product delivery, customer support, and essential service updates.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Security</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    We use industry-standard encryption and regular security audits to protect your data from unauthorized access.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Globe className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Third Parties</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    We do not sell your personal data. Data is only shared with trusted processors essential for operation (e.g., Stripe/PayPal).
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
