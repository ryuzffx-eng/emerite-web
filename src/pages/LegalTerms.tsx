import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, Scale } from "lucide-react";

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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
} as const;

export default function LegalTerms() {
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
                                    Terms of <span className="text-emerald-500">Service</span>
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
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Agreement</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    By using our services, you accept these terms in full. If you disagree with any part, you must not use our website.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Lock className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Digital Delivery</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    Products are digital-only. License keys are delivered instantly via email/dashboard upon payment. No physical shipping.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">License Usage</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    Personal, non-commercial license only. No modification, resale, reverse engineering, or sharing of keys allowed.
                                </p>
                            </motion.div>

                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 flex flex-col gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                        <Scale className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Liability</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    Services provided "as is". We are not liable for any damages, data loss, or system issues arising from product use.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
