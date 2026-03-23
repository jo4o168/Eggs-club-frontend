import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Link} from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
    useSubscriptionPlans,
    useUpdateSubscription
} from "@/hooks/useSubscriptions";
import {useProducers} from "@/hooks/useProfiles";
import {addWeeks, format} from "date-fns";
import {ptBR} from "date-fns/locale";

const ClienteAssinatura = () => {
    const {data: subscriptions = [], isLoading} = useCustomerSubscriptions();
    const {data: producers = []} = useProducers();
    const updateSubscription = useUpdateSubscription();

    const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
    const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [newSubscriptionDialogOpen, setNewSubscriptionDialogOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [pauseDuration, setPauseDuration] = useState("2");
    const [selectedProducerId, setSelectedProducerId] = useState<string>("");

    const {data: availablePlans = []} = useSubscriptionPlans(selectedProducerId || undefined);
    const createSubscription = useCreateSubscription();

    const activeSubscription = subscriptions.find(s => s.status === 'active');
    const currentSubscription = selectedSubscription
        ? subscriptions.find(s => s.id === selectedSubscription)
        : activeSubscription;

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

    const handleResume = async (subscriptionId: string) => {
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
        if (!selectedProducerId || !selectedPlanId) {
            toast({title: "Selecione um producer e um plano", variant: "destructive"});
            return;
        }

        try {
            await createSubscription.mutateAsync({
                planId: selectedPlanId,
                producerId: selectedProducerId,
            });
            setNewSubscriptionDialogOpen(false);
            setSelectedProducerId("");
            setSelectedPlanId("");
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

    const frequencyLabels: Record<string, string> = {
        'semanal': 'Toda semana',
        'quinzenal': 'A cada 2 semanas',
        'mensal': 'Todo mês',
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
                    <Dialog open={newSubscriptionDialogOpen} onOpenChange={setNewSubscriptionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="hero">
                                <Plus className="w-4 h-4 mr-2"/>
                                Nova Assinatura
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nova Assinatura</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Selecione o Produtor</label>
                                    <Select value={selectedProducerId} onValueChange={(v) => {
                                        setSelectedProducerId(v);
                                        setSelectedPlanId("");
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Escolha um produtor"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {producers.map((producer) => (
                                                <SelectItem key={producer.id} value={producer.id}>
                                                    {producer.producer_settings?.farm_name || producer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedProducerId && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Selecione o Plano</label>
                                        {availablePlans.length === 0 ? (
                                            <div className="p-4 bg-secondary/50 rounded-lg text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Este produtor ainda não cadastrou planos de assinatura.
                                                </p>
                                                <Link to={`/produtor/${selectedProducerId}`}
                                                      className="text-sm text-primary hover:underline">
                                                    Ver página do produtor
                                                </Link>
                                            </div>
                                        ) : (
                                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Escolha um plano"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availablePlans.map((plan) => (
                                                        <SelectItem key={plan.id} value={plan.id}>
                                                            {plan.name} -
                                                            R$ {plan.price.toFixed(2).replace('.', ',')}/{plan.frequency}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="hero"
                                    onClick={handleNewSubscription}
                                    disabled={createSubscription.isPending || !selectedProducerId || !selectedPlanId}
                                >
                                    {createSubscription.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                    Assinar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {subscriptions.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura encontrada</h3>
                            <p className="text-muted-foreground mb-4">
                                Comece a receber ovos frescos diretamente dos produtores!
                            </p>
                            <Link to="/produtores">
                                <Button variant="hero">Encontrar Produtores</Button>
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
                                                {subscription.plan?.frequency ? frequencyLabels[subscription.plan.frequency] : 'Frequência variável'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(subscription.status)}
                                        <span className="text-2xl font-bold text-primary">
                      R$ {subscription.plan?.price?.toFixed(2).replace('.', ',') || '0,00'}
                                            <span className="text-sm font-normal text-muted-foreground">
                        /{subscription.plan?.frequency || 'período'}
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
                                                                            <SelectItem key={plan.id} value={plan.id}>
                                                                                {plan.name} -
                                                                                R$ {plan.price.toFixed(2).replace('.', ',')}/{plan.frequency}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
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
