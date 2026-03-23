import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Crown, Loader2, Pencil, Plus, Star, Trash2} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {useCreatePlan, useDeletePlan, useProducerPlans, useUpdatePlan} from "@/hooks/useSubscriptions";

type SubscriptionFrequency = Database['public']['Enums']['subscription_frequency'];

const ProdutorPlanos = () => {
    const {data: plans = [], isLoading} = useProducerPlans();
    const createPlan = useCreatePlan();
    const updatePlan = useUpdatePlan();
    const deletePlan = useDeletePlan();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        eggs_quantity: "",
        frequency: "semanal" as SubscriptionFrequency,
        is_featured: false,
    });

    const frequencyLabels: Record<SubscriptionFrequency, string> = {
        'semanal': 'Semanal',
        'quinzenal': 'Quinzenal',
        'mensal': 'Mensal',
    };

    const handleOpenDialog = (plan?: typeof plans[0]) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                description: plan.description || "",
                price: plan.price.toString(),
                eggs_quantity: plan.eggs_quantity.toString(),
                frequency: plan.frequency,
                is_featured: plan.is_featured || false,
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                eggs_quantity: "",
                frequency: "semanal",
                is_featured: false,
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.eggs_quantity) {
            toast({title: "Preencha todos os campos obrigatórios", variant: "destructive"});
            return;
        }

        try {
            if (editingPlan) {
                await updatePlan.mutateAsync({
                    id: editingPlan.id,
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    eggs_quantity: parseInt(formData.eggs_quantity),
                    frequency: formData.frequency,
                    is_featured: formData.is_featured,
                });
            } else {
                await createPlan.mutateAsync({
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    eggs_quantity: parseInt(formData.eggs_quantity),
                    frequency: formData.frequency,
                    is_featured: formData.is_featured,
                    is_active: true,
                });
            }
            setDialogOpen(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return;
        await deletePlan.mutateAsync(id);
    };

    const toggleActive = async (plan: typeof plans[0]) => {
        await updatePlan.mutateAsync({
            id: plan.id,
            is_active: !plan.is_active,
        });
    };

    const toggleFeatured = async (plan: typeof plans[0]) => {
        await updatePlan.mutateAsync({
            id: plan.id,
            is_featured: !plan.is_featured,
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="produtor">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">
                            Planos de Assinatura
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Crie e gerencie os planos que os clientes podem assinar
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Novo Plano
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPlan ? "Editar Plano" : "Novo Plano"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do plano *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({...formData, name: e.target.value})
                                        }
                                        placeholder="Ex: Plano Semanal"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({...formData, description: e.target.value})
                                        }
                                        placeholder="Descreva os benefícios do plano..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Preço (R$) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({...formData, price: e.target.value})
                                            }
                                            placeholder="79.90"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="eggs_quantity">Qtd. de Ovos *</Label>
                                        <Input
                                            id="eggs_quantity"
                                            type="number"
                                            value={formData.eggs_quantity}
                                            onChange={(e) =>
                                                setFormData({...formData, eggs_quantity: e.target.value})
                                            }
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="frequency">Frequência</Label>
                                    <Select
                                        value={formData.frequency}
                                        onValueChange={(value: SubscriptionFrequency) =>
                                            setFormData({...formData, frequency: value})
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a frequência"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semanal">Semanal</SelectItem>
                                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                                            <SelectItem value="mensal">Mensal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onChange={(e) =>
                                            setFormData({...formData, is_featured: e.target.checked})
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_featured" className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500"/>
                                        Plano em destaque
                                    </Label>
                                </div>
                                <Button
                                    variant="hero"
                                    className="w-full"
                                    onClick={handleSave}
                                    disabled={createPlan.isPending || updatePlan.isPending}
                                >
                                    {(createPlan.isPending || updatePlan.isPending) && (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                    )}
                                    {editingPlan ? "Salvar Alterações" : "Criar Plano"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Crown className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Nenhum plano cadastrado</h3>
                            <p className="text-muted-foreground mb-4">
                                Crie planos de assinatura para que clientes possam assinar seus produtos
                            </p>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Criar Primeiro Plano
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`overflow-hidden relative ${
                                    !plan.is_active ? "opacity-60" : ""
                                } ${plan.is_featured ? "border-primary border-2" : ""}`}
                            >
                                {plan.is_featured && (
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            <Star className="w-3 h-3 mr-1"/>
                                            Destaque
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="pt-10">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <Badge
                                            className={plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                            {plan.is_active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {plan.description || "Sem descrição"}
                                    </p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Preço</span>
                                            <span className="text-2xl font-bold text-primary">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Quantidade</span>
                                            <span className="font-medium">{plan.eggs_quantity} ovos</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Frequência</span>
                                            <span className="font-medium">{frequencyLabels[plan.frequency]}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDialog(plan)}
                                        >
                                            <Pencil className="w-4 h-4 mr-1"/>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleActive(plan)}
                                        >
                                            {plan.is_active ? "Desativar" : "Ativar"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleFeatured(plan)}
                                        >
                                            <Star
                                                className={`w-4 h-4 ${plan.is_featured ? "text-yellow-500 fill-yellow-500" : ""}`}/>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(plan.id)}
                                            disabled={deletePlan.isPending}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ProdutorPlanos;
