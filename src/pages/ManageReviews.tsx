import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getStoreReviews, deleteStoreReview } from "@/lib/api";
import { Trash2, MessageCircle, Star, User, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatIST } from "@/lib/utils";

export default function ManageReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getStoreReviews();
            setReviews(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch reviews",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await deleteStoreReview(id);
            toast({
                title: "Success",
                description: "Review deleted successfully",
            });
            fetchReviews();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete review",
                variant: "destructive",
            });
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Manage Reviews" subtitle="Moderate client feedback">
            <div className="space-y-6">
                {/* Actions Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0a0a0a] border border-zinc-800/60 p-4 rounded-xl shadow-sm">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search reviews or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchReviews}
                            className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        >
                            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Reviews Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Accessing Feedback Database...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-24 flex flex-col items-center justify-center text-center">
                        <MessageCircle className="h-12 w-12 text-zinc-800 mb-4" />
                        <h3 className="text-white font-bold uppercase tracking-wider mb-2">No Reviews Found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">No feedback matches your current selection or the database is empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-6 group hover:border-zinc-700 transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                            {review.avatar_url ? (
                                                <img src={review.avatar_url} alt={review.username} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-zinc-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{review.username}</h4>
                                            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">{review.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < review.stars ? 'text-emerald-500 fill-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-zinc-900'}`} />
                                    ))}
                                </div>

                                <p className="text-sm text-zinc-400 font-medium leading-relaxed italic line-clamp-3 mb-4">
                                    "{review.content}"
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
                                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">ID: {review.id}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                        {formatIST(review.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
