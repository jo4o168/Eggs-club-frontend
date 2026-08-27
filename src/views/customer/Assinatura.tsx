import {useEffect, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Link} from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Calendar, Edit2, Heart, Loader2, MapPin, Package, Pause, Play, Plus, XCircle} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {
    useCreateSubscription,
    useCustomerSubscriptions,
    useUpdateSubscription
} from "@/hooks/useSubscriptions";
import {usePublicPlans, usePublicProducers, usePublicProducts} from "@/hooks/usePublicCatalog";
import {useCreateOrder} from "@/hooks/useOrders";
import {usePaymentMethods} from "@/hooks/usePayments";
import {addWeeks, format} from "date-fns";
import {ptBR} from "date-fns/locale";

const ClienteAssinatura = () => {
    const {data: subscriptions = [], isLoading} = useCustomerSubscriptions();
    const {data: producers = []} = usePublicProducers();
    const updateSubscription = useUpdateSubscription();

    const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
    const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [newSubscriptionDialogOpen, setNewSubscriptionDialogOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [purchaseMode, setPurchaseMode] = useState<string>("subscription");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [oneTimeQuantity, setOneTimeQuantity] = useState<string>("1");
    const [pauseDuration, setPauseDuration] = useState("2");
    const [selectedProducerId, setSelectedProducerId] = useState<string>("");

    const {data: availablePlans = []} = usePublicPlans(selectedProducerId || undefined);
    const {data: availableProducts = []} = usePublicProducts(selectedProducerId || undefined);
    const createSubscription = useCreateSubscription();
    const createOrder = useCreateOrder();
    const {data: paymentMethods = []} = usePaymentMethods();

    const currentSubscription =
        selectedSubscription != null
            ? subscriptions.find((s) => s.id === selectedSubscription) ?? null
            : null;

    const [newSubPaymentMethodId, setNewSubPaymentMethodId] = useState<number | null>(null);

    useEffect(() => {
        if (!newSubscriptionDialogOpen || purchaseMode !== "subscription") {
            return;
        }
        const preferred =
            paymentMethods.find((p) => p.is_default)?.id ?? paymentMethods[0]?.id ?? null;
        setNewSubPaymentMethodId(preferred);
    }, [newSubscriptionDialogOpen, purchaseMode, paymentMethods]);

    const handlePause = async () => {
        if (!currentSubscription) return;

        const weeks = parseInt(pauseDuration);
        const pauseUntil = addWeeks(new Date(), weeks).toISOString().split('T')[0];

        try {
            await updateSubscription.mutateAsync({
                id: currentSubscription.id,
                status: 'paused',
                pause_until: pauseUntil,
            });
            toast({title: `Assinatura pausada por ${weeks} semana${weeks > 1 ? 's' : ''}`});
            setPauseDialogOpen(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleResume = async (subscriptionId: number) => {
        try {
            await updateSubscription.mutateAsync({
                id: subscriptionId,
                status: 'active',
                pause_until: null,
            });
            toast({title: "Assinatura reativada com sucesso!"});
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleCancel = async () => {
        if (!currentSubscription) return;

        try {
            await updateSubscription.mutateAsync({
                id: currentSubscription.id,
                status: 'cancelled',
            });
            toast({
                title: "Assinatura cancelada",
                description: "Sentiremos sua falta!",
            });
            setCancelDialogOpen(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleChangePlan = async () => {
        if (!currentSubscription || !selectedPlanId) return;

        try {
            await updateSubscription.mutateAsync({
                id: currentSubscription.id,
                plan_id: selectedPlanId,
            });
            toast({title: "Plano atualizado com sucesso!"});
            setChangePlanDialogOpen(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleNewSubscription = async () => {
        if (!selectedProducerId) {
            toast({title: "Selecione um produtor", variant: "destructive"});
            return;
        }

        try {
            if (purchaseMode === "subscription") {
                if (!selectedPlanId) {
                    toast({title: "Selecione um plano", variant: "destructive"});
                    return;
                }

                if (paymentMethods.length > 0 && !newSubPaymentMethodId) {
                    toast({title: "Selecione um método de pagamento", variant: "destructive"});
                    return;
                }

                await createSubscription.mutateAsync({
                    planId: selectedPlanId,
                    producerId: selectedProducerId,
                    payment_method_id: newSubPaymentMethodId ?? undefined,
                });
            } else {
                if (!selectedProductId) {
                    toast({title: "Selecione um kit de ovos", variant: "destructive"});
                    return;
                }

                await createOrder.mutateAsync({
                    product_id: Number(selectedProductId),
                    quantity: Number(oneTimeQuantity || 1),
                });
            }

            setNewSubscriptionDialogOpen(false);
            setSelectedProducerId("");
            setSelectedPlanId("");
            setSelectedProductId("");
            setOneTimeQuantity("1");
            setPurchaseMode("subscription");
            setNewSubPaymentMethodId(null);
        } catch (error) {
            // Error handled in hook
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700">Ativa</Badge>;
            case 'paused':
                return <Badge className="bg-yellow-100 text-yellow-700">Pausada</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700">Cancelada</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const frequencyLabels: Record<number, string> = {
        0: 'Toda semana',
        1: 'A cada 2 semanas',
        2: 'Todo mês',
    };

    const getFrequencyLabel = (value?: number) => {
        if (value === undefined || value === null) return 'Frequência variável';
        return frequencyLabels[value] ?? `Frequência ${value}`;
    };

    const formatMoney = (value: unknown) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return "0,00";
        return parsed.toFixed(2).replace('.', ',');
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="cliente">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">
                            Minhas Assinaturas
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie suas assinaturas e entregas
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Dialog
                            open={newSubscriptionDialogOpen}
                            onOpenChange={(open) => {
                                setNewSubscriptionDialogOpen(open);
                                if (!open) {
                                    setSelectedProducerId("");
                                    setSelectedPlanId("");
                                    setSelectedProductId("");
                                    setOneTimeQuantity("1");
                                    setPurchaseMode("subscription");
                                    setNewSubPaymentMethodId(null);
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Nova compra ou assinatura
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Nova compra ou assinatura</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label>Produtor</Label>
                                        <Select value={selectedProducerId} onValueChange={setSelectedProducerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o produtor"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {producers.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.producerSetting?.farm_name ?? p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Modalidade</Label>
                                        <Select value={purchaseMode} onValueChange={setPurchaseMode}>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="subscription">Assinatura</SelectItem>
                                                <SelectItem value="one_time">Compra única</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {purchaseMode === "subscription" ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Plano</Label>
                                                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Plano"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availablePlans.map((plan) => (
                                                            <SelectItem key={plan.id} value={String(plan.id)}>
                                                                {plan.name} — R$ {formatMoney(plan.price)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {paymentMethods.length > 0 ? (
                                                <div className="space-y-2">
                                                    <Label>Método de pagamento</Label>
                                                    <Select
                                                        value={newSubPaymentMethodId ? String(newSubPaymentMethodId) : ""}
                                                        onValueChange={(v) => setNewSubPaymentMethodId(Number(v))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentMethods.map((pm) => (
                                                                <SelectItem key={pm.id} value={String(pm.id)}>
                                                                    {pm.type}
                                                                    {pm.last_four ? ` ·••• ${pm.last_four}` : ""}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Kit de ovos</Label>
                                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Produto"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableProducts.map((prod) => (
                                                            <SelectItem key={prod.id} value={String(prod.id)}>
                                                                {prod.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Quantidade</Label>
                                                <Select value={oneTimeQuantity} onValueChange={setOneTimeQuantity}>
                                                    <SelectTrigger>
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                                            <SelectItem key={n} value={String(n)}>
                                                                {n}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    <Button
                                        variant="hero"
                                        className="w-full"
                                        onClick={() => void handleNewSubscription()}
                                        disabled={createSubscription.isPending || createOrder.isPending}
                                    >
                                        {(createSubscription.isPending || createOrder.isPending) && (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        )}
                                        Confirmar
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Link to="/produtos">
                            <Button variant="hero">
                                Conhecer novos planos ou produtos
                            </Button>
                        </Link>
                    </div>
                </div>

                {subscriptions.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura encontrada</h3>
                            <p className="text-muted-foreground mb-4">
                                Comece a receber ovos frescos diretamente dos produtores!
                            </p>
                            <Link to="/produtos">
                                <Button variant="hero">Ir para a loja</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    subscriptions.map((subscription) => (
                        <Card key={subscription.id}
                              className={subscription.status === 'active' ? "border-primary/20" : ""}>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-6 h-6 text-primary"/>
                                        <div>
                                            <CardTitle
                                                className="text-xl">{subscription.plan?.name || 'Plano Personalizado'}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {getFrequencyLabel(subscription.plan?.frequency)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(subscription.status)}
                                        <span className="text-2xl font-bold text-primary">
                      R$ {subscription.plan?.price?.toFixed(2).replace('.', ',') || '0,00'}
                                            <span className="text-sm font-normal text-muted-foreground">
                        /{getFrequencyLabel(subscription.plan?.frequency)}
                      </span>
                    </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Producer Info */}
                                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                                    <div
                                        className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Package className="w-8 h-8 text-primary"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {subscription.producer?.producer_settings?.farm_name || subscription.producer?.name || 'Produtor'}
                                        </p>
                                        {subscription.producer?.producer_settings && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-4 h-4"/>
                                                {subscription.producer.producer_settings.city}, {subscription.producer.producer_settings.state}
                                            </p>
                                        )}
                                    </div>
                                    <Link to={`/produtor/${subscription.producer_id}`}>
                                        <Button variant="outline" size="sm">
                                            Ver Produtor
                                        </Button>
                                    </Link>
                                </div>

                                {/* Items */}
                                {subscription.plan && (
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary"/>
                                            Itens da Assinatura
                                        </h4>
                                        <div
                                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                            <span>Ovos Caipiras</span>
                                            <span
                                                className="font-medium">{subscription.plan.eggs_quantity} unidades</span>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary"/>
                                            Próxima Entrega
                                        </h4>
                                        <p className="text-lg font-semibold">
                                            {subscription.next_delivery_date
                                                ? format(new Date(subscription.next_delivery_date), "dd 'de' MMMM, yyyy", {locale: ptBR})
                                                : 'A definir'
                                            }
                                        </p>
                                        {subscription.pause_until && (
                                            <p className="text-sm text-yellow-600">
                                                Pausado até {format(new Date(subscription.pause_until), "dd/MM/yyyy")}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary"/>
                                            Início da Assinatura
                                        </h4>
                                        <p className="text-lg font-semibold">
                                            {format(new Date(subscription.start_date), "dd 'de' MMMM, yyyy", {locale: ptBR})}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {subscription.status !== 'cancelled' && (
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                        {subscription.status === 'paused' ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleResume(subscription.id)}
                                                disabled={updateSubscription.isPending}
                                            >
                                                <Play className="w-4 h-4 mr-2"/>
                                                Reativar Assinatura
                                            </Button>
                                        ) : (
                                            <>
                                                <Dialog
                                                    open={changePlanDialogOpen && selectedSubscription === subscription.id}
                                                    onOpenChange={(open) => {
                                                        setChangePlanDialogOpen(open);
                                                        if (open) {
                                                            setSelectedSubscription(subscription.id);
                                                            setSelectedProducerId(subscription.producer_id);
                                                        }
                                                    }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline">
                                                            <Edit2 className="w-4 h-4 mr-2"/>
                                                            Alterar Plano
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Alterar Plano</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">
                                                                    Selecione o novo plano
                                                                </label>
                                                                <Select value={selectedPlanId}
                                                                        onValueChange={setSelectedPlanId}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Escolha um plano"/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availablePlans.map((plan) => (
                                                                            <SelectItem key={plan.id} value={String(plan.id)}>
                                                                                {plan.name} -
                                                                                R$ {formatMoney(plan.price)}/{plan.frequency}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {availablePlans.length === 0 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Nenhum plano ativo encontrado para este produtor.
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="hero"
                                                                className="w-full"
                                                                onClick={handleChangePlan}
                                                                disabled={updateSubscription.isPending || !selectedPlanId}
                                                            >
                                                                {updateSubscription.isPending &&
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                                                Confirmar Alteração
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog
                                                    open={pauseDialogOpen && selectedSubscription === subscription.id}
                                                    onOpenChange={(open) => {
                                                        setPauseDialogOpen(open);
                                                        if (open) setSelectedSubscription(subscription.id);
                                                    }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline">
                                                            <Pause className="w-4 h-4 mr-2"/>
                                                            Pausar Assinatura
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Pausar Assinatura</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <p className="text-muted-foreground">
                                                                Por quanto tempo você deseja pausar sua assinatura?
                                                            </p>
                                                            <Select value={pauseDuration}
                                                                    onValueChange={setPauseDuration}>
                                                                <SelectTrigger>
                                                                    <SelectValue/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="1">1 semana</SelectItem>
                                                                    <SelectItem value="2">2 semanas</SelectItem>
                                                                    <SelectItem value="4">1 mês</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Button
                                                                variant="hero"
                                                                className="w-full"
                                                                onClick={handlePause}
                                                                disabled={updateSubscription.isPending}
                                                            >
                                                                {updateSubscription.isPending &&
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                                                Confirmar Pausa
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </>
                                        )}

                                        <Dialog open={cancelDialogOpen && selectedSubscription === subscription.id}
                                                onOpenChange={(open) => {
                                                    setCancelDialogOpen(open);
                                                    if (open) setSelectedSubscription(subscription.id);
                                                }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="text-destructive">
                                                    <XCircle className="w-4 h-4 mr-2"/>
                                                    Cancelar Assinatura
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Cancelar Assinatura</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <p className="text-muted-foreground">
                                                        Tem certeza que deseja cancelar sua assinatura? Você perderá
                                                        todos os benefícios e não receberá mais entregas.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => setCancelDialogOpen(false)}
                                                        >
                                                            Manter Assinatura
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="flex-1"
                                                            onClick={handleCancel}
                                                            disabled={updateSubscription.isPending}
                                                        >
                                                            {updateSubscription.isPending &&
                                                                <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                                            Confirmar Cancelamento
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default ClienteAssinatura;
