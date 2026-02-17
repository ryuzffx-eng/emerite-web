import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

export default function Contact() {
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
                                    Contact <span className="text-emerald-500">Support</span>
                                </h2>
                                <div className="h-px bg-gradient-to-l from-transparent via-zinc-700 to-zinc-500 flex-1 max-w-[100px] sm:max-w-xs" />
                            </div>
                            <p className="text-zinc-500 text-xs text-center mt-4 font-mono tracking-widest uppercase opacity-70">
                                Global Operations • 24/7 Response
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Contact Info Card */}
                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-8 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300 h-full flex flex-col justify-center gap-8 group">
                                <div>
                                    <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6 border-b border-zinc-800 pb-4">
                                        Communication Channels
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <div className="mt-1 p-2 bg-emerald-500/10 rounded-lg">
                                                <Mail className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Email Support</h4>
                                                <p className="text-zinc-400 text-sm">fuzionstore7@gmail.com</p>
                                                <p className="text-zinc-600 text-[10px] uppercase mt-1 tracking-widest">Response: &lt; 24h</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <div className="mt-1 p-2 bg-blue-500/10 rounded-lg">
                                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Discord Community</h4>
                                                <p className="text-zinc-400 text-sm">Join for live chat</p>
                                                <p className="text-zinc-600 text-[10px] uppercase mt-1 tracking-widest">Status: Online</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                            <div className="mt-1 p-2 bg-purple-500/10 rounded-lg">
                                                <MapPin className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Headquarters</h4>
                                                <p className="text-zinc-400 text-sm">Digital Operations</p>
                                                <p className="text-zinc-600 text-[10px] uppercase mt-1 tracking-widest">Worldwide</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Form Card */}
                            <motion.div variants={item} className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-8 hover:border-emerald-500/20 hover:bg-[#0f0f0f] transition-all duration-300">
                                <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-6 border-b border-zinc-800 pb-4">
                                    Send Direct Message
                                </h3>
                                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Name</label>
                                            <Input className="bg-black/40 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-10 text-sm" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email</label>
                                            <Input className="bg-black/40 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-10 text-sm" placeholder="john@example.com" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                                        <Input className="bg-black/40 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-10 text-sm" placeholder="Inquiry Type..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                        <Textarea className="bg-black/40 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 min-h-[120px] resize-none text-sm" placeholder="Details..." />
                                    </div>

                                    <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20">
                                        <Send className="w-3 h-3 mr-2" />
                                        Transmit Message
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
