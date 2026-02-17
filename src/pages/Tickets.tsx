import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoadingOverlay, LoadingSkeletons } from "@/components/LoadingSkeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTickets, getTicket, replyToTicket, closeTicket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Send,
  X,
  Clock,
  CheckCircle,
  RefreshCw,
  User,
  ShieldAlert,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { cn, formatIST } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_by: string;
  created_at: string;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getTickets();
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load tickets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTickets();
      toast({ title: "Tickets refreshed", duration: 2000 });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      const data = await getTicket(id);
      setSelectedTicket(data);
      setDetailsOpen(true);
    } catch (error: any) {
      toast({
        title: "Failed to load ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      await replyToTicket(selectedTicket.id, replyMessage);
      toast({ title: "Reply sent" });
      setReplyMessage("");
      fetchTicketDetails(selectedTicket.id);
    } catch (error: any) {
      toast({
        title: "Failed to send reply",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeTicket(id);
      toast({ title: "Ticket closed" });
      setDetailsOpen(false);
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Failed to close ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Open</span>
          </div>
        );
      case "closed":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <CheckCircle className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Closed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{status}</span>
          </div>
        );
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.created_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Support Tickets">
        <LoadingSkeletons count={4} variant="card" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Support Matrix"
      subtitle="Administrative contact channel"
    >


      <div className="space-y-8 transition-all duration-300">

        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5 sm:p-8 rounded-xl bg-[#111111]/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/5">
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Communications Hub</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{tickets.length} Active Threads</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Input
                type="text"
                placeholder="Search frequencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 sm:h-11 pl-10 bg-zinc-900/50 border-zinc-800 rounded-xl text-xs sm:text-sm font-medium focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="h-10 sm:h-11 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-4 rounded-xl font-bold text-xs uppercase transition-all"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              Sync
            </Button>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => fetchTicketDetails(ticket.id)}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:bg-zinc-900/60 hover:border-orange-500/30 hover:shadow-lg cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
                      <ShieldAlert className="h-5 w-5 text-zinc-500 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.created_by}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatIST(ticket.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(ticket.status)}
                    <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <MessageSquare className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-600 uppercase tracking-widest">No Transmissions</h3>
              <p className="text-xs text-zinc-500 font-medium mt-1">Channel is currently silent</p>
            </div>
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="rounded-xl border-zinc-800 sm:max-w-2xl max-h-[85vh] overflow-hidden bg-zinc-950/98 backdrop-blur-3xl p-0 shadow-2xl">
            {selectedTicket && (
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 sm:p-8 border-b border-zinc-800/50 bg-zinc-900/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <DialogTitle className="text-xl font-bold text-white tracking-tight leading-snug">
                        {selectedTicket.subject}
                      </DialogTitle>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ticket ID: #{selectedTicket.id}</p>
                        <span className="text-zinc-700">•</span>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operator: {selectedTicket.created_by}</p>
                      </div>
                    </div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 sm:p-8">
                  <div className="space-y-6">
                    {selectedTicket.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[85%] space-y-2",
                          msg.is_admin ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {msg.is_admin ? "ADMINISTRATION" : selectedTicket.created_by}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600">
                            {formatIST(msg.created_at, { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "p-4 rounded-xl text-sm font-medium leading-relaxed shadow-lg",
                            msg.is_admin
                              ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-tr-none"
                              : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedTicket.status.toLowerCase() !== "closed" && (
                  <div className="p-6 sm:p-8 bg-zinc-900/50 border-t border-zinc-800/50 space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Type transmission content..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="min-h-[100px] rounded-xl bg-zinc-950 border-zinc-800 focus:border-orange-500/50 resize-none p-4 text-sm font-medium placeholder:text-zinc-600 text-white shadow-inner"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => handleClose(selectedTicket.id)}
                        className="h-12 px-6 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                      >
                        Close Ticket
                      </Button>
                      <Button
                        onClick={handleReply}
                        disabled={!replyMessage.trim()}
                        className="flex-1 h-12 rounded-xl bg-white hover:bg-orange-500 text-zinc-950 font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Transmission
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}