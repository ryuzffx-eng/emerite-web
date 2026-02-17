import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import emeriteLogo from "@/assets/emerite-logo.png";

export const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window !== "undefined") {
            return !sessionStorage.getItem("emerite_loaded");
        }
        return true;
    });

    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem("emerite_loaded", "true");
        }, 2500);
        return () => clearTimeout(timer);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.5, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Outer Pulse Glow */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full"
                        />

                        {/* Main Logo Animation */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, filter: "brightness(0) drop-shadow(0 0 0px #10b981)" }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                filter: "brightness(1) drop-shadow(0 0 20px #10b981)"
                            }}
                            transition={{
                                duration: 1,
                                ease: [0.34, 1.56, 0.64, 1]
                            }}
                        >
                            <img
                                src={emeriteLogo}
                                alt="Emerite"
                                className="h-32 w-32 object-contain"
                            />
                        </motion.div>

                        {/* Loading Text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 flex flex-col items-center gap-4"
                        >
                            <div className="flex items-center gap-[0.5em] text-xl font-black uppercase tracking-[0.2em]">
                                <div className="flex">
                                    {"EMERITE".split("").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                delay: 0.5 + (i * 0.05),
                                                duration: 0.5,
                                                ease: "easeOut"
                                            }}
                                            className="text-white inline-block"
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </div>
                                <div className="flex">
                                    {"STORE".split("").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{
                                                y: 0,
                                                opacity: 1,
                                                color: ["#10b981", "#34d399", "#10b981"],
                                                textShadow: [
                                                    "0 0 10px rgba(16,185,129,0.3)",
                                                    "0 0 20px rgba(16,185,129,0.6)",
                                                    "0 0 10px rgba(16,185,129,0.3)"
                                                ]
                                            }}
                                            transition={{
                                                delay: 0.9 + (i * 0.05),
                                                duration: 2,
                                                color: { repeat: Infinity, duration: 2 },
                                                textShadow: { repeat: Infinity, duration: 2 },
                                                y: { duration: 0.5 },
                                                opacity: { duration: 0.5 }
                                            }}
                                            className="text-emerald-500 inline-block"
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>

                            {/* Animated Scanner Line under text */}
                            <div className="relative w-32 h-[1px] bg-zinc-900 overflow-hidden">
                                <motion.div
                                    animate={{
                                        left: ["-100%", "100%"],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-full"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
