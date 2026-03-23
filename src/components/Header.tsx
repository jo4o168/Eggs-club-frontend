import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {LayoutDashboard, LogOut, User} from "lucide-react";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, profile, signOut, loading} = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!profile) return '/login';
        return profile.role === 'producer' ? '/producer/dashboard' : '/customer/dashboard';
    };

    return (
        <header
            className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-semibold text-primary">
            Egg's Club
          </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                            isActive('/') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                        }`}
                    >
                        Início
                    </Link>
                    <Link
                        to="/planos"
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                            isActive('/planos') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                        }`}
                    >
                        Planos
                    </Link>
                    <Link
                        to="/produtores"
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                            isActive('/produtores') ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground'
                        }`}
                    >
                        Produtores
                    </Link>
                </nav>

                {!loading && (
                    <>
                        {user && profile ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <User className="w-4 h-4"/>
                                        <span className="hidden sm:inline">{profile.name.split(' ')[0]}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                                        <LayoutDashboard className="w-4 h-4 mr-2"/>
                                        Meu Painel
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                        <LogOut className="w-4 h-4 mr-2"/>
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link to="/login">
                                <Button variant="hero" size="sm" className="px-6">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
