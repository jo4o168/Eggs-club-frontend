import {ReactNode, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {useAuth} from "@/contexts/AuthContext";
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

interface DashboardLayoutProps {
    children: ReactNode;
    userType: "producer" | "customer";
}

const DashboardLayout = ({children, userType}: DashboardLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {profile, producerSettings, signOut} = useAuth();

    const produtorLinks = [
        {to: "/producer/dashboard", label: "Início", icon: Home},
        {to: "/producer/produtos", label: "Meus Produtos", icon: Package},
        {to: "/producer/planos", label: "Planos de Assinatura", icon: Crown},
        {to: "/producer/pedidos", label: "Pedidos", icon: ShoppingCart},
        {to: "/producer/perfil", label: "Meu Perfil", icon: User},
        {to: "/producer/configuracoes", label: "Configurações", icon: Settings},
    ];

    const clienteLinks = [
        {to: "/customer/dashboard", label: "Início", icon: Home},
        {to: "/customer/assinatura", label: "Minha Assinatura", icon: Heart},
        {to: "/customer/pedidos", label: "Meus Pedidos", icon: History},
        {to: "/customer/pagamentos", label: "Pagamentos", icon: CreditCard},
        {to: "/customer/perfil", label: "Meu Perfil", icon: User},
        {to: "/customer/configuracoes", label: "Configurações", icon: Settings},
    ];

    const links = userType === "producer" ? produtorLinks : clienteLinks;

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const displayName = userType === "producer"
        ? producerSettings?.farm_name || profile?.name || "Produtor"
        : profile?.name || "Cliente";

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
              <span className="text-xl font-display font-semibold text-primary">
                Egg's Club
              </span>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                            {userType === "producer" ? "Área do Produtor" : "Área do Cliente"}
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

                        <div className="flex items-center gap-4 ml-auto">
                            <div className="text-right">
                                <p className="text-sm font-medium">{displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {userType === "producer" ? "Produtor" : "Cliente"}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary"/>
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
