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
    Package,
    Settings,
    ShoppingCart,
    User,
} from "lucide-react";
import Header from "./Header";

interface DashboardLayoutProps {
    children: ReactNode;
    userType: "producer" | "customer" | "produtor" | "cliente";
}

const DashboardLayout = ({children, userType}: DashboardLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {signOut} = useAuth();

    const produtorLinks = [
        {to: "/producer/dashboard", label: "Início", icon: Home},
        {to: "/producer/produtos", label: "Meus Kit's de Ovos", icon: Package},
        {to: "/producer/planos", label: "Planos de assinatura", icon: Crown},
        {to: "/producer/pedidos", label: "Pedidos", icon: ShoppingCart},
        {to: "/producer/perfil", label: "Meu Perfil", icon: User},
        {to: "/producer/configuracoes", label: "Configurações", icon: Settings},
    ];

    const clienteLinks = [
        {to: "/customer/carrinho", label: "Carrinho", icon: ShoppingCart},
        {to: "/customer/assinatura", label: "Minhas Assinaturas", icon: Heart},
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

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => setSidebarOpen(true)}/>
            <div className="flex min-h-[calc(100vh-4rem)]">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static top-16 lg:top-0 bottom-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
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

                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => void handleLogout()}
                        >
                            <LogOut className="w-5 h-5"/>
                            <span>Sair</span>
                        </Button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
