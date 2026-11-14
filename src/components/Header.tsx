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
            <div className="container h-14 sm:h-16 flex items-center gap-2 sm:gap-3">
                {onMenuClick && (
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-1 hover:bg-secondary rounded-lg shrink-0"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </button>
                )}

                <Link to={homeHref} className="shrink-0 min-w-0">
                    <BrandTitle />
                </Link>

                {!isProducer && (
                    <nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Navegação principal">
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

                {!isProducer && (
                    <div className="hidden md:block flex-1 min-w-0 max-w-xl">
                        <HeaderSearch/>
                    </div>
                )}

                <div className="ml-auto flex items-center gap-0.5 sm:gap-2 shrink-0">
                    <ThemeToggle/>

                    {!loading && (
                        <>
                            {!isProducer && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative rounded-full h-9 w-9 sm:h-10 sm:w-10"
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
                                    <Button variant="hero" size="sm" className="h-9 px-3 sm:px-5 text-sm">
                                        Entrar
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
            {!isProducer && (
                <div className="md:hidden border-t">
                    <div className="container h-12 flex items-center">
                        <HeaderSearch/>
                    </div>
                </div>
            )}
            {!isProducer && !onMenuClick && (
                <nav className="lg:hidden border-t" aria-label="Navegação principal">
                    <div className="container flex items-center justify-around sm:justify-center gap-1 py-1.5">
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
