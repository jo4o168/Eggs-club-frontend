import {useEffect, useMemo, useState} from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CartLineItem from "@/components/checkout/CartLineItem";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import {Button} from "@/components/ui/button";
import {usePublicPlans} from "@/hooks/usePublicCatalog";
import {useCustomerCart, useRemoveCartItem, useUpdateCartItem} from "@/hooks/useCart";
import {Link, useNavigate} from "react-router-dom";
import {Loader2, ShoppingBag} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext";

const CarrinhoCliente = () => {
    const navigate = useNavigate();
    const {user, loading: authLoading, isClient} = useAuth();
    const {data: items = [], isLoading, isError, refetch} = useCustomerCart();
    const {data: allPlans = []} = usePublicPlans(undefined);
    const updateItem = useUpdateCartItem();
    const removeItem = useRemoveCartItem();
    const [quantityDraft, setQuantityDraft] = useState<Record<number, string>>({});

    const cartRows = useMemo(
        () =>
            items.map((item) => ({
                item,
                plans: allPlans.filter((plan) => {
                    if (plan.is_active === false) return false;
                    if (item.product?.id && plan.product_id) {
                        return plan.product_id === item.product.id;
                    }
                    return plan.producer_id === item.product?.producer_id;
                }),
            })),
        [items, allPlans],
    );

    useEffect(() => {
        const nextDraft: Record<number, string> = {};
        for (const item of items) {
            nextDraft[item.id] = String(item.quantity);
        }
        setQuantityDraft(nextDraft);
    }, [items]);

    const handleChangeMode = (id: number, mode: "one_time" | "subscription") => {
        void updateItem.mutateAsync({
            id,
            purchase_mode: mode,
            ...(mode === "one_time" ? {subscription_plan_id: null} : {}),
        });
    };

    const handleChangeQuantity = (id: number, quantity: number) => {
        void updateItem.mutateAsync({id, quantity: Math.max(1, quantity || 1)});
    };

    const commitQuantity = (id: number) => {
        const parsed = Math.max(1, Number(quantityDraft[id]) || 1);
        setQuantityDraft((prev) => ({...prev, [id]: String(parsed)}));
        handleChangeQuantity(id, parsed);
    };

    const shiftQuantity = (id: number, delta: number) => {
        const current = Number(quantityDraft[id]);
        const next = Number.isFinite(current) ? Math.max(1, current + delta) : 1;
        setQuantityDraft((prev) => ({...prev, [id]: String(next)}));
        handleChangeQuantity(id, next);
    };

    const missingSubscriptionPlan = cartRows.some(
        (row) => row.item.purchase_mode === "subscription" && !row.item.subscription_plan_id,
    );
    const pending = updateItem.isPending || removeItem.isPending;
    const canContinue = cartRows.length > 0 && !missingSubscriptionPlan && !pending;

    if (!authLoading && (!user || !isClient())) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 container py-16 text-center space-y-4">
                    <h1 className="text-3xl font-display font-semibold">Entre para ver o carrinho</h1>
                    <p className="text-muted-foreground">O carrinho fica salvo na sua conta de cliente.</p>
                    <Button onClick={() => navigate("/login")}>Entrar</Button>
                </main>
                <Footer/>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <CheckoutStepper current="cart"/>
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h1 className="text-3xl font-display font-semibold">Seu carrinho</h1>
                                <p className="text-muted-foreground mt-1">
                                    Revise os kits e as quantidades antes de informar a entrega.
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/produtos">Continuar comprando</Link>
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : isError ? (
                        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
                            <p className="text-muted-foreground">Não foi possível carregar o carrinho.</p>
                            <Button variant="outline" onClick={() => void refetch()}>Tentar novamente</Button>
                        </div>
                    ) : cartRows.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center space-y-4">
                            <ShoppingBag className="h-12 w-12 mx-auto text-primary/70"/>
                            <h2 className="text-2xl font-display font-semibold">Seu carrinho está vazio</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Escolha um kit de ovos na loja para montar o pedido e enviar ao produtor.
                            </p>
                            <Button variant="hero" asChild>
                                <Link to="/produtos">Ver kits de ovos</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                                {cartRows.map(({item, plans}) => (
                                    <CartLineItem
                                        key={item.id}
                                        item={item}
                                        plans={plans}
                                        quantityDraft={quantityDraft[item.id] ?? String(item.quantity)}
                                        pending={pending}
                                        onChangeMode={(mode) => handleChangeMode(item.id, mode)}
                                        onChangePlan={(planId) => void updateItem.mutateAsync({id: item.id, subscription_plan_id: planId})}
                                        onQuantityInput={(value) =>
                                            setQuantityDraft((prev) => ({...prev, [item.id]: value.replace(/[^\d]/g, "")}))
                                        }
                                        onCommitQuantity={() => commitQuantity(item.id)}
                                        onDecrease={() => shiftQuantity(item.id, -1)}
                                        onIncrease={() => shiftQuantity(item.id, 1)}
                                        onRemove={() => void removeItem.mutateAsync(item.id)}
                                    />
                                ))}
                            </div>

                            <div className="lg:sticky lg:top-24 space-y-3">
                                <OrderSummaryCard
                                    items={items}
                                    ctaLabel="Ir para entrega e pagamento"
                                    onCta={() => navigate("/customer/checkout")}
                                    ctaDisabled={!canContinue}
                                    footnote="A entrega é combinada com o produtor após a confirmação do pedido."
                                />
                                {missingSubscriptionPlan ? (
                                    <p className="text-sm text-destructive text-center">
                                        Selecione o plano de cada assinatura para continuar.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default CarrinhoCliente;
