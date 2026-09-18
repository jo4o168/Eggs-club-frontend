import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {Menu, ShoppingCart} from "lucide-react";
import {useMemo} from "react";
import BrandTitle from "./BrandTitle";
import {HeaderSearch} from "./HeaderSearch";
import {ThemeToggle} from "./ThemeToggle";
import {UserAvatarMenu} from "./UserAvatarMenu";
import {serverCartItemCount, useCustomerCart} from "@/hooks/useCart";

type HeaderProps = {
    onMenuClick?: () => void;
};

const Header = ({onMenuClick}: HeaderProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, profile, loading} = useAuth();
    const isProducer = profile?.role === "producer";
    const {data: serverCartItems} = useCustomerCart();
    const cartCount = useMemo(() => {
        if (user && profile?.role === "customer") {
            return serverCartItemCount(serverCartItems);
        }
        return 0;
    }, [user, profile?.role, serverCartItems]);

    const isHomePage = location.pathname === "/";
    const isKitsPage = location.pathname.startsWith("/produtos");
    const isPlansPage = location.pathname.startsWith("/planos");
    const homeHref = isProducer ? "/producer/dashboard" : "/";

    const navLinkClass = (active: boolean) =>
        `rounded-full ${active ? "bg-secondary text-foreground" : ""}`;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container relative h-16 flex items-center">
                <div className="flex items-center gap-2 z-10 min-w-0">
                    {onMenuClick && (
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="lg:hidden p-2 hover:bg-secondary rounded-lg"
                            aria-label="Abrir menu"
                        >
                            <Menu className="w-6 h-6"/>
                        </button>
                    )}
                    {!isProducer && (
                        <nav className="hidden lg:flex items-center gap-2" aria-label="Navegação principal">
                            <Link to="/">
                                <Button variant="ghost" size="sm" className={navLinkClass(isHomePage)}>
                                    Início
                                </Button>
                            </Link>
                            <Link to="/produtos">
                                <Button variant="ghost" size="sm" className={navLinkClass(isKitsPage)}>
                                    Kits de ovos
                                </Button>
                            </Link>
                            <Link to="/planos">
                                <Button variant="ghost" size="sm" className={navLinkClass(isPlansPage)}>
                                    Planos de assinatura
                                </Button>
                            </Link>
                        </nav>
                    )}
                </div>

                <Link
                    to={homeHref}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                    <BrandTitle />
                </Link>

                <div className="ml-auto flex items-center gap-2 z-10">
                    {!isProducer && <HeaderSearch/>}

                    <ThemeToggle/>

                    {!loading && (
                        <>
                            {!isProducer && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full"
                                    onClick={() => navigate(profile?.role === "customer" ? "/customer/carrinho" : "/login")}
                                >
                                    <ShoppingCart className="w-4 h-4"/>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>
                            )}
                            {user && profile ? (
                                <UserAvatarMenu/>
                            ) : (
                                <Link to="/login">
                                    <Button variant="hero" size="sm" className="px-5">Entrar</Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
            {!isProducer && !onMenuClick && (
                <nav className="lg:hidden border-t" aria-label="Navegação principal">
                    <div className="container flex items-center justify-center gap-1 py-2">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className={navLinkClass(isHomePage)}>
                                Início
                            </Button>
                        </Link>
                        <Link to="/produtos">
                            <Button variant="ghost" size="sm" className={navLinkClass(isKitsPage)}>
                                Kits de ovos
                            </Button>
                        </Link>
                        <Link to="/planos">
                            <Button variant="ghost" size="sm" className={navLinkClass(isPlansPage)}>
                                Assinatura
                            </Button>
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
