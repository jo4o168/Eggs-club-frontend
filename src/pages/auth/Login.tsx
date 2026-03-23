import {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {Loader2} from "lucide-react";
import {toast} from "@/hooks/use-toast.ts";
import {ProfileRole} from "@/contexts/AuthContext.tsx";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        farmName: "",
        location: "",
    });

    const {signIn, signUp, user, profile} = useAuth();
    const [userType, setUserType] = useState<ProfileRole>(ProfileRole.CLIENT);
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (user && profile) {
            const redirectPath = profile.roles === ProfileRole.PRODUCER
                ? '/producer/dashboard'
                : '/customer/dashboard';
            navigate(redirectPath, {replace: true});
        }
    }, [user, profile, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
            } else {
                await signUp(
                    formData.email,
                    formData.password,
                    formData.name,
                    userType,
                    userType === ProfileRole.PRODUCER ? formData.farmName : undefined,
                    userType === ProfileRole.PRODUCER ? formData.location : undefined
                );
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            toast({
                title: isLogin ? "Erro no login" : "Erro no cadastro",
                description: error.message || "Ocorreu um erro. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 py-16">
                <div className="container max-w-md">
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-display font-semibold mb-2">
                                {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {isLogin
                                    ? "Acesse sua conta para continuar"
                                    : "Junte-se ao Egg's Club hoje mesmo"}
                            </p>
                        </div>

                        {!isLogin && (
                            <Tabs
                                value={userType}
                                onValueChange={(v) => setUserType(v === "producer" ? ProfileRole.PRODUCER : ProfileRole.CLIENT)}
                                className="mb-6"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="cliente">Sou Cliente</TabsTrigger>
                                    <TabsTrigger value="produtor">Sou Produtor</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome completo</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                            </div>

                            {!isLogin && userType === "producer" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="farmName">Nome da propriedade</Label>
                                        <Input
                                            id="farmName"
                                            placeholder="Ex: Sítio Boa Vista"
                                            value={formData.farmName}
                                            onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Localização</Label>
                                        <Input
                                            id="location"
                                            placeholder="Cidade, Estado"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}

                            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        {isLogin ? "Entrando..." : "Criando conta..."}
                                    </>
                                ) : (
                                    isLogin ? "Entrar" : "Criar conta"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-primary hover:underline"
                                disabled={loading}
                            >
                                {isLogin
                                    ? "Não tem conta? Cadastre-se"
                                    : "Já tem conta? Faça login"}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Ao continuar, você concorda com nossos{" "}
                        <Link to="/" className="text-primary hover:underline">
                            Termos de Uso
                        </Link>{" "}
                        e{" "}
                        <Link to="/" className="text-primary hover:underline">
                            Política de Privacidade
                        </Link>
                        .
                    </p>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default Login;
