import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button} from "./ui/button";
import {useAuth} from "@/contexts/AuthContext";
import {Input} from "./ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {CreditCard, Heart, LayoutDashboard, LogOut, Search, Settings, ShoppingCart, Store, User} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {usePublicProducts} from "@/hooks/usePublicCatalog";
import BrandTitle from "./BrandTitle";
import {ThemeToggle} from "./ThemeToggle";
import {serverCartItemCount, useCustomerCart} from "@/hooks/useCart";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, profile, signOut, loading} = useAuth();
    const {data: serverCartItems} = useCustomerCart();
    const {data: publicProducts = []} = usePublicProducts();

    const [searchValue, setSearchValue] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchValue(params.get("q") ?? "");
    }, [location.search]);

    useEffect(() => {
        if (user && profile?.role === "customer") {
            setCartCount(serverCartItemCount(serverCartItems));
        } else {
            setCartCount(0);
        }
    }, [user, profile?.role, serverCartItems]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!profile) return '/login';
        return profile.role === 'producer' ? '/producer/dashboard' : '/customer/dashboard';
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const value = searchValue.trim();
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        navigate({pathname: "/produtos", search: params.toString() ? `?${params.toString()}` : ""});
        setIsSearchFocused(false);
    };

    const searchSuggestions = useMemo(() => {
        const normalized = searchValue.trim().toLowerCase();
        if (!normalized || normalized.length < 2) return [];
        return publicProducts
            .filter((product) => {
                const name = product.name.toLowerCase();
                const eggSize = (product.egg_size ?? "").toLowerCase();
                const eggColor = (product.egg_color ?? "").toLowerCase();
                return name.includes(normalized) || eggSize.includes(normalized) || eggColor.includes(normalized);
            })
            .slice(0, 6);
    }, [publicProducts, searchValue]);

    const handleSelectSuggestion = (productId: number, productName: string) => {
        const params = new URLSearchParams();
        params.set("q", productName);
        params.set("product", String(productId));
        navigate({pathname: "/produtos", search: `?${params.toString()}`});
        setSearchValue(productName);
        setIsSearchFocused(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container h-16 flex items-center justify-between gap-3">
                <div className="hidden lg:flex items-center gap-2">
                    <Link to="/#assinatura">
                        <Button variant="ghost" size="sm" className="rounded-full">Assinatura</Button>
                    </Link>
                    <Link to="/produtos">
                        <Button variant="ghost" size="sm" className="rounded-full">Kits de Ovos</Button>
                    </Link>
                    <Link to="/#produtores">
                        <Button variant="ghost" size="sm" className="rounded-full">Produtores</Button>
                    </Link>
                </div>

                <Link to="/" className="shrink-0">
                    <BrandTitle />
                </Link>

                <div className="flex items-center gap-2 flex-1 lg:flex-none justify-end">
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex w-full max-w-xs">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"/>
                            <Input
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 120)}
                                placeholder="O que você procura?"
                                className="pl-9 h-9 rounded-full"
                            />
                            {isSearchFocused && searchSuggestions.length > 0 && (
                                <div className="absolute top-11 left-0 right-0 rounded-xl border bg-popover shadow-lg p-2 z-50">
                                    {searchSuggestions.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                                            onClick={() => handleSelectSuggestion(product.id, product.name)}
                                        >
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.egg_size ?? "Tamanho n/d"} • {product.egg_color ?? "Cor n/d"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>

                    <ThemeToggle/>

                    {!loading && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative rounded-full"
                                onClick={() => navigate(profile?.role === "customer" ? "/customer/carrinho" : user ? "/producer/dashboard" : "/login")}
                            >
                                <ShoppingCart className="w-4 h-4"/>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                            {user && profile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <User className="w-4 h-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {profile.role === "customer" ? (
                                            <>
                                                <DropdownMenuItem onClick={() => navigate("/produtos")}>
                                                    <Store className="w-4 h-4 mr-2"/>
                                                    Loja
                                                </DropdownMenuItem>
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
                                        ) : (
                                            <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                                                <LayoutDashboard className="w-4 h-4 mr-2"/>
                                                Meu Painel
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                            <LogOut className="w-4 h-4 mr-2"/>
                                            Sair
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login">
                                    <Button variant="hero" size="sm" className="px-5">Entrar</Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
