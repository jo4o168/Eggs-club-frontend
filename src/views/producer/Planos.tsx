import {ChangeEvent, useMemo, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Crown, Loader2, Package, Pencil, Plus, Star, Trash2, Upload} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {
    useCreatePlan,
    useDeletePlan,
    useProducerPlans,
    useTogglePlanActive,
    useTogglePlanFeatured,
    useUpdatePlan
} from "@/hooks/useSubscriptions";
import {useProducts} from "@/hooks/useProducts";

type SubscriptionFrequency = 0 | 1 | 2;

function formatMoney(value: unknown): string {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "0,00";
    return parsed.toFixed(2).replace(".", ",");
}

const ProdutorPlanos = () => {
    const {data: plans = [], isLoading} = useProducerPlans();
    const {data: products = []} = useProducts();
    const createPlan = useCreatePlan();
    const updatePlan = useUpdatePlan();
    const deletePlan = useDeletePlan();
    const togglePlanActive = useTogglePlanActive();
    const togglePlanFeatured = useTogglePlanFeatured();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null);
    const [productSource, setProductSource] = useState<"existing" | "new">("existing");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        frequency: 0 as SubscriptionFrequency,
        is_featured: false,
        product_id: "",
        productName: "",
        productEggSize: "",
        productEggColor: "",
        productKitQuantity: "",
        productDescription: "",
        imageFile: null as File | null,
        imagePreview: "",
    });

    const frequencyLabels: Record<SubscriptionFrequency, string> = {
        0: 'Semanal',
        1: 'Quinzenal',
        2: 'Mensal',
    };

    const takenFrequencies = useMemo(() => {
        if (!editingPlan && productSource === "new") {
            return new Set<SubscriptionFrequency>();
        }
        if (!formData.product_id) {
            return new Set<SubscriptionFrequency>();
        }
        return new Set(
            plans
                .filter((plan) => String(plan.product_id) === formData.product_id)
                .filter((plan) => !editingPlan || plan.id !== editingPlan.id)
                .map((plan) => plan.frequency as SubscriptionFrequency),
        );
    }, [editingPlan, formData.product_id, plans, productSource]);

    const firstAvailableFrequency = (exclude: Set<SubscriptionFrequency>): SubscriptionFrequency => {
        const options: SubscriptionFrequency[] = [0, 1, 2];
        return options.find((option) => !exclude.has(option)) ?? 0;
    };

    const allFrequenciesTaken = takenFrequencies.size >= 3;

    const handleOpenDialog = (plan?: typeof plans[0]) => {
        if (plan) {
            setEditingPlan(plan);
            setProductSource("existing");
            setFormData({
                name: plan.name,
                description: plan.description || "",
                price: plan.price.toString(),
                frequency: plan.frequency,
                is_featured: plan.is_featured || false,
                product_id: plan.product_id ? String(plan.product_id) : "",
                productName: "",
                productEggSize: "",
                productEggColor: "",
                productKitQuantity: "",
                productDescription: "",
                imageFile: null,
                imagePreview: plan.image_url || plan.product?.image_url || "",
            });
        } else {
            setEditingPlan(null);
            setProductSource(products.length > 0 ? "existing" : "new");
            setFormData({
                name: "",
                description: "",
                price: "",
                frequency: 0,
                is_featured: false,
                product_id: "",
                productName: "",
                productEggSize: "",
                productEggColor: "",
                productKitQuantity: "",
                productDescription: "",
                imageFile: null,
                imagePreview: "",
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            toast({title: "Preencha nome e preço do plano", variant: "destructive"});
            return;
        }

        if (takenFrequencies.has(formData.frequency)) {
            toast({
                title: "Periodicidade já usada neste kit",
                description: `Este kit já tem um plano ${frequencyLabels[formData.frequency].toLowerCase()}.`,
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingPlan) {
                if (!formData.product_id) {
                    toast({title: "Selecione o kit deste plano", variant: "destructive"});
                    return;
                }
                await updatePlan.mutateAsync({
                    id: editingPlan.id,
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    frequency: formData.frequency,
                    is_featured: formData.is_featured,
                    product_id: Number(formData.product_id),
                    image_file: formData.imageFile,
                });
            } else if (productSource === "existing") {
                if (!formData.product_id) {
                    toast({title: "Selecione um kit já cadastrado", variant: "destructive"});
                    return;
                }
                await createPlan.mutateAsync({
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    frequency: formData.frequency,
                    is_featured: formData.is_featured,
                    is_active: true,
                    product_id: Number(formData.product_id),
                    image_file: formData.imageFile,
                });
            } else {
                if (!formData.productName || !formData.productEggSize || !formData.productEggColor || !formData.productKitQuantity) {
                    toast({title: "Preencha os dados do kit da assinatura", variant: "destructive"});
                    return;
                }
                await createPlan.mutateAsync({
                    name: formData.name,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    frequency: formData.frequency,
                    is_featured: formData.is_featured,
                    is_active: true,
                    product: {
                        name: formData.productName,
                        egg_size: formData.productEggSize,
                        egg_color: formData.productEggColor,
                        kit_quantity: parseInt(formData.productKitQuantity, 10),
                        description: formData.productDescription || null,
                    },
                    image_file: formData.imageFile,
                });
            }
            setDialogOpen(false);
        } catch {
            // Error handled in hook
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setFormData((prev) => ({...prev, imageFile: file, imagePreview: preview}));
    };

    const selectProductId = (value: string) => {
        const taken = new Set(
            plans
                .filter((plan) => String(plan.product_id) === value)
                .filter((plan) => !editingPlan || plan.id !== editingPlan.id)
                .map((plan) => plan.frequency as SubscriptionFrequency),
        );
        setFormData((prev) => ({
            ...prev,
            product_id: value,
            frequency: taken.has(prev.frequency) ? firstAvailableFrequency(taken) : prev.frequency,
        }));
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) return;
        await deletePlan.mutateAsync(id);
    };

    const toggleActive = async (plan: typeof plans[0]) => {
        await togglePlanActive.mutateAsync(plan.id);
    };

    const toggleFeatured = async (plan: typeof plans[0]) => {
        await togglePlanFeatured.mutateAsync(plan.id);
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
                            Escolha um kit já cadastrado ou crie um kit só para a assinatura.
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Novo Plano
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPlan ? "Editar Plano" : "Novo Plano"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {!editingPlan && (
                                    <div className="space-y-2">
                                        <Label>Kit da assinatura</Label>
                                        <Select
                                            value={productSource}
                                            onValueChange={(value: "existing" | "new") => setProductSource(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="existing" disabled={products.length === 0}>
                                                    Usar um kit já cadastrado
                                                </SelectItem>
                                                <SelectItem value="new">Criar um kit só para esta assinatura</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {(editingPlan || productSource === "existing") && (
                                    <div className="space-y-2">
                                        <Label htmlFor="product_id">Kit *</Label>
                                        <Select
                                            value={formData.product_id || undefined}
                                            onValueChange={selectProductId}
                                        >
                                            <SelectTrigger id="product_id">
                                                <SelectValue placeholder="Selecione o kit"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={String(product.id)}>
                                                        {product.name}
                                                        {product.kit_quantity ? ` · ${product.kit_quantity} ovos` : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {!editingPlan && productSource === "new" && (
                                    <div className="space-y-3 rounded-lg border border-border p-3">
                                        <p className="text-sm font-medium">Novo kit (somente assinatura)</p>
                                        <div className="space-y-2">
                                            <Label htmlFor="productName">Nome do kit *</Label>
                                            <Input
                                                id="productName"
                                                value={formData.productName}
                                                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                                                placeholder="Ex: Kit Assinatura Caipira"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Tamanho *</Label>
                                                <Select
                                                    value={formData.productEggSize}
                                                    onValueChange={(value) => setFormData({...formData, productEggSize: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tamanho"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pequeno">Pequeno</SelectItem>
                                                        <SelectItem value="Médio">Médio</SelectItem>
                                                        <SelectItem value="Grande">Grande</SelectItem>
                                                        <SelectItem value="Extra grande">Extra grande</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cor *</Label>
                                                <Select
                                                    value={formData.productEggColor}
                                                    onValueChange={(value) => setFormData({...formData, productEggColor: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Cor"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Branco">Branco</SelectItem>
                                                        <SelectItem value="Vermelho">Vermelho</SelectItem>
                                                        <SelectItem value="Misto">Misto</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="productKitQuantity">Quantidade por kit *</Label>
                                            <Input
                                                id="productKitQuantity"
                                                type="number"
                                                value={formData.productKitQuantity}
                                                onChange={(e) => setFormData({...formData, productKitQuantity: e.target.value})}
                                                placeholder="30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="productDescription">Descrição do kit</Label>
                                            <Textarea
                                                id="productDescription"
                                                value={formData.productDescription}
                                                onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}

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
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço da assinatura (R$) *</Label>
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
                                    <Label htmlFor="frequency">Frequência</Label>
                                    <Select
                                        value={String(formData.frequency)}
                                        onValueChange={(value) =>
                                            setFormData({...formData, frequency: Number(value) as SubscriptionFrequency})
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a frequência"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {([0, 1, 2] as SubscriptionFrequency[]).map((option) => (
                                                <SelectItem key={option} value={String(option)} disabled={takenFrequencies.has(option)}>
                                                    {frequencyLabels[option]}
                                                    {takenFrequencies.has(option) ? " (já cadastrada neste kit)" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {allFrequenciesTaken ? (
                                        <p className="text-xs text-destructive">
                                            Este kit já tem plano semanal, quinzenal e mensal.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            O mesmo kit não pode ter dois planos com a mesma periodicidade.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planImage">Foto do plano (opcional)</Label>
                                    <label
                                        htmlFor="planImage"
                                        className="block border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/60 hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.imagePreview ? (
                                                <img
                                                    src={formData.imagePreview}
                                                    alt="Prévia do plano"
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-muted-foreground"/>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Clique aqui para selecionar a imagem
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    JPG, PNG, WEBP, AVIF... até 5MB
                                                </p>
                                                {formData.imageFile?.name && (
                                                    <p className="text-xs text-primary mt-1">
                                                        Arquivo: {formData.imageFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                    <Input
                                        id="planImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
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
                                    disabled={createPlan.isPending || updatePlan.isPending || allFrequenciesTaken}
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
                                Vincule um kit a um preço e uma frequência de entrega.
                                
                            </p>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Criar Primeiro Plano
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`h-full flex flex-col overflow-hidden relative border-2 ${
                                    !plan.is_active ? "opacity-60" : ""
                                } ${plan.is_featured ? "border-primary" : "border-border"}`}
                            >
                                {plan.is_featured && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <Badge className="bg-primary text-primary-foreground">
                                            <Star className="w-3 h-3 mr-1"/>
                                            Destaque
                                        </Badge>
                                    </div>
                                )}
                                <div className={`aspect-video bg-secondary relative ${!plan.is_active ? "opacity-60" : ""}`}>
                                    {(plan.image_url || plan.product?.image_url) ? (
                                        <img
                                            src={plan.image_url || plan.product?.image_url || ""}
                                            alt={plan.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-8 h-8 text-muted-foreground"/>
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem]">{plan.name}</CardTitle>
                                        <Badge
                                            className={plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                            {plan.is_active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                                        {plan.description || "Sem descrição"}
                                    </p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Preço</span>
                                            <span className="text-2xl font-bold text-primary">
                                                R$ {formatMoney(plan.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Kit</span>
                                            <span className="font-medium">{plan.product?.name ?? "Sem kit"}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Quantidade</span>
                                            <span className="font-medium">
                                                {plan.product?.kit_quantity ?? plan.eggs_quantity ?? 0} ovos
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Frequência</span>
                                            <span className="font-medium">{frequencyLabels[plan.frequency]}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-auto">
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
