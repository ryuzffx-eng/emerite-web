import React from "react";
import { StoreNav } from "./StoreNav";

export const StoreLayout = ({ children, hideFooter = false }: { children: React.ReactNode, hideFooter?: boolean }) => {
    return (
        <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
            {/* Cinematic Background Effects - Global */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* silk-bg effect */}
                <div className="silk-bg">
                    <div className="silk-beam" />
                    <div className="silk-beam" style={{ animationDelay: '-7s', opacity: 0.2 }} />
                </div>
            </div>

            <StoreNav />
            <main className="relative z-10">
                {children}
            </main>

            {!hideFooter && (
                <footer className="relative z-10 py-20 px-6 border-t border-zinc-900/50 bg-[#010101]/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                            <div className="col-span-1 md:col-span-2 text-left">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        <span className="text-emerald-500 font-black text-xl">E</span>
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-white uppercase">
                                        EMERITE <span className="text-emerald-500">STORE</span>
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-8 font-medium">
                                    Precision engineering. Binary dominance. The world's most elite marketplace for specialized software tools.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px] text-left">Operations</h4>
                                <ul className="space-y-4 text-[10px] font-bold uppercase text-zinc-500 tracking-tight text-left">
                                    <li><a href="/products" className="hover:text-emerald-500 transition-colors">Private Catalog</a></li>
                                    <li><a href="/store-status" className="hover:text-emerald-500 transition-colors">System Status</a></li>
                                    <li><a href="/reviews" className="hover:text-emerald-500 transition-colors">Verified Reviews</a></li>
                                    <li><a href="/about" className="hover:text-emerald-500 transition-colors">Team Intel</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px] text-left">Legal Entity</h4>
                                <ul className="space-y-4 text-[10px] font-bold uppercase text-zinc-500 tracking-tight text-left">
                                    <li><a href="/legal/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
                                    <li><a href="/legal/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                                    <li><a href="/legal/refund" className="hover:text-emerald-500 transition-colors">Refund Policy</a></li>
                                    <li><a href="/contact" className="hover:text-emerald-500 transition-colors">Contact Support</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.4em]">
                            <p>© 2026 EMERITE STORE PROTOCOL V2.0 // ALL SYSTEMS OPERATIONAL</p>
                            <div className="flex gap-8">
                                <a href="#" className="hover:text-emerald-500 transition-colors">Integrity Status</a>
                                <a href="#" className="hover:text-emerald-500 transition-colors">Binary Safety</a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};
