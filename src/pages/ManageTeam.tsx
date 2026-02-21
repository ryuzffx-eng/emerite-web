
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardLoadingSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    Plus,
    Search,
    Trash2,
    Edit,
    MessageSquare,
    Save
} from "lucide-react";

const WhatsAppLogo = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const TelegramLogo = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.824 8.24c-.16 1.688-.864 5.864-1.224 7.784-.152.808-.448 1.08-.736 1.104-.632.056-1.112-.424-1.728-.824-.96-.624-1.504-1.016-2.432-1.624-1.072-.704-.376-1.088.232-1.72.16-.168 2.928-2.688 2.984-2.92.008-.032.008-.152-.064-.216-.072-.064-.176-.04-.256-.024-.112.024-1.888 1.192-5.328 3.512-.504.344-.96.512-1.368.504-.448-.008-1.312-.248-1.952-.456-.784-.256-1.408-.392-1.352-.824.032-.224.336-.456.912-.696 3.568-1.552 5.944-2.576 7.128-3.072 3.392-1.424 4.096-1.672 4.56-1.68.104 0 .336.024.488.152.128.104.168.248.176.352.008.08.016.232 0 .336z" />
    </svg>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    apiRequest
} from "@/lib/api";

export default function ManageTeam() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        avatar_url: "",
        bio: "",
        discord_id: "",
        discord_url: "",
        whatsapp_number: "",
        telegram_username: ""
    });

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const data = await getTeamMembers();
            setTeamMembers(data || []);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to fetch team members",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleCreate = async () => {
        try {
            await createTeamMember(formData);
            toast({
                title: "Success",
                description: "Team member added successfully",
            });
            setIsCreateOpen(false);
            resetForm();
            fetchTeam();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add team member",
                variant: "destructive",
            });
        }
    };

    const handleUpdate = async () => {
        if (!selectedMember) return;
        try {
            await updateTeamMember(selectedMember.id, formData);
            toast({
                title: "Success",
                description: "Team member updated successfully",
            });
            setIsEditOpen(false);
            resetForm();
            fetchTeam();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update team member",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await deleteTeamMember(id);
            toast({
                title: "Success",
                description: "Team member removed successfully",
            });
            fetchTeam();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove team member",
                variant: "destructive",
            });
        }
    };

    const openEdit = (member: any) => {
        setSelectedMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            avatar_url: member.avatar_url || "",
            bio: member.bio || "",
            discord_id: member.discord_id || "",
            discord_url: member.discord_url || "",
            whatsapp_number: member.whatsapp_number || "",
            telegram_username: member.telegram_username || ""
        });
        setIsEditOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            avatar_url: "",
            bio: "",
            discord_id: "",
            discord_url: "",
            twitter_url: "",
            github_url: ""
        });
        setSelectedMember(null);
    };

    const fetchDiscordDetails = async () => {
        if (!formData.discord_id) return;
        try {
            const data = await apiRequest(`/store/team/status/${formData.discord_id}`);
            if (data.discord_user && data.discord_user.id) {
                setFormData(prev => ({
                    ...prev,
                    name: data.discord_user.global_name || data.discord_user.username,
                    avatar_url: `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`,
                    discord_url: `https://discord.com/users/${data.discord_user.id}`
                }));
                toast({ title: "Fetched from Discord", description: `Found ${data.discord_user.username}` });
            } else {
                toast({ title: "Not Found", description: "User not monitored by Lanyard or invalid ID", variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to fetch details", variant: "destructive" });
        }
    };

    const filteredMembers = teamMembers.filter((m: any) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout title="Manage Team" subtitle="Loading team data...">
                <DashboardLoadingSkeleton />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Manage Team" subtitle="Manage your public team roster">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0a0a0a] p-4 rounded-xl border border-zinc-800/60">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search members..."
                            className="pl-9 bg-zinc-900/50 border-zinc-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0c0c0c] border-zinc-800 text-zinc-100 sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add Team Member</DialogTitle>
                                <DialogDescription>Add a new member to the public team page.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800"
                                            placeholder="e.g. Alex Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                                        >
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                                <SelectItem value="DEVELOPER">DEVELOPER</SelectItem>
                                                <SelectItem value="TEAM">TEAM</SelectItem>
                                                <SelectItem value="SUPPORT">SUPPORT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Avatar URL</Label>
                                    <Input
                                        value={formData.avatar_url}
                                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                                        placeholder="Short description..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discord ID (Auto-Fetch)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.discord_id}
                                            onChange={(e) => setFormData({ ...formData, discord_id: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800"
                                            placeholder="e.g. 1415649969888563241"
                                        />
                                        <Button type="button" onClick={fetchDiscordDetails} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
                                            Fetch
                                        </Button>
                                    </div>
                                </div>

                                {formData.role !== 'SUPPORT' && (
                                    <div className={`grid ${formData.role === 'DEVELOPER' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-[10px]"><MessageSquare className="w-3 h-3" /> Discord URL</Label>
                                            <Input
                                                value={formData.discord_url}
                                                onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                                                className="bg-zinc-900 border-zinc-800 text-xs"
                                                placeholder="URL"
                                            />
                                        </div>
                                        {formData.role === 'DEVELOPER' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-[10px]"><WhatsAppLogo className="w-3 h-3" /> WhatsApp</Label>
                                                    <Input
                                                        value={formData.whatsapp_number}
                                                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                                        placeholder="+123..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-[10px]"><TelegramLogo className="w-3 h-3" /> Telegram</Label>
                                                    <Input
                                                        value={formData.telegram_username}
                                                        onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                                        placeholder="@user"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-800 hover:bg-zinc-900 text-zinc-400">Cancel</Button>
                                <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">Create Member</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member: any) => (
                        <div key={member.id} className="group relative bg-[#0c0c0c] border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-5 h-5 text-zinc-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-none mb-1">{member.name}</h3>
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{member.role}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(member)} className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-zinc-500 font-medium mb-4 min-h-[40px] line-clamp-2">
                                {member.bio || "No bio set."}
                            </p>

                            <div className="flex items-center gap-2 pt-4 border-t border-zinc-900">
                                {member.discord_url && <a href={member.discord_url} target="_blank" className="text-zinc-600 hover:text-[#5865F2]"><MessageSquare className="w-4 h-4" /></a>}
                                {member.whatsapp_number && <a href={`https://wa.me/${member.whatsapp_number}`} target="_blank" className="text-zinc-600 hover:text-[#25D366]"><WhatsAppLogo className="w-4 h-4" /></a>}
                                {member.telegram_username && <a href={`https://t.me/${member.telegram_username.replace('@', '')}`} target="_blank" className="text-zinc-600 hover:text-[#0088cc]"><TelegramLogo className="w-4 h-4" /></a>}
                                {!member.discord_url && !member.whatsapp_number && !member.telegram_username && (
                                    <span className="text-xs text-zinc-700 italic">No social links</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredMembers.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-zinc-800/50 border-dashed rounded-xl">
                            <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium">No team members found</p>
                        </div>
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="bg-[#0c0c0c] border-zinc-800 text-zinc-100 sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                            <DialogDescription>Update member details.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(val) => setFormData({ ...formData, role: val })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <SelectItem value="DEVELOPER">DEVELOPER</SelectItem>
                                            <SelectItem value="TEAM">TEAM</SelectItem>
                                            <SelectItem value="SUPPORT">SUPPORT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Avatar URL</Label>
                                <Input
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Discord ID (for Status)</Label>
                                <Input
                                    value={formData.discord_id}
                                    onChange={(e) => setFormData({ ...formData, discord_id: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                    placeholder="e.g. 1415649969888563241"
                                />
                            </div>

                            {formData.role !== 'SUPPORT' && (
                                <div className={`grid ${formData.role === 'DEVELOPER' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-[10px]"><MessageSquare className="w-3 h-3" /> Discord URL</Label>
                                        <Input
                                            value={formData.discord_url}
                                            onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800 text-xs"
                                        />
                                    </div>
                                    {formData.role === 'DEVELOPER' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-[10px]"><WhatsAppLogo className="w-3 h-3" /> WhatsApp</Label>
                                                <Input
                                                    value={formData.whatsapp_number}
                                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                                    className="bg-zinc-900 border-zinc-800 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-[10px]"><TelegramLogo className="w-3 h-3" /> Telegram</Label>
                                                <Input
                                                    value={formData.telegram_username}
                                                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                                                    className="bg-zinc-900 border-zinc-800 text-xs"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-zinc-800 hover:bg-zinc-900 text-zinc-400">Cancel</Button>
                            <Button onClick={handleUpdate} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
