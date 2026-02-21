import { motion } from "framer-motion";
import { User, MessageSquare, Scale, Send, Phone } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useEffect, useState } from "react";
import { getPublicTeam, apiRequest } from "@/lib/api";

type DiscordStatus = "online" | "idle" | "dnd" | "offline";




function useDiscordStatus(discordId: string | null) {
    const [status, setStatus] = useState<DiscordStatus>("offline");
    const [isMobile, setIsMobile] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!discordId) {
            setLoading(false);
            return;
        }

        const cleanId = discordId.trim();

        // Initial Fetch via Backend Proxy
        const fetchStatus = async () => {
            try {
                // Use apiRequest to ensure it hits the correct backend URL
                const data = await apiRequest(`/store/team/status/${cleanId}`);

                if (data.status) {
                    setStatus(data.status);
                    setIsMobile(data.is_mobile || false);
                    setIsDesktop(data.is_desktop || false);
                    setActivities(data.activities || []);
                    if (data.discord_user) {
                        setUserData(data.discord_user);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        // WebSocket for Real-time Updates
        let ws: WebSocket | null = null;
        let heartbeatInterval: NodeJS.Timeout;

        const connect = () => {
            ws = new WebSocket("wss://api.lanyard.rest/socket");

            ws.onopen = () => {
                ws?.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: cleanId }
                }));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.op === 1) {
                    heartbeatInterval = setInterval(() => {
                        ws?.send(JSON.stringify({ op: 3 }));
                    }, message.d.heartbeat_interval);
                }

                if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
                    const presence = message.d;
                    if (presence) {
                        setStatus(presence.discord_status);
                        setIsMobile(presence.active_on_discord_mobile || false);
                        setIsDesktop(presence.active_on_discord_desktop || false);
                        setActivities(presence.activities || []);
                        if (presence.discord_user) {
                            setUserData(presence.discord_user);
                        }
                    }
                }
            };

            ws.onclose = () => {
                clearInterval(heartbeatInterval);
            };
        };

        connect();

        return () => {
            clearInterval(heartbeatInterval);
            ws?.close();
        };

    }, [discordId]);

    return { status, userData, activities, loading };
}


// Status Badge Component
const StatusBadge = ({ status }: { status: DiscordStatus }) => {
    const baseClasses = "w-10 h-10 absolute -bottom-1 -right-1 rounded-full border-[7px] border-[#060606] flex items-center justify-center z-20 transition-all duration-300";

    const getStatusBg = () => {
        switch (status) {
            case "online": return "bg-[#23a55a]";
            case "idle": return "bg-[#f0b232]";
            case "dnd": return "bg-[#f23f43]";
            default: return "bg-[#80848e]";
        }
    };

    switch (status) {
        case "online":
            return (
                <div className={`${baseClasses} ${getStatusBg()}`} title="Online" />
            );
        case "idle":
            return (
                <div className={`${baseClasses} ${getStatusBg()}`} title="Idle">
                    <div className="w-5 h-5 bg-[#060606] rounded-full absolute -top-2.5 -left-2.5" />
                </div>
            );
        case "dnd":
            return (
                <div className={`${baseClasses} ${getStatusBg()}`} title="Do Not Disturb">
                    <div className="w-4 h-1 bg-[#060606] rounded-full" />
                </div>
            );
        case "offline":
        default:
            return (
                <div className={`${baseClasses} ${getStatusBg()}`} title="Offline">
                    <div className="w-4 h-4 bg-[#060606] rounded-full" />
                </div>
            );
    }
};


// Role Styles Helper
const getRoleStyles = (role: string) => {
    switch (role?.toUpperCase()) {
        case 'DEVELOPER':
            return {
                bg: 'bg-emerald-500/5',
                border: 'border-emerald-500/20',
                text: 'text-emerald-500/80',
                dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
            };
        case 'TEAM':
            return {
                bg: 'bg-amber-500/5',
                border: 'border-amber-500/20',
                text: 'text-amber-500/80',
                dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
            };
        case 'SUPPORT':
            return {
                bg: 'bg-rose-500/5',
                border: 'border-rose-500/20',
                text: 'text-rose-500/80',
                dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            };
        default:
            return {
                bg: 'bg-zinc-500/5',
                border: 'border-zinc-500/30',
                text: 'text-zinc-500/80',
                dot: 'bg-zinc-600'
            };
    }
};


const DiscordLogo = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2763-3.68-.2763-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" /></svg>
);

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

function TeamMemberCard({ member, index }: { member: any, index: number }) {
    const { status, userData, activities } = useDiscordStatus(member.discord_id);
    const roleStyles = getRoleStyles(member.role);

    // Prefer Discord data if available
    const displayName = userData?.username || member.name;
    const displayAvatar = userData?.id && userData?.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : member.avatar_url;

    // Determine "Real Time Status" (Priority: Game > Listening > Custom)
    const gameActivity = activities?.find((a: any) => a.type === 0);
    const listeningActivity = activities?.find((a: any) => a.type === 2);
    const customStatus = activities?.find((a: any) => a.type === 4);

    let liveStatusText = null;
    if (gameActivity) {
        liveStatusText = `Playing ${gameActivity.name}`;
    } else if (listeningActivity) {
        liveStatusText = listeningActivity.details ? `Listening to ${listeningActivity.details}` : `Listening to ${listeningActivity.name}`;
    } else if (customStatus && customStatus.state) {
        liveStatusText = customStatus.state;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: index * 0.1
            }}
            className="group relative h-full flex flex-col"
        >
            {/* Card Background Layer */}
            <div className="absolute inset-0 bg-[#060606] rounded-2xl border border-zinc-800/60 group-hover:border-emerald-500/30 transition-all duration-500 shadow-2xl" />

            {/* Inner Depth Layer */}
            <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-800/10 to-transparent rounded-2xl pointer-events-none" />

            {/* Role Header - Floating at top right */}
            <div className="absolute top-6 right-6 z-20">
                <div className={`px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-500 ${roleStyles.bg} ${roleStyles.border}`}>
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 transition-colors duration-500 ${roleStyles.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${roleStyles.dot}`} />
                        {member.role}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative p-8 pt-10 flex flex-col items-center text-center z-10 flex-1">
                {/* Avatar Frame */}
                <div className="relative mb-8">
                    {/* Glowing Aura */}
                    <div className={`absolute inset-[-12px] rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${status === 'online' ? 'bg-[#23a55a]' : 'bg-zinc-500'}`} />

                    <div className="relative w-32 h-32 rounded-full overflow-hidden border border-zinc-800/50">
                        {displayAvatar ? (
                            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover transition-all duration-700 brightness-90 group-hover:brightness-100" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <User className="w-14 h-14 text-zinc-800" />
                            </div>
                        )}
                    </div>

                    {/* Discord Status Indicator */}
                    {member.discord_id && <StatusBadge status={status} />}
                </div>

                {/* Identity */}
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors duration-300">
                    {displayName}
                </h3>

                {/* Live Activity Badge */}
                {liveStatusText && (
                    <div className="mb-6 flex justify-center h-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a0a0a] border border-zinc-800/50 shadow-lg scale-95 group-hover:scale-100 transition-transform">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[200px]">
                                {liveStatusText}
                            </span>
                        </div>
                    </div>
                )}

                {/* Bio / Description */}
                {member.bio && (
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-8 px-8 line-clamp-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        {member.bio}
                    </p>
                )}

                {/* Action Footer */}
                <div className="mt-auto w-full pt-6 border-t border-zinc-900/40 flex items-center justify-center gap-8">
                    {/* Discord - Show for DEVELOPER and TEAM */}
                    {(member.role === 'DEVELOPER' || member.role === 'TEAM') && (member.discord_id || member.discord_url) && (
                        <a
                            href={member.discord_id ? `https://discord.com/users/${member.discord_id}` : member.discord_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-[#5865F2] transition-all transform hover:scale-125"
                            title="Discord"
                        >
                            <DiscordLogo className="w-5 h-5" />
                        </a>
                    )}

                    {/* WhatsApp - Only for DEVELOPER */}
                    {member.role === 'DEVELOPER' && member.whatsapp_number && (
                        <a
                            href={`https://wa.me/${member.whatsapp_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-[#25D366] transition-all transform hover:scale-125"
                            title="WhatsApp"
                        >
                            <WhatsAppLogo className="w-5 h-5" />
                        </a>
                    )}

                    {/* Telegram - Only for DEVELOPER */}
                    {member.role === 'DEVELOPER' && member.telegram_username && (
                        <a
                            href={`https://t.me/${member.telegram_username.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-[#0088cc] transition-all transform hover:scale-125"
                            title="Telegram"
                        >
                            <TelegramLogo className="w-5 h-5" />
                        </a>
                    )}

                    {/* Support - No icons as requested */}
                </div>
            </div>
        </motion.div>
    );
}


export default function StoreAbout() {
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        getPublicTeam()
            .then(data => {
                console.log("Team Data Fetched:", data);
                setTeamMembers(data || []);
            })
            .catch(err => console.error("Failed to fetch team:", err));
    }, []);

    return (
        <StoreLayout hideFooter={true}>
            <div className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Team Section */}

                    {/* Team Section */}
                    <div className="mb-32">



                        {(() => {
                            const order = ["DEVELOPER", "TEAM", "SUPPORT"];
                            const grouped = teamMembers.reduce((acc: any, member: any) => {
                                const role = member.role?.toUpperCase() || "TEAM";
                                if (!acc[role]) acc[role] = [];
                                acc[role].push(member);
                                return acc;
                            }, {});

                            return order
                                .filter(role => grouped[role])
                                .map(role => (
                                    <div key={role} className="mb-20">
                                        <div className="flex items-center gap-6 py-4 mb-12">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                                            <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">
                                                {role}
                                            </h3>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                            {grouped[role].map((member: any, i: number) => (
                                                <TeamMemberCard key={member.id || i} member={member} index={i} />
                                            ))}
                                        </div>
                                    </div>
                                ));
                        })()}

                        {teamMembers.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Identifying personnel...</p>
                            </div>
                        )}

                    </div>

                    {/* Legal Agreement specific section removed as per request */}

                </div>
            </div>
        </StoreLayout>
    );
}
