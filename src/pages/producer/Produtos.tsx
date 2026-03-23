import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
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
import {Plus, Pencil, Trash2, Package} from "lucide-react";
import {toast} from "@/hooks/use-toast";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    image: string;
    active: boolean;
}

const ProdutorProdutos = () => {
    const [products, setProducts] = useState<Product[]>([
        {
            id: 1,
            name: "Ovos Caipiras",
            description: "Ovos frescos de galinhas criadas soltas",
            price: 18.9,
            quantity: 30,
            category: "caipira",
            image: "/placeholder.svg",
            active: true,
        },
        {
            id: 2,
            name: "Ovos Orgânicos",
            description: "Ovos certificados orgânicos",
            price: 24.9,
            quantity: 12,
            category: "organico",
            image: "/placeholder.svg",
            active: true,
        },
        {
            id: 3,
            name: "Ovos de Codorna",
            description: "Ovos de codorna premium",
            price: 15.9,
            quantity: 50,
            category: "codorna",
            image: "/placeholder.svg",
            active: false,
        },
    ]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
    });

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                quantity: product.quantity.toString(),
                category: product.category,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            });
        }
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (editingProduct) {
            setProducts(
                products.map((p) =>
                    p.id === editingProduct.id
                        ? {
                            ...p,
                            name: formData.name,
                            description: formData.description,
                            price: parseFloat(formData.price),
                            quantity: parseInt(formData.quantity),
                            category: formData.category,
                        }
                        : p
                )
            );
            toast({title: "Produto atualizado com sucesso!"});
        } else {
            const newProduct: Product = {
                id: Date.now(),
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                category: formData.category,
                image: "/placeholder.svg",
                active: true,
            };
            setProducts([...products, newProduct]);
            toast({title: "Produto criado com sucesso!"});
        }
        setDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setProducts(products.filter((p) => p.id !== id));
        toast({title: "Produto removido com sucesso!"});
    };

    const toggleActive = (id: number) => {
        setProducts(
            products.map((p) => (p.id === id ? {...p, active: !p.active} : p))
        );
    };

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">
                            Meus Produtos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie seus produtos e estoque
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="hero" onClick={() => handleOpenDialog()}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Novo Produto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do produto</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({...formData, name: e.target.value})
                                        }
                                        placeholder="Ex: Ovos Caipiras"
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
                                        placeholder="Descreva seu produto..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Preço (R$)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({...formData, price: e.target.value})
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantidade</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) =>
                                                setFormData({...formData, quantity: e.target.value})
                                            }
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            setFormData({...formData, category: value})
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="caipira">Caipira</SelectItem>
                                            <SelectItem value="organico">Orgânico</SelectItem>
                                            <SelectItem value="codorna">Codorna</SelectItem>
                                            <SelectItem value="pato">Pato</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Imagem do produto</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                                        <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2"/>
                                        <p className="text-sm text-muted-foreground">
                                            Arraste uma imagem ou clique para enviar
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="hero"
                                    className="w-full"
                                    onClick={handleSave}
                                >
                                    {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card
                            key={product.id}
                            className={`overflow-hidden ${
                                !product.active ? "opacity-60" : ""
                            }`}
                        >
                            <div className="aspect-video bg-secondary relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                <span
                                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                                        product.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                  {product.active ? "Ativo" : "Inativo"}
                </span>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </span>
                                    <span className="text-sm text-muted-foreground">
                    {product.quantity} unidades
                  </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleOpenDialog(product)}
                                    >
                                        <Pencil className="w-4 h-4 mr-1"/>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleActive(product.id)}
                                    >
                                        {product.active ? "Desativar" : "Ativar"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorProdutos;
