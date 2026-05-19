import {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useAuth, ProfileRole} from "@/contexts/AuthContext.tsx";
import {Loader2} from "lucide-react";
import {toast} from "@/hooks/use-toast.ts";
import {ApiRequestError} from "@/api/http";
import {firstMessagePerField} from "@/lib/validationMessages";

type SignupFieldKey = "name" | "email" | "password" | "passwordConfirm" | "farmName" | "location";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [signupFieldErrors, setSignupFieldErrors] = useState<Partial<Record<SignupFieldKey, string>>>({});
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        farmName: "",
        location: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            passwordConfirmation: "",
            farmName: "",
            location: "",
        });
        setSignupFieldErrors({});
    };

    const clearSignupError = (key: SignupFieldKey) => {
        setSignupFieldErrors((prev) => {
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const {signIn, signUp, user} = useAuth();
    const [userType, setUserType] = useState<ProfileRole>(ProfileRole.CLIENT);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("verified") === "1") {
            toast({
                title: "E-mail confirmado",
                description: "Você já pode entrar com sua senha.",
            });
            navigate("/login", {replace: true});
            return;
        }

        const mode = params.get("mode");
        const type = params.get("type");

        if (mode === "signup") {
            setIsLogin(false);
            setSignupFieldErrors({});
        }

        if (type === "producer") {
            setUserType(ProfileRole.PRODUCER);
            setIsLogin(false);
        } else if (type === "customer") {
            setUserType(ProfileRole.CLIENT);
            setIsLogin(false);
        }
    }, [location.search, navigate]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const target = user.roles === ProfileRole.PRODUCER ? "/producer/dashboard" : "/produtos";
            navigate(target, {replace: true});
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
            } else {
                setSignupFieldErrors({});

                if (formData.password !== formData.passwordConfirmation) {
                    setSignupFieldErrors({passwordConfirm: "As senhas não conferem."});
                    throw new Error("As senhas não conferem.");
                }

                const hasLower = /[a-z]/.test(formData.password);
                const hasUpper = /[A-Z]/.test(formData.password);
                const hasNumber = /[0-9]/.test(formData.password);
                const hasSymbol = /[@$!%*#?&]/.test(formData.password);
                const hasMinLength = formData.password.length >= 8;

                if (!(hasLower && hasUpper && hasNumber && hasSymbol && hasMinLength)) {
                    setSignupFieldErrors({
                        password: "Use 8+ caracteres com maiúscula, minúscula, número e um símbolo (@$!%*#?&).",
                    });
                    throw new Error(
                        "A senha deve ter 8+ caracteres, com letra maiúscula, minúscula, número e símbolo.",
                    );
                }

                await signUp(
                    formData.email,
                    formData.password,
                    formData.passwordConfirmation,
                    formData.name,
                    userType,
                    userType === ProfileRole.PRODUCER ? formData.farmName : undefined,
                    userType === ProfileRole.PRODUCER ? formData.location : undefined,
                );
                toast({
                    title: "Conta criada",
                    description:
                        "Enviamos um e-mail para o endereço informado com um link para confirmar sua conta. Abra a mensagem (e a pasta de spam, se precisar) e conclua a verificação antes de fazer login.",
                });
                setIsLogin(true);
                resetForm();
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.";
            if (!isLogin && error instanceof ApiRequestError && error.errors) {
                const f = firstMessagePerField(error.errors);
                setSignupFieldErrors({
                    name: f.name,
                    email: f.email,
                    password: f.password,
                    passwordConfirm: f.password_confirmation,
                    farmName: f.farm_name,
                    location: f.location,
                });
            }
            toast({
                title: isLogin ? "Erro no login" : "Erro no cadastro",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setFormData((prev) => ({...prev, password: "", passwordConfirmation: ""}));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg w-full">
                        {!isLogin && (
                            <Tabs
                                value={userType === ProfileRole.PRODUCER ? "produtor" : "cliente"}
                                onValueChange={(v) => {
                                    setUserType(v === "produtor" ? ProfileRole.PRODUCER : ProfileRole.CLIENT);
                                    setSignupFieldErrors({});
                                }}
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
                                        onChange={(e) => {
                                            setFormData({...formData, name: e.target.value});
                                            clearSignupError("name");
                                        }}
                                        required
                                        disabled={loading}
                                    />
                                    {signupFieldErrors.name && (
                                        <p className="text-xs text-destructive">{signupFieldErrors.name}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({...formData, email: e.target.value});
                                        clearSignupError("email");
                                    }}
                                    required
                                    disabled={loading}
                                />
                                {!isLogin && (
                                    <p className="text-xs text-muted-foreground">
                                        Você entra na loja com este e-mail. Não há campo separado de “usuário”: o
                                        sistema usa o próprio e-mail como identificador único da conta.
                                    </p>
                                )}
                                {signupFieldErrors.email && (
                                    <p className="text-xs text-destructive">{signupFieldErrors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({...formData, password: e.target.value});
                                        clearSignupError("password");
                                    }}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                                {isLogin ? (
                                    <p className="text-right text-sm">
                                        <Link to="/recuperar-senha" className="text-primary hover:underline">
                                            Esqueci minha senha
                                        </Link>
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-xs text-muted-foreground">
                                            Mínimo 8 caracteres, com maiúscula, minúscula, número e um de: @$!%*#?&
                                        </p>
                                        <div className="space-y-2 pt-1">
                                            <Label htmlFor="passwordConfirmation">Confirmar senha</Label>
                                            <Input
                                                id="passwordConfirmation"
                                                type="password"
                                                placeholder="Repita a senha"
                                                value={formData.passwordConfirmation}
                                                onChange={(e) => {
                                                    setFormData({...formData, passwordConfirmation: e.target.value});
                                                    clearSignupError("passwordConfirm");
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            {signupFieldErrors.passwordConfirm && (
                                                <p className="text-xs text-destructive">
                                                    {signupFieldErrors.passwordConfirm}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                                {!isLogin && signupFieldErrors.password && (
                                    <p className="text-xs text-destructive">{signupFieldErrors.password}</p>
                                )}
                            </div>

                            {!isLogin && userType === ProfileRole.PRODUCER && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="farmName">Nome da propriedade</Label>
                                        <Input
                                            id="farmName"
                                            placeholder="Ex: Sítio Boa Vista"
                                            value={formData.farmName}
                                            onChange={(e) => {
                                                setFormData({...formData, farmName: e.target.value});
                                                clearSignupError("farmName");
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                        {signupFieldErrors.farmName && (
                                            <p className="text-xs text-destructive">{signupFieldErrors.farmName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Localização</Label>
                                        <Input
                                            id="location"
                                            placeholder="Cidade, Estado"
                                            value={formData.location}
                                            onChange={(e) => {
                                                setFormData({...formData, location: e.target.value});
                                                clearSignupError("location");
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                        {signupFieldErrors.location && (
                                            <p className="text-xs text-destructive">{signupFieldErrors.location}</p>
                                        )}
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
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setSignupFieldErrors({});
                                }}
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
