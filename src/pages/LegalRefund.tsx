import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";

export default function LegalRefund() {
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
                                    Refunds & <span className="text-emerald-500">Cancellations</span>
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">
                                Last Updated: February 2026
                            </p>
                        </div>

                        <div className="prose prose-invert prose-emerald max-w-none">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-4">1. Digital Goods Policy</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    Due to the nature of digital products, all sales are considered final once the product key or license has been delivered to you. We cannot offer refunds, exchanges, or cancellations for digital goods that have been accessed or used.
                                </p>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-bold text-red-400">
                                    Please ensure that you read the product description and system requirements carefully before making a purchase.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">2. Exceptions</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    We may consider a refund request under the following exceptional circumstances:
                                </p>
                                <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-6 ml-4">
                                    <li>The product key/license provided is invalid or does not work, and our support team is unable to resolve the issue within 48 hours.</li>
                                    <li>You have not accessed or used the product key/license, and the request is made within 24 hours of purchase.</li>
                                    <li>Standard technical issues that prevent the software from running on compatible systems (proof required).</li>
                                </ul>

                                <h3 className="text-xl font-bold text-white mb-4">3. Refund Process</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    To request a refund, please contact our support team via the <a href="/contact" className="text-emerald-500 hover:text-emerald-400 underline">Contact Us</a> page or email us directly. Please include your order ID and a detailed description of the issue.
                                </p>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    Approved refunds will be processed back to the original payment method within 5-7 business days.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">4. Chargebacks</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-bold text-red-500">
                                    Unauthorized chargebacks or payment disputes will result in an immediate and permanent ban from our platform and revocation of all licenses associated with your account.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
