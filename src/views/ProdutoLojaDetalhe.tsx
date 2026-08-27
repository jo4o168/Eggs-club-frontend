import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useMemo, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {usePublicPlans, usePublicProducts} from "@/hooks/usePublicCatalog";
import {CartPurchaseMode, useAddCartItem} from "@/hooks/useCart";
import {toast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/AuthContext";

const ProdutoLojaDetalhe = () => {
    const location = useLocation();
    const {profile} = useAuth();
    const isCustomer = profile?.role === "customer";
    const productId = Number(location.pathname.split("/").pop() ?? 0);

    const {data: products = []} = usePublicProducts();
    const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
    const {data: plans = []} = usePublicPlans(product ? String(product.producer_id) : undefined);

    const [mode, setMode] = useState<CartPurchaseMode>("one_time");
    const [quantity, setQuantity] = useState("1");
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const addCartItem = useAddCartItem();

    const decreaseQuantity = () => {
        const current = Number(quantity);
        const next = Number.isFinite(current) ? Math.max(1, current - 1) : 1;
        setQuantity(String(next));
    };

    const increaseQuantity = () => {
        const current = Number(quantity);
        const next = Number.isFinite(current) ? Math.max(1, current + 1) : 1;
        setQuantity(String(next));
    };

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 container py-10">
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            Produto não encontrado.
                        </CardContent>
                    </Card>
                </main>
                <Footer/>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!isCustomer) {
            toast({title: "Entre com uma conta de cliente para comprar.", variant: "destructive"});
            return;
        }

        if (mode === "subscription" && !selectedPlanId) {
            toast({title: "Selecione um plano de assinatura.", variant: "destructive"});
            return;
        }

        const parsedQuantity = Math.max(1, Number(quantity) || 1);

        void addCartItem.mutateAsync({
            product_id: product.id,
            purchase_mode: mode,
            quantity: parsedQuantity,
            subscription_plan_id: mode === "subscription" ? Number(selectedPlanId) : undefined,
        }).then(() => {
            toast({title: "Produto adicionado ao carrinho!"});
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="overflow-hidden">
                        <div className="h-[360px] bg-secondary flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                            ) : (
                                <div className="text-sm text-muted-foreground">Sem imagem</div>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-5">
                        <h1 className="text-3xl font-display font-semibold">{product.name}</h1>
                        <p className="text-muted-foreground">
                            {product.egg_size} • {product.egg_color} • Kit com {product.kit_quantity ?? 0}
                        </p>

                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Modalidade</p>
                                    <Select value={mode} onValueChange={(v: CartPurchaseMode) => setMode(v)}>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {product.allow_one_time_purchase && <SelectItem value="one_time">Compra única</SelectItem>}
                                            {product.allow_subscription && <SelectItem value="subscription">Assinatura</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {mode === "subscription" && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Plano de assinatura</p>
                                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Escolha um plano"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                                        {plan.name} - R$ {Number(plan.price ?? 0).toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {plans.length === 0 && (
                                            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-1">
                                                <p>
                                                    Não há planos de assinatura <strong>ativos</strong> cadastrados para este
                                                    produtor. O valor da cobrança recorrente vem do plano (frequência, ovos por
                                                    entrega etc.), não só do preço do kit.
                                                </p>
                                                <p>
                                                    O produtor cadastra planos em <strong>Área do produtor → Planos de assinatura</strong>.
                                                    Depois de salvar, a lista de planos aparece aqui automaticamente.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Quantidade</p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={decreaseQuantity}
                                            disabled={mode === "subscription"}
                                        >
                                            <ChevronLeft className="w-4 h-4"/>
                                        </Button>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
                                            onBlur={() => setQuantity(String(Math.max(1, Number(quantity) || 1)))}
                                            className="text-center"
                                            disabled={mode === "subscription"}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={increaseQuantity}
                                            disabled={mode === "subscription"}
                                        >
                                            <ChevronRight className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                    {mode === "subscription" && (
                                        <p className="text-xs text-muted-foreground">
                                            Para assinatura, a quantidade por item no carrinho é sempre 1.
                                        </p>
                                    )}
                                </div>

                                <Button className="w-full" onClick={handleAddToCart} disabled={addCartItem.isPending}>
                                    Adicionar ao carrinho
                                </Button>
                                <Link to="/customer/carrinho">
                                    <Button variant="outline" className="w-full">Ir para o carrinho</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ProdutoLojaDetalhe;
