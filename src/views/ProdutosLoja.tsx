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
    const [showSubscription, setShowSubscription] = useState(false);
    const [showOneTime, setShowOneTime] = useState(false);
    const [selectedProducerId, setSelectedProducerId] = useState<string>("");

    const sizeOptions = useMemo(
        () => Array.from(new Set(products.map((p) => p.egg_size).filter(Boolean))) as string[],
        [products]
    );
    const colorOptions = useMemo(
        () => Array.from(new Set(products.map((p) => p.egg_color).filter(Boolean))) as string[],
        [products]
    );

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesQuery =
                !query ||
                product.name.toLowerCase().includes(query) ||
                (product.egg_size ?? "").toLowerCase().includes(query) ||
                (product.egg_color ?? "").toLowerCase().includes(query);

            const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.egg_size ?? "");
            const matchesColor = selectedColors.length === 0 || selectedColors.includes(product.egg_color ?? "");
            const matchesProducer = !selectedProducerId || String(product.producer_id) === selectedProducerId;
            const matchesSubscription = !showSubscription || !!product.allow_subscription;
            const matchesOneTime = !showOneTime || !!product.allow_one_time_purchase;

            return matchesQuery && matchesSize && matchesColor && matchesProducer && matchesSubscription && matchesOneTime;
        });
    }, [products, query, selectedSizes, selectedColors, selectedProducerId, showSubscription, showOneTime]);

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
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <aside className="space-y-4">
                            <Card>
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
                                        {sizeOptions.map((size) => (
                                            <label key={size} className="flex items-center gap-2 text-sm">
                                                <Checkbox checked={selectedSizes.includes(size)} onCheckedChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}/>
                                                {size}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cor</Label>
                                        {colorOptions.map((color) => (
                                            <label key={color} className="flex items-center gap-2 text-sm">
                                                <Checkbox checked={selectedColors.includes(color)} onCheckedChange={() => toggleSelection(color, selectedColors, setSelectedColors)}/>
                                                {color}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Modalidade</Label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={showSubscription} onCheckedChange={(v) => setShowSubscription(Boolean(v))}/>
                                            Com assinatura
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={showOneTime} onCheckedChange={(v) => setShowOneTime(Boolean(v))}/>
                                            Compra única
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>

                        <section className="lg:col-span-3">
                            {filteredProducts.length === 0 ? (
                                <Card>
                                    <CardContent className="p-10 text-center text-muted-foreground">
                                        Nenhum kit encontrado com os filtros selecionados.
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredProducts.map((product) => (
                                        <Card
                                            id={`product-${product.id}`}
                                            key={product.id}
                                            className={`overflow-hidden transition-all ${
                                                String(product.id) === targetProductId ? "ring-2 ring-primary shadow-lg" : ""
                                            }`}
                                        >
                                            <div className="h-40 bg-secondary flex items-center justify-center">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">Sem imagem</div>
                                                )}
                                            </div>
                                            <CardContent className="p-4 space-y-2">
                                                <h3 className="font-semibold">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.egg_size} • {product.egg_color} • Kit com {product.kit_quantity ?? 0}
                                                </p>
                                                <div className="text-sm">
                                                    {product.allow_one_time_purchase && (
                                                        <p>Compra única: R$ {Number(product.one_time_price ?? 0).toFixed(2)}</p>
                                                    )}
                                                    {product.allow_subscription &&
                                                        product.subscription_price != null &&
                                                        Number(product.subscription_price) > 0 && (
                                                            <p>Assinatura (referência do kit): R$ {Number(product.subscription_price).toFixed(2)}</p>
                                                        )}
                                                    {product.allow_subscription &&
                                                        (product.subscription_price == null ||
                                                            Number(product.subscription_price) <= 0) && (
                                                            <p className="text-amber-700 dark:text-amber-400 text-xs">
                                                                Assinatura ativa no kit, mas sem preço de referência cadastrado.
                                                            </p>
                                                        )}
                                                </div>
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
