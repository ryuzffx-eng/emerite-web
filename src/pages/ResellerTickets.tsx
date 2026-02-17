import { DashboardLayout } from "@/components/DashboardLayout";
import { Ticket } from "lucide-react";

export default function ResellerTickets() {
  return (
    <DashboardLayout
      title="Support"
      subtitle="Contact Admin"
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="h-20 w-20 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Ticket className="h-10 w-10 text-zinc-700" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Support Unavailable</h3>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide max-w-sm">Support ticket functionality is currently disabled. Please contact administration via direct channels.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
