import { StoreLayout } from "@/components/store/StoreLayout";
import { motion } from "framer-motion";

export default function LegalPrivacy() {
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
                                    Privacy <span className="text-emerald-500">Policy</span>
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">
                                Last Updated: February 2026
                            </p>
                        </div>

                        <div className="prose prose-invert prose-emerald max-w-none">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-4">1. Information Collection</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address or mailing address.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">2. Use of Information</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    Any of the information we collect from you may be used in one of the following ways:
                                </p>
                                <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-6 ml-4">
                                    <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
                                    <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you)</li>
                                    <li>To improve customer service (your information helps us to more effectively respond to your customer service requests and support needs)</li>
                                    <li>To process transactions</li>
                                    <li>To send periodic emails</li>
                                </ul>

                                <h3 className="text-xl font-bold text-white mb-4">3. Information Protection</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">4. Cookies</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.
                                </p>

                                <h3 className="text-xl font-bold text-white mb-4">5. Third Party Disclosure</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StoreLayout>
    );
}
