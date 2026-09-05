import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Link, useLocation} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {usePublicProducts, usePublicProducers} from "@/hooks/usePublicCatalog";
import {useAuth} from "@/contexts/AuthContext";
import {toast} from "@/hooks/use-toast";
import {useAddCartItem} from "@/hooks/useCart";
import {Eye, ShoppingCart} from "lucide-react";

const ProdutosLoja = () => {
    const {profile} = useAuth();
    const addCartItem = useAddCartItem();
    const isCustomer = profile?.role === "customer";
    const isAuthenticated = !!profile;
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = (params.get("q") ?? "").toLowerCase();
    const targetProductId = params.get("product");
    const {data: products = []} = usePublicProducts();
    const {data: producers = []} = usePublicProducers();

    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedProducerId, setSelectedProducerId] = useState<string>("");

    const oneTimeKits = useMemo(
        () => products.filter((product) => product.allow_one_time_purchase !== false),
        [products],
    );

    const sizeOptions = useMemo(
        () => Array.from(new Set(oneTimeKits.map((p) => p.egg_size).filter(Boolean))) as string[],
        [oneTimeKits]
    );
    const colorOptions = useMemo(
        () => Array.from(new Set(oneTimeKits.map((p) => p.egg_color).filter(Boolean))) as string[],
        [oneTimeKits]
    );

    const filteredProducts = useMemo(() => {
        return oneTimeKits.filter((product) => {
            const matchesQuery =
                !query ||
                product.name.toLowerCase().includes(query) ||
                (product.egg_size ?? "").toLowerCase().includes(query) ||
                (product.egg_color ?? "").toLowerCase().includes(query);

            const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.egg_size ?? "");
            const matchesColor = selectedColors.length === 0 || selectedColors.includes(product.egg_color ?? "");
            const matchesProducer = !selectedProducerId || String(product.producer_id) === selectedProducerId;

            return matchesQuery && matchesSize && matchesColor && matchesProducer;
        });
    }, [oneTimeKits, query, selectedSizes, selectedColors, selectedProducerId]);

    const toggleSelection = (value: string, list: string[], setList: (next: string[]) => void) => {
        if (list.includes(value)) {
            setList(list.filter((item) => item !== value));
        } else {
            setList([...list, value]);
        }
    };

    useEffect(() => {
        if (!targetProductId) return;
        const element = document.getElementById(`product-${targetProductId}`);
        if (!element) return;
        setTimeout(() => {
            element.scrollIntoView({behavior: "smooth", block: "center"});
        }, 80);
    }, [targetProductId, filteredProducts.length]);

    const handleAddToCart = (productId: number) => {
        void addCartItem
            .mutateAsync({
                product_id: productId,
                purchase_mode: "one_time",
                quantity: 1,
            })
            .then(() => {
                toast({title: "Produto adicionado ao carrinho!"});
            });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h1 className="section-title text-foreground">Kits de ovos</h1>
                            <p className="text-muted-foreground mt-1">
                                Compra única, sem mensalidade. Prefere receber todo mês?
                            </p>
                        </div>
                        <Link to="/planos">
                            <Button variant="outline">Ver planos de assinatura</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-stretch">
                        <aside className="lg:col-span-1">
                            <Card className="h-full min-h-[22rem]">
                                <CardContent className="p-4 space-y-4">
                                    <h3 className="font-semibold">Filtros</h3>
                                    <div className="space-y-2">
                                        <Label>Produtor</Label>
                                        <select
                                            className="w-full border border-input rounded-md h-10 px-3 bg-background"
                                            value={selectedProducerId}
                                            onChange={(e) => setSelectedProducerId(e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            {producers.map((producer) => (
                                                <option key={producer.id} value={String(producer.id)}>
                                                    {producer.producerSetting?.farm_name || producer.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tamanho do ovo</Label>
                                        {sizeOptions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Nenhuma opção no momento.</p>
                                        ) : sizeOptions.map((size) => (
                                            <label key={size} className="flex items-center gap-2 text-sm">
                                                <Checkbox checked={selectedSizes.includes(size)} onCheckedChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}/>
                                                {size}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cor</Label>
                                        {colorOptions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Nenhuma opção no momento.</p>
                                        ) : colorOptions.map((color) => (
                                            <label key={color} className="flex items-center gap-2 text-sm">
                                                <Checkbox checked={selectedColors.includes(color)} onCheckedChange={() => toggleSelection(color, selectedColors, setSelectedColors)}/>
                                                {color}
                                            </label>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>

                        <section className="lg:col-span-3">
                            {filteredProducts.length === 0 ? (
                                <Card className="h-full min-h-[22rem]">
                                    <CardContent className="p-10 h-full min-h-[22rem] flex flex-col items-center justify-center text-center space-y-3">
                                        <p className="text-muted-foreground">
                                            Nenhum kit de ovos encontrado com os filtros selecionados.
                                        </p>
                                        <Link to="/planos">
                                            <Button variant="outline" size="sm">Ver planos de assinatura</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                                    {filteredProducts.map((product) => (
                                        <Card
                                            id={`product-${product.id}`}
                                            key={product.id}
                                            className={`h-full flex flex-col overflow-hidden transition-all border-2 ${
                                                String(product.id) === targetProductId ? "ring-2 ring-primary shadow-lg border-primary" : "border-border"
                                            }`}
                                        >
                                            <div className="aspect-video bg-secondary shrink-0 flex items-center justify-center">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">Sem imagem</div>
                                                )}
                                            </div>
                                            <CardContent className="p-4 flex-1 flex flex-col gap-2">
                                                <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {product.egg_size} • {product.egg_color} • Kit com {product.kit_quantity ?? 0}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    R$ {Number(product.one_time_price ?? 0).toFixed(2)}
                                                </p>
                                                <div className="mt-auto pt-2">
                                                {isCustomer ? (
                                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                                        <Link to={`/produtos/${product.id}`}>
                                                            <Button size="sm" variant="outline" className="w-full">
                                                                <Eye className="w-4 h-4 mr-1"/>
                                                                Ver produto
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            className="px-3"
                                                            onClick={() => handleAddToCart(product.id)}
                                                            disabled={addCartItem.isPending || !product.allow_one_time_purchase}
                                                            title="Adicionar ao carrinho"
                                                        >
                                                            <ShoppingCart className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                ) : isAuthenticated ? (
                                                    <Link to="/producer/dashboard">
                                                        <Button size="sm" className="w-full">Ir para área do produtor</Button>
                                                    </Link>
                                                ) : (
                                                    <Link to="/login?mode=signup&type=customer">
                                                        <Button size="sm" className="w-full">Cadastrar-se para comprar</Button>
                                                    </Link>
                                                )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ProdutosLoja;
