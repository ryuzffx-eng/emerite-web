import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
    return (
        <StoreLayout>
            <div className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        <div className="flex flex-col items-center justify-center text-center mb-12">
                            <div className="flex items-center gap-6 py-4 w-full">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em]">
                                    Contact <span className="text-emerald-500">Support</span>
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">
                                Need assistance? We're here to help.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md h-full flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Get in Touch</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-emerald-500/10 rounded-lg">
                                                <Mail className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Email Us</h4>
                                                <p className="text-zinc-400 text-sm">fuzionstore7@gmail.com</p>
                                                <p className="text-zinc-500 text-xs mt-1">Response time: 24-48 hours</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-blue-500/10 rounded-lg">
                                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Live Chat</h4>
                                                <p className="text-zinc-400 text-sm">Available on Discord</p>
                                                <p className="text-zinc-500 text-xs mt-1">Mon-Fri: 9AM - 8PM EST</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-purple-500/10 rounded-lg">
                                                <MapPin className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Location</h4>
                                                <p className="text-zinc-400 text-sm">Digital Operations</p>
                                                <p className="text-zinc-500 text-xs mt-1">Worldwide Service</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Send a Message</h3>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</label>
                                            <Input className="bg-black/20 border-zinc-800 focus:ring-emerald-500/20" placeholder="Your name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
                                            <Input className="bg-black/20 border-zinc-800 focus:ring-emerald-500/20" placeholder="your@email.com" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                                        <Input className="bg-black/20 border-zinc-800 focus:ring-emerald-500/20" placeholder="How can we help?" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                        <Textarea className="bg-black/20 border-zinc-800 focus:ring-emerald-500/20 min-h-[120px]" placeholder="Detailed description of your inquiry..." />
                                    </div>

                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest">
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
