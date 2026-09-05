import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {usePublicPlans, usePublicProducer, usePublicProducts} from "@/hooks/usePublicCatalog";
import {CartPurchaseMode, useAddCartItem} from "@/hooks/useCart";
import {toast} from "@/hooks/use-toast";
import {ToastAction} from "@/components/ui/toast";
import {useAuth} from "@/contexts/AuthContext";
import {Loader2, MapPin, Minus, Package, Plus, Repeat, ShoppingCart, Truck} from "lucide-react";

const frequencyLabels: Record<number, string> = {
    0: "Semanal",
    1: "Quinzenal",
    2: "Mensal",
};

function formatMoney(value: unknown): string {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "0,00";
    return parsed.toFixed(2).replace(".", ",");
}

const ProdutoLojaDetalhe = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {profile} = useAuth();
    const isCustomer = profile?.role === "customer";
    const productId = Number(location.pathname.split("/").pop() ?? 0);

    const {data: products = [], isLoading} = usePublicProducts();
    const product = useMemo(() => products.find((item) => item.id === productId), [products, productId]);
    const {data: producer} = usePublicProducer(product ? String(product.producer_id) : undefined);
    const {data: allPlans = []} = usePublicPlans(product ? String(product.producer_id) : undefined);
    const plans = useMemo(
        () => allPlans.filter((plan) => plan.product_id === productId && plan.is_active !== false),
        [allPlans, productId],
    );

    const allowOneTime = product?.allow_one_time_purchase !== false;
    const [mode, setMode] = useState<CartPurchaseMode>("one_time");
    const [quantity, setQuantity] = useState(1);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const addCartItem = useAddCartItem();

    useEffect(() => {
        if (product && !allowOneTime) {
            setMode("subscription");
        }
    }, [allowOneTime, product]);

    useEffect(() => {
        if (!selectedPlanId && plans[0]) {
            setSelectedPlanId(String(plans[0].id));
        }
    }, [plans, selectedPlanId]);

    const farmName = producer?.producerSetting?.farm_name || producer?.name;
    const selectedPlan = plans.find((plan) => String(plan.id) === selectedPlanId);
    const displayPrice = mode === "subscription"
        ? Number(selectedPlan?.price ?? product?.subscription_price ?? 0)
        : Number(product?.one_time_price ?? 0);

    const handleAddToCart = () => {
        if (profile?.role === "producer") {
            toast({title: "Compras são para clientes", description: "Entre com uma conta de cliente."});
            return;
        }
        if (!isCustomer) {
            toast({title: "Entre para comprar", description: "Faça login ou cadastre-se como cliente."});
            navigate("/login?mode=signup&type=customer");
            return;
        }
        if (!product) return;
        if (mode === "subscription" && !selectedPlanId) {
            toast({title: "Selecione um plano de assinatura.", variant: "destructive"});
            return;
        }

        void addCartItem.mutateAsync({
            product_id: product.id,
            purchase_mode: mode,
            quantity: mode === "subscription" ? 1 : quantity,
            subscription_plan_id: mode === "subscription" ? Number(selectedPlanId) : undefined,
        }).then(() => {
            toast({
                title: "Adicionado ao carrinho",
                description: "Pode continuar comprando outros kits.",
                action: (
                    <ToastAction altText="Ver carrinho" onClick={() => navigate("/customer/carrinho")}>
                        Ver carrinho
                    </ToastAction>
                ),
            });
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </main>
                <Footer/>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 container py-16 text-center space-y-4">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50"/>
                    <h1 className="text-2xl font-display font-semibold">Kit não encontrado</h1>
                    <p className="text-muted-foreground">Esse kit pode ter saído do catálogo.</p>
                    <Link to="/produtos"><Button variant="outline">Voltar aos kits</Button></Link>
                </main>
                <Footer/>
            </div>
        );
    }

    const specs = [
        {label: "Tamanho do ovo", value: product.egg_size ?? "Não informado"},
        {label: "Cor", value: product.egg_color ?? "Não informada"},
        {label: "Quantidade no kit", value: `${product.kit_quantity ?? 0} ovos`},
        {label: "Tipo de venda", value: allowOneTime ? "Compra única" : "Somente assinatura"},
        {label: "Produtor", value: farmName ?? "Não informado"},
        {label: "Cidade", value: [producer?.producerSetting?.city, producer?.producerSetting?.state].filter(Boolean).join(" / ") || "—"},
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-6 md:py-10">
                <div className="container space-y-10">
                    <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <Link to="/" className="hover:text-foreground">Início</Link>
                        <span>/</span>
                        <Link to="/produtos" className="hover:text-foreground">Kits de ovos</Link>
                        <span>/</span>
                        <span className="text-foreground line-clamp-1">{product.name}</span>
                    </nav>

                    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 lg:gap-14">
                        <div className="lg:sticky lg:top-24 self-start">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Package className="w-10 h-10"/>
                                        <span className="text-sm">Sem imagem</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {farmName && (
                                <Link
                                    to={`/produtores/${product.producer_id}`}
                                    className="text-sm font-medium text-primary hover:underline w-fit"
                                >
                                    {farmName}
                                </Link>
                            )}
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-display font-semibold leading-tight">{product.name}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {[product.egg_size, product.egg_color, product.kit_quantity ? `Kit com ${product.kit_quantity} ovos` : null]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-3xl font-bold text-primary">R$ {formatMoney(displayPrice)}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {mode === "subscription"
                                        ? `Assinatura ${frequencyLabels[selectedPlan?.frequency ?? 0] ?? ""}`.trim()
                                        : "Preço da compra única"}
                                </p>
                            </div>

                            {product.description && (
                                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                            )}

                            {!allowOneTime && plans.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Escolha a periodicidade</p>
                                    <div className="grid gap-2">
                                        {plans.map((plan) => (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => setSelectedPlanId(String(plan.id))}
                                                className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                                                    selectedPlanId === String(plan.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/40"
                                                }`}
                                            >
                                                <p className="font-medium">{plan.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    R$ {formatMoney(plan.price)} / {frequencyLabels[plan.frequency] ?? "entrega"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allowOneTime && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Quantidade</p>
                                    <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity((n) => Math.max(1, n - 1))}>
                                            <Minus className="w-4 h-4"/>
                                        </Button>
                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => setQuantity((n) => n + 1)}>
                                            <Plus className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <Button
                                    variant="hero"
                                    className="w-full"
                                    onClick={handleAddToCart}
                                    disabled={addCartItem.isPending}
                                >
                                    <ShoppingCart className="w-4 h-4"/>
                                    {addCartItem.isPending ? "Adicionando..." : "Adicionar ao carrinho"}
                                </Button>
                                <Link to="/customer/carrinho" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                                    Ver carrinho
                                </Link>
                            </div>

                            <ul className="grid gap-3 text-sm text-muted-foreground pt-2">
                                <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary"/> Entrega combinada com o produtor</li>
                                <li className="flex items-center gap-2"><Repeat className="w-4 h-4 text-primary"/> Prefere recorrência? Veja os planos</li>
                                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Origem local e rastreável</li>
                            </ul>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-border pt-10">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-display font-semibold">Sobre este kit</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description || "Ovos frescos selecionados pelo produtor, prontos para compra única ou para entrar num plano de assinatura."}
                            </p>
                            {allowOneTime && plans.length > 0 && (
                                <p className="text-sm">
                                    Este kit também entra em assinatura.{" "}
                                    <Link to="/planos" className="text-primary underline underline-offset-2">Ver planos</Link>
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-display font-semibold">Detalhes</h2>
                            <dl className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                                {specs.map((spec) => (
                                    <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm bg-card">
                                        <dt className="text-muted-foreground">{spec.label}</dt>
                                        <dd className="font-medium text-right">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ProdutoLojaDetalhe;
