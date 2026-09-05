import {ChangeEvent, useMemo, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Plus, Pencil, Trash2, Package, Upload} from "lucide-react";
import {toast} from "@/hooks/use-toast";
import {useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct} from "@/hooks/useProducts";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";
import {ApiRequestError} from "@/api/http";
import {mapProductApiErrorsToFormKeys, type ProductFormErrorKey} from "@/lib/validationMessages";

function FieldError({msg}: {msg?: string}) {
    if (!msg) return null;
    return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

const ProdutorProdutos = () => {
    const {data: products = []} = useProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogFieldErrors, setDialogFieldErrors] = useState<Partial<Record<ProductFormErrorKey, string>>>({});
    const [editingProduct, setEditingProduct] = useState<(typeof products)[number] | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        eggSize: "",
        eggColor: "",
        kitQuantity: "",
        oneTimePrice: "",
        description: "",
        imageFile: null as File | null,
        imagePreview: "",
    });

    const clearDialogFieldError = (key: ProductFormErrorKey) => {
        setDialogFieldErrors((prev) => {
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const eggSizes = useMemo(
        () => ["Pequeno", "Médio", "Grande", "Extra grande"] as const,
        []
    );

    const eggColors = useMemo(
        () => ["Branco", "Vermelho", "Misto"] as const,
        []
    );

    const toMoney = (value: unknown): string => {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return "0.00";
        return parsed.toFixed(2);
    };

    const handleOpenDialog = (product?: (typeof products)[number]) => {
        setDialogFieldErrors({});
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                eggSize: product.egg_size ?? "",
                eggColor: product.egg_color ?? "",
                kitQuantity: String(product.kit_quantity ?? ""),
                oneTimePrice: product.one_time_price?.toString() ?? "",
                description: product.description ?? "",
                imageFile: null,
                imagePreview: product.image_url ?? "",
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                eggSize: "",
                eggColor: "",
                kitQuantity: "",
                oneTimePrice: "",
                description: "",
                imageFile: null,
                imagePreview: "",
            });
        }
        setDialogOpen(true);
    };

    const isSubscriptionOnly = Boolean(
        editingProduct && !editingProduct.allow_one_time_purchase && editingProduct.allow_subscription,
    );

    const handleSave = async () => {
        if (!formData.name || !formData.eggSize || !formData.eggColor || !formData.kitQuantity) {
            toast({title: "Preencha os campos obrigatórios", variant: "destructive"});
            return;
        }
        if (!isSubscriptionOnly && !formData.oneTimePrice) {
            toast({title: "Informe o preço da compra única", variant: "destructive"});
            return;
        }

        const payload = {
            name: formData.name,
            egg_size: formData.eggSize,
            egg_color: formData.eggColor,
            kit_quantity: Number(formData.kitQuantity),
            one_time_price: formData.oneTimePrice ? Number(formData.oneTimePrice) : null,
            price: Number(formData.oneTimePrice || 0),
            description: formData.description || null,
            image_file: formData.imageFile,
        };

        setDialogFieldErrors({});
        try {
            if (editingProduct) {
                await updateProduct.mutateAsync({id: editingProduct.id, ...payload});
            } else {
                await createProduct.mutateAsync({...payload, is_active: true});
            }
            setDialogOpen(false);
        } catch (e) {
            if (e instanceof ApiRequestError && e.errors) {
                setDialogFieldErrors(mapProductApiErrorsToFormKeys(e.errors));
            }
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setFormData((prev) => ({...prev, imageFile: file, imagePreview: preview}));
    };

    const handleDelete = (id: number) => {
        deleteProduct.mutate(id);
    };

    const toggleActive = (id: number) => {
        const product = products.find((item) => item.id === id);
        if (!product) return;
        updateProduct.mutate({id, is_active: !product.is_active});
        toast({title: "Status do kit de ovos atualizado!"});
    };

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">
                            Meus Kit's de Ovos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Cadastre os kits para venda avulsa. Assinatura é montada em Planos.
                        </p>
                    </div>
                    <Dialog
                        open={dialogOpen}
                        onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) {
                                setDialogFieldErrors({});
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Novo Kit de Ovos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProduct ? "Editar Kit de Ovos" : "Novo Kit de Ovos"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do kit de ovos</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({...formData, name: e.target.value});
                                            clearDialogFieldError("name");
                                        }}
                                        placeholder="Ex: Kit Ovos Caipiras"
                                    />
                                    <FieldError msg={dialogFieldErrors.name}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="eggSize">Tamanho do ovo</Label>
                                        <Select
                                            value={formData.eggSize}
                                            onValueChange={(value) => {
                                                setFormData({...formData, eggSize: value});
                                                clearDialogFieldError("eggSize");
                                            }}
                                        >
                                            <SelectTrigger id="eggSize">
                                                <SelectValue placeholder="Selecione o tamanho"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eggSizes.map((size) => (
                                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError msg={dialogFieldErrors.eggSize}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="eggColor">Cor</Label>
                                        <Select
                                            value={formData.eggColor}
                                            onValueChange={(value) => {
                                                setFormData({...formData, eggColor: value});
                                                clearDialogFieldError("eggColor");
                                            }}
                                        >
                                            <SelectTrigger id="eggColor">
                                                <SelectValue placeholder="Selecione a cor"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eggColors.map((color) => (
                                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError msg={dialogFieldErrors.eggColor}/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kitQuantity">Quantidade por kit</Label>
                                    <Input
                                        id="kitQuantity"
                                        type="number"
                                        value={formData.kitQuantity}
                                        onChange={(e) => {
                                            setFormData({...formData, kitQuantity: e.target.value});
                                            clearDialogFieldError("kitQuantity");
                                        }}
                                        placeholder="Ex: 30"
                                    />
                                    <FieldError msg={dialogFieldErrors.kitQuantity}/>
                                </div>
                                {!isSubscriptionOnly ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="oneTimePrice">Preço da compra única (R$)</Label>
                                        <Input
                                            id="oneTimePrice"
                                            type="number"
                                            step="0.01"
                                            value={formData.oneTimePrice}
                                            onChange={(e) => {
                                                setFormData({...formData, oneTimePrice: e.target.value});
                                                clearDialogFieldError("oneTimePrice");
                                            }}
                                            placeholder="0.00"
                                        />
                                        <FieldError msg={dialogFieldErrors.oneTimePrice}/>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Este kit existe só para assinatura. Preço e frequência ficam no plano.
                                    </p>
                                )}
                                <FieldError msg={dialogFieldErrors.price}/>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData({...formData, description: e.target.value});
                                            clearDialogFieldError("description");
                                        }}
                                        placeholder="Descreva seu kit de ovos..."
                                    />
                                    <FieldError msg={dialogFieldErrors.description}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="productImage">Foto do kit (opcional)</Label>
                                    <label
                                        htmlFor="productImage"
                                        className="block border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/60 hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.imagePreview ? (
                                                <img
                                                    src={formData.imagePreview}
                                                    alt="Prévia do kit"
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
                                        id="productImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleImageChange(e);
                                            clearDialogFieldError("image");
                                        }}
                                        className="hidden"
                                    />
                                    <FieldError msg={dialogFieldErrors.image}/>
                                </div>
                                <Button variant="hero" className="w-full" onClick={handleSave}>
                                    {editingProduct ? "Salvar Alterações" : "Criar Kit de Ovos"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {products.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Nenhum kit cadastrado</h3>
                            <p className="text-muted-foreground mb-4">
                                Cadastre um kit com tamanho, cor e preço da compra única.
                            </p>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Criar Primeiro Kit
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {products.map((product) => (
                        <Card key={product.id} className="h-full flex flex-col overflow-hidden">
                            <div className={`aspect-video bg-secondary relative ${!product.is_active ? "opacity-60" : ""}`}>
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-muted-foreground"/>
                                    </div>
                                )}
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                    {product.is_active ? "Ativo" : "Inativo"}
                                </span>
                            </div>
                            <CardHeader className={`pb-2 ${!product.is_active ? "opacity-60" : ""}`}>
                                <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <div className={!product.is_active ? "opacity-60" : ""}>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                                    <div className="text-sm text-muted-foreground mb-3 space-y-1">
                                    <p>Tamanho: {product.egg_size ?? "Não informado"}</p>
                                    <p>Cor: {product.egg_color ?? "Não informada"}</p>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Kit com {product.kit_quantity ?? 0} ovos</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                        {product.allow_one_time_purchase && product.one_time_price != null && (
                                            <p>Compra única: R$ {toMoney(product.one_time_price)}</p>
                                        )}
                                        {!product.allow_one_time_purchase && product.allow_subscription && (
                                            <p>Somente assinatura</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(product)}>
                                        <Pencil className="w-4 h-4 mr-1"/>
                                        Editar
                                    </Button>
                                    <div className="flex items-center gap-2 px-2 border rounded-md">
                                        <span className="text-xs text-muted-foreground">Ativo</span>
                                        <Switch
                                            checked={product.is_active}
                                            onCheckedChange={() => toggleActive(product.id)}
                                        />
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="w-4 h-4 text-destructive"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir kit de ovos?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Essa ação não pode ser desfeita. O kit será removido permanentemente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                                    Excluir
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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

export default ProdutorProdutos;
