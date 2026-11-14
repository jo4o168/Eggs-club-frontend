import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {usePublicProducts, usePublicProducers} from "@/hooks/usePublicCatalog";
import {useAuth} from "@/contexts/AuthContext";
import {toast} from "@/hooks/use-toast";
import {useAddCartItem} from "@/hooks/useCart";
import {CatalogPagination, catalogGridClassName} from "@/components/CatalogPagination";
import CatalogItemCard from "@/components/CatalogItemCard";
import {CATALOG_PAGE_SIZE, pageContainingIndex, paginate} from "@/utils/paginate";
import {formatBRL} from "@/utils/money";

const ProdutosLoja = () => {
    const {profile} = useAuth();
    const navigate = useNavigate();
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
    const [page, setPage] = useState(1);

    const oneTimeKits = useMemo(
        () =>
            products.filter(
                (product) => product.allow_one_time_purchase !== false || Number(product.one_time_price) > 0,
            ),
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

    const catalog = paginate(filteredProducts, page, CATALOG_PAGE_SIZE);

    const toggleSelection = (value: string, list: string[], setList: (next: string[]) => void) => {
        if (list.includes(value)) {
            setList(list.filter((item) => item !== value));
        } else {
            setList([...list, value]);
        }
        setPage(1);
    };

    useEffect(() => {
        setPage(1);
    }, [query, selectedProducerId]);

    useEffect(() => {
        if (page !== catalog.currentPage) {
            setPage(catalog.currentPage);
        }
    }, [page, catalog.currentPage]);

    useEffect(() => {
        if (!targetProductId) return;
        const index = filteredProducts.findIndex((product) => String(product.id) === targetProductId);
        if (index < 0) return;
        setPage(pageContainingIndex(index, CATALOG_PAGE_SIZE));
    }, [targetProductId, filteredProducts]);

    useEffect(() => {
        if (!targetProductId) return;
        const element = document.getElementById(`product-${targetProductId}`);
        if (!element) return;
        setTimeout(() => {
            element.scrollIntoView({behavior: "smooth", block: "center"});
        }, 80);
    }, [targetProductId, catalog.items]);

    const handleKitCta = (productId: number) => {
        if (isCustomer) {
            void addCartItem
                .mutateAsync({
                    product_id: productId,
                    purchase_mode: "one_time",
                    quantity: 1,
                })
                .then(() => {
                    toast({title: "Produto adicionado ao carrinho!"});
                });
            return;
        }
        if (isAuthenticated) {
            navigate("/producer/dashboard");
            return;
        }
        navigate("/login?mode=signup&type=customer");
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-6">
                <div className="container space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-foreground">Kits de ovos</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Compra única, sem mensalidade. Prefere receber todo mês?
                            </p>
                        </div>
                        <Link to="/planos">
                            <Button variant="outline" size="sm">Ver planos de assinatura</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:items-start">
                        <aside className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <h3 className="font-semibold">Filtros</h3>
                                    <div className="space-y-2">
                                        <Label>Região / origem</Label>
                                        <select
                                            className="w-full border border-input rounded-md h-10 px-3 bg-background"
                                            value={selectedProducerId}
                                            onChange={(e) => {
                                                setSelectedProducerId(e.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="">Todas</option>
                                            {producers.map((producer) => (
                                                <option key={producer.id} value={String(producer.id)}>
                                                    {producer.producerSetting?.city
                                                        ? [producer.producerSetting.city, producer.producerSetting.state].filter(Boolean).join(" / ")
                                                        : "Parceiro local"}
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

                        <section className="lg:col-span-3 space-y-4">
                            {filteredProducts.length === 0 ? (
                                <Card>
                                    <CardContent className="p-10 min-h-[16rem] flex flex-col items-center justify-center text-center space-y-3">
                                        <p className="text-muted-foreground">
                                            Nenhum kit de ovos encontrado com os filtros selecionados.
                                        </p>
                                        <Link to="/planos">
                                            <Button variant="outline" size="sm">Ver planos de assinatura</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <div className={catalogGridClassName}>
                                        {catalog.items.map((product) => (
                                            <CatalogItemCard
                                                id={`product-${product.id}`}
                                                key={product.id}
                                                href={`/produtos/${product.id}`}
                                                name={product.name}
                                                imageUrl={product.image_url}
                                                meta={[product.egg_size, product.egg_color, product.kit_quantity ? `${product.kit_quantity} ovos` : null]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                                price={formatBRL(product.one_time_price)}
                                                ratingAverage={product.rating_average}
                                                ratingCount={product.rating_count}
                                                highlighted={String(product.id) === targetProductId}
                                                ctaLabel={isAuthenticated && !isCustomer ? "Área do produtor" : "Comprar"}
                                                ctaVariant={isAuthenticated && !isCustomer ? "outline" : "default"}
                                                ctaDisabled={addCartItem.isPending || (isCustomer && product.allow_one_time_purchase === false && !(Number(product.one_time_price) > 0))}
                                                onCta={() => handleKitCta(product.id)}
                                            />
                                        ))}
                                    </div>
                                    <CatalogPagination
                                        page={catalog.currentPage}
                                        totalPages={catalog.totalPages}
                                        total={catalog.total}
                                        pageSize={catalog.pageSize}
                                        noun="kits"
                                        onPageChange={handlePageChange}
                                    />
                                </>
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
