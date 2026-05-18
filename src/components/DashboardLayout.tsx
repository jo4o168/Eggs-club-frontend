import {ReactNode, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {useProfile} from "@/hooks/useProfiles";
import {
    CreditCard,
    Crown,
    Heart,
    History,
    Home,
    LogOut,
    Menu,
    Package,
    Settings,
    ShoppingCart,
    User,
} from "lucide-react";
import BrandTitle from "./BrandTitle";
import {ThemeToggle} from "./ThemeToggle";

interface DashboardLayoutProps {
    children: ReactNode;
    userType: "producer" | "customer" | "produtor" | "cliente";
}

const DashboardLayout = ({children, userType}: DashboardLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {profile, producerSettings, signOut} = useAuth();
    const {data: remoteProfile} = useProfile();

    const produtorLinks = [
        {to: "/producer/dashboard", label: "Início", icon: Home},
        {to: "/producer/produtos", label: "Meus Kit's de Ovos", icon: Package},
        {to: "/producer/planos", label: "Planos de assinatura", icon: Crown},
        {to: "/producer/pedidos", label: "Pedidos", icon: ShoppingCart},
        {to: "/producer/perfil", label: "Meu Perfil", icon: User},
        {to: "/producer/configuracoes", label: "Configurações", icon: Settings},
    ];

    const clienteLinks = [
        {to: "/produtos", label: "Voltar para Loja", icon: ShoppingCart},
        {to: "/customer/dashboard", label: "Início", icon: Home},
        {to: "/customer/assinatura", label: "Minha Assinatura", icon: Heart},
        {to: "/customer/pedidos", label: "Meus Pedidos", icon: History},
        {to: "/customer/pagamentos", label: "Pagamentos", icon: CreditCard},
        {to: "/customer/perfil", label: "Meu Perfil", icon: User},
        {to: "/customer/configuracoes", label: "Configurações", icon: Settings},
    ];

    const normalizedUserType = userType === "produtor" ? "producer" : userType === "cliente" ? "customer" : userType;
    const links = normalizedUserType === "producer" ? produtorLinks : clienteLinks;

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const displayName = normalizedUserType === "producer"
        ? producerSettings?.farm_name || remoteProfile?.name || profile?.name || "Produtor"
        : remoteProfile?.name || profile?.name || "Cliente";

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-border">
                        <Link to="/" className="flex items-center gap-2">
                            <BrandTitle className="text-xl md:text-xl" iconClassName="w-5 h-5 md:w-5 md:h-5" />
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                            {normalizedUserType === "producer" ? "Área do Produtor" : "Área do Cliente"}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-secondary text-foreground"
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="w-5 h-5"/>
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5"/>
                            <span>Sair</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-secondary rounded-lg"
                        >
                            <Menu className="w-6 h-6"/>
                        </button>

                        <div className="flex items-center gap-3 ml-auto">
                            <ThemeToggle/>
                            {normalizedUserType === "customer" && (
                                <Link to="/produtos">
                                    <Button variant="outline" size="sm">Voltar para loja</Button>
                                </Link>
                            )}
                            <div className="text-right">
                                <p className="text-sm font-medium">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {normalizedUserType === "producer" ? "Produtor" : "Cliente"}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                                {remoteProfile?.avatar_url ? (
                                    <img
                                        src={remoteProfile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-primary"/>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
