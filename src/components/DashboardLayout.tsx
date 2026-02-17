import { ReactNode } from "react";
import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#060606] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <TopNavigation />

      <main className="transition-all duration-300 min-h-screen flex flex-col pt-20 sm:pt-24 lg:pt-28 pb-12">
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 flex-1">
          <header className="mb-6 sm:mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col items-start gap-1 pb-4">
              {title && (
                <h1 className="text-4xl font-bold tracking-tight text-white transition-all">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-zinc-500 text-sm font-semibold tracking-tight opacity-60">
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
  );
};
