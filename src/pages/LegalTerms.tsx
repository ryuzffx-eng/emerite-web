import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";

export default function LegalTerms() {
    return (
        <StoreLayout>
            <div className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col items-center justify-center text-center mb-12">
                            <div className="flex items-center gap-6 py-4 w-full">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em]">
                                    Terms of <span className="text-emerald-500">Service</span>
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">
                                Last Updated: February 2026
                            </p>
                        </div>

                        <div className="prose prose-invert prose-emerald max-w-none">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    By accessing and using this website (Emerite Store), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">2. Digital Products & Delivery</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    All products sold on Emerite Store are digital goods. Upon successful payment, you will receive your product key/license instantly via email or through your dashboard. No physical products will be shipped.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">3. Usage License</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    Permission is granted to temporarily download one copy of the materials (software) on Emerite Store's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-6 ml-4">
                                    <li>Modify or copy the materials;</li>
                                    <li>Use the materials for any commercial purpose, or for any public display;</li>
                                    <li>Attempt to decompile or reverse engineer any software contained on Emerite Store's website;</li>
                                    <li>Remove any copyright or other proprietary notations from the materials;</li>
                                    <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-white mb-4">4. Account Security</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    In no event shall Emerite Store or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Emerite Store's website.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">6. Governing Law</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Any claim relating to Emerite Store's website shall be governed by the laws of the State of India without regard to its conflict of law provisions.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
