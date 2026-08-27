import {useEffect, useMemo, useState} from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {ChevronLeft, ChevronRight, Trash2} from "lucide-react";
import {usePublicPlans} from "@/hooks/usePublicCatalog";
import {useCheckoutCart, useCustomerCart, useRemoveCartItem, useUpdateCartItem} from "@/hooks/useCart";
import {usePaymentMethods} from "@/hooks/usePayments";
import {useNavigate} from "react-router-dom";
import {toast} from "@/hooks/use-toast";
import {Label} from "@/components/ui/label";

const CarrinhoCliente = () => {
    const navigate = useNavigate();
    const {data: items = [], isLoading} = useCustomerCart();
    const {data: allPlans = []} = usePublicPlans(undefined);
    const updateItem = useUpdateCartItem();
    const removeItem = useRemoveCartItem();
    const checkout = useCheckoutCart();
    const {data: paymentMethods = []} = usePaymentMethods();
    const [quantityDraft, setQuantityDraft] = useState<Record<number, string>>({});
    const [checkoutPaymentMethodId, setCheckoutPaymentMethodId] = useState<number | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [orderNotes, setOrderNotes] = useState("");

    const cartRows = useMemo(
        () =>
            items.map((item) => ({
                item,
                plans: allPlans.filter((p) => p.producer_id === item.product?.producer_id && p.is_active !== false),
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

    const hasSubscriptionItems = useMemo(
        () => items.some((item) => item.purchase_mode === "subscription"),
        [items],
    );

    useEffect(() => {
        if (paymentMethods.length === 0) {
            setCheckoutPaymentMethodId(null);
            return;
        }
        const preferred =
            paymentMethods.find((p) => p.is_default)?.id ?? paymentMethods[0]?.id ?? null;
        setCheckoutPaymentMethodId(preferred);
    }, [paymentMethods]);

    const handleChangeMode = (id: number, mode: "one_time" | "subscription") => {
        void updateItem.mutateAsync({
            id,
            purchase_mode: mode,
            ...(mode === "one_time" ? {subscription_plan_id: null} : {}),
        });
    };

    const handleChangePlan = (id: number, planId: number) => {
        void updateItem.mutateAsync({id, subscription_plan_id: planId});
    };

    const handleChangeQuantity = (id: number, quantity: number) => {
        void updateItem.mutateAsync({id, quantity: Math.max(1, quantity || 1)});
    };

    const handleQuantityInput = (id: number, value: string) => {
        setQuantityDraft((prev) => ({...prev, [id]: value.replace(/[^\d]/g, "")}));
    };

    const commitQuantity = (id: number) => {
        const parsed = Math.max(1, Number(quantityDraft[id]) || 1);
        setQuantityDraft((prev) => ({...prev, [id]: String(parsed)}));
        handleChangeQuantity(id, parsed);
    };

    const decreaseQuantity = (id: number) => {
        const current = Number(quantityDraft[id]);
        const next = Number.isFinite(current) ? Math.max(1, current - 1) : 1;
        setQuantityDraft((prev) => ({...prev, [id]: String(next)}));
        handleChangeQuantity(id, next);
    };

    const increaseQuantity = (id: number) => {
        const current = Number(quantityDraft[id]);
        const next = Number.isFinite(current) ? Math.max(1, current + 1) : 1;
        setQuantityDraft((prev) => ({...prev, [id]: String(next)}));
        handleChangeQuantity(id, next);
    };

    const handleRemove = (id: number) => {
        void removeItem.mutateAsync(id);
    };

    const handleCheckout = async () => {
        for (const row of cartRows) {
            if (row.item.purchase_mode === "subscription" && !row.item.subscription_plan_id) {
                toast({title: "Selecione um plano para itens de assinatura.", variant: "destructive"});
                return;
            }
        }
        if (hasSubscriptionItems) {
            if (paymentMethods.length === 0) {
                toast({
                    title: "Método de pagamento necessário",
                    description: "Cadastre um cartão ou Pix em Configurações antes de assinar.",
                    variant: "destructive",
                });
                return;
            }
            if (!checkoutPaymentMethodId) {
                toast({title: "Selecione o método de pagamento para a assinatura.", variant: "destructive"});
                return;
            }
        }
        const body: {
            payment_method_id?: number;
            delivery_address?: string | null;
            notes?: string | null;
        } = {};
        if (hasSubscriptionItems && checkoutPaymentMethodId) {
            body.payment_method_id = checkoutPaymentMethodId;
        }
        const addr = deliveryAddress.trim();
        const notes = orderNotes.trim();
        if (addr) body.delivery_address = addr;
        if (notes) body.notes = notes;
        await checkout.mutateAsync(body);
        navigate("/customer/pedidos");
    };

    const checkoutDisabled =
        checkout.isPending ||
        updateItem.isPending ||
        removeItem.isPending ||
        cartRows.some((r) => r.item.purchase_mode === "subscription" && !r.item.subscription_plan_id) ||
        (hasSubscriptionItems && paymentMethods.length === 0);

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container max-w-4xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-display font-semibold">Carrinho</h1>
                        <Button variant="outline" onClick={() => navigate("/produtos")}>Voltar para loja</Button>
                    </div>

                    {isLoading ? (
                        <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">Carregando carrinho…</CardContent>
                        </Card>
                    ) : cartRows.length === 0 ? (
                        <Card>
                            <CardContent className="p-10 text-center text-muted-foreground">
                                Carrinho vazio.
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {cartRows.map(({item, plans}) => (
                                <Card key={item.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <CardTitle>{item.product?.name ?? "Produto"}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    R$ {Number(item.line_total ?? 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {item.purchase_mode === "subscription" ? "Assinatura" : "Compra única"}
                                            </Badge>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-3">
                                            <Select
                                                value={item.purchase_mode}
                                                onValueChange={(v: "one_time" | "subscription") => handleChangeMode(item.id, v)}
                                                disabled={updateItem.isPending}
                                            >
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    {item.product?.allow_one_time_purchase && (
                                                        <SelectItem value="one_time">Compra única</SelectItem>
                                                    )}
                                                    {item.product?.allow_subscription && (
                                                        <SelectItem value="subscription">Assinatura</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>

                                            {item.purchase_mode === "subscription" ? (
                                                <Select
                                                    value={item.subscription_plan_id ? String(item.subscription_plan_id) : ""}
                                                    onValueChange={(v) => handleChangePlan(item.id, Number(v))}
                                                    disabled={updateItem.isPending}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Plano"/></SelectTrigger>
                                                    <SelectContent>
                                                        {plans.map((plan) => (
                                                            <SelectItem key={plan.id} value={String(plan.id)}>
                                                                {plan.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                        disabled={updateItem.isPending}
                                                    >
                                                        <ChevronLeft className="w-4 h-4"/>
                                                    </Button>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={quantityDraft[item.id] ?? String(item.quantity)}
                                                        onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                                                        onBlur={() => commitQuantity(item.id)}
                                                        className="text-center"
                                                        disabled={updateItem.isPending}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => increaseQuantity(item.id)}
                                                        disabled={updateItem.isPending}
                                                    >
                                                        <ChevronRight className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Entrega e observações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery-address">Endereço de entrega</Label>
                                        <Textarea
                                            id="delivery-address"
                                            placeholder="Rua, número, bairro, cidade…"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="order-notes">Observações para o produtor</Label>
                                        <Textarea
                                            id="order-notes"
                                            placeholder="Opcional"
                                            value={orderNotes}
                                            onChange={(e) => setOrderNotes(e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {hasSubscriptionItems && paymentMethods.length > 0 ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Pagamento da assinatura</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Label htmlFor="checkout-pm">Método</Label>
                                        <Select
                                            value={checkoutPaymentMethodId ? String(checkoutPaymentMethodId) : ""}
                                            onValueChange={(v) => setCheckoutPaymentMethodId(Number(v))}
                                        >
                                            <SelectTrigger id="checkout-pm">
                                                <SelectValue placeholder="Selecione"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods.map((pm) => (
                                                    <SelectItem key={pm.id} value={String(pm.id)}>
                                                        {pm.type}
                                                        {pm.last_four ? ` ·••• ${pm.last_four}` : ""}
                                                        {pm.is_default ? " (padrão)" : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {hasSubscriptionItems && paymentMethods.length === 0 ? (
                                <p className="text-sm text-destructive">
                                    Cadastre um método de pagamento em Configurações para finalizar assinaturas.
                                </p>
                            ) : null}

                            <Button className="w-full" onClick={() => void handleCheckout()} disabled={checkoutDisabled}>
                                Finalizar compra
                            </Button>
                        </>
                    )}
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default CarrinhoCliente;
