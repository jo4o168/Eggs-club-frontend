import {useNavigate} from "react-router-dom";
import {useAuth} from "@/contexts/AuthContext";
import {useProfile} from "@/hooks/useProfiles";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {CreditCard, Heart, LayoutDashboard, LogOut, Settings, User} from "lucide-react";

export function UserAvatarMenu() {
    const navigate = useNavigate();
    const {user, profile, producerSettings, signOut} = useAuth();
    const {data: remoteProfile} = useProfile();

    if (!user || !profile) {
        return null;
    }

    const isProducer = profile.role === "producer";
    const displayName = isProducer
        ? producerSettings?.farm_name || remoteProfile?.name || profile.name || "Produtor"
        : remoteProfile?.name || profile.name || "Cliente";
    const roleLabel = isProducer ? "Produtor" : "Cliente";
    const avatarUrl = remoteProfile?.avatar_url || user.avatar_url || null;

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto rounded-full px-1.5 py-1 gap-3">
                    <div className="hidden sm:block text-right leading-tight">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground font-normal">{roleLabel}</p>
                    </div>
                    <span className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/>
                        ) : (
                            <User className="w-5 h-5 text-primary"/>
                        )}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                {isProducer ? (
                    <DropdownMenuItem onClick={() => navigate("/producer/dashboard")}>
                        <LayoutDashboard className="w-4 h-4 mr-2"/>
                        Meu Painel
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem onClick={() => navigate("/customer/perfil")}>
                            <User className="w-4 h-4 mr-2"/>
                            Meu Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/customer/assinatura")}>
                            <Heart className="w-4 h-4 mr-2"/>
                            Minhas Assinaturas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/customer/pagamentos")}>
                            <CreditCard className="w-4 h-4 mr-2"/>
                            Pagamentos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/customer/configuracoes")}>
                            <Settings className="w-4 h-4 mr-2"/>
                            Configurações
                        </DropdownMenuItem>
                    </>
                )}
                {isProducer && (
                    <DropdownMenuItem onClick={() => navigate("/producer/perfil")}>
                        <User className="w-4 h-4 mr-2"/>
                        Meu Perfil
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => void handleLogout()} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2"/>
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
