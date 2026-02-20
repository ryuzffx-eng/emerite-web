import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* Cinematic Background Effects - Global */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary Light Source (Top Left) */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" />

        {/* Secondary Ambient Glow (Bottom Right) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-emerald-900/20 blur-[180px] rounded-full mix-blend-screen" />

        {/* Cinematic Rays/Beams */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(16,185,129,0.03)_30%,transparent_60%)] opacity-70" />
        <div className="absolute top-0 left-[-20%] w-[150%] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent rotate-12 opacity-40" />
      </div>

      <div className="relative z-10">
        <TopNavigation />

        <main className="transition-all duration-300 min-h-screen flex flex-col pt-20 sm:pt-24 lg:pt-28 pb-12">
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 flex-1">
            <header className="mb-6 sm:mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex flex-col items-start gap-1 pb-4">
                {title && (
                  <h1 className="text-4xl font-black tracking-tighter text-white transition-all uppercase">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-60">
                    {subtitle}
                  </p>
                )}
              </div>
            </header>

            <div className="overflow-x-visible animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
