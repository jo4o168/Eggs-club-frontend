import {Link, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlanCard from "@/components/PlanCard";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {toast} from "@/hooks/use-toast";
import {ToastAction} from "@/components/ui/toast";
import {usePublicPlans, usePublicProducers} from "@/hooks/usePublicCatalog";
import {useAuth} from "@/contexts/AuthContext";
import {useAddCartItem} from "@/hooks/useCart";
import {CatalogPagination, catalogGridClassName} from "@/components/CatalogPagination";
import {CATALOG_PAGE_SIZE, pageContainingIndex, paginate} from "@/utils/paginate";

const frequencyLabels: Record<number, string> = {
    0: "Semanal",
    1: "Quinzenal",
    2: "Mensal",
};

const Planos = () => {
    const navigate = useNavigate();
    const {profile} = useAuth();
    const addCartItem = useAddCartItem();
    const isCustomer = profile?.role === "customer";
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = (params.get("q") ?? "").toLowerCase();
    const targetPlanId = params.get("plan");
    const {data: plans = []} = usePublicPlans();
    const {data: producers = []} = usePublicProducers();

    const [selectedProducerId, setSelectedProducerId] = useState("");
    const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);
    const [page, setPage] = useState(1);

    const catalogPlans = useMemo(
        () => plans.filter((plan) => plan.is_active !== false),
        [plans],
    );

    const frequencyOptions = useMemo(
        () => Array.from(new Set(catalogPlans.map((plan) => plan.frequency))).sort(),
        [catalogPlans],
    );

    const filteredPlans = useMemo(() => {
        return catalogPlans.filter((plan) => {
            const matchesQuery =
                !query ||
                `${plan.name} ${plan.description ?? ""} ${plan.product?.name ?? ""}`.toLowerCase().includes(query);
            const matchesProducer = !selectedProducerId || String(plan.producer_id) === selectedProducerId;
            const matchesFrequency =
                selectedFrequencies.length === 0 || selectedFrequencies.includes(plan.frequency);
            return matchesQuery && matchesProducer && matchesFrequency;
        });
    }, [catalogPlans, query, selectedProducerId, selectedFrequencies]);

    const catalog = paginate(filteredPlans, page, CATALOG_PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [query, selectedProducerId, selectedFrequencies]);

    useEffect(() => {
        if (page !== catalog.currentPage) {
            setPage(catalog.currentPage);
        }
    }, [page, catalog.currentPage]);

    useEffect(() => {
        if (!targetPlanId) return;
        const index = filteredPlans.findIndex((plan) => String(plan.id) === targetPlanId);
        if (index < 0) return;
        setPage(pageContainingIndex(index, CATALOG_PAGE_SIZE));
    }, [targetPlanId, filteredPlans]);

    useEffect(() => {
        if (!targetPlanId) return;
        const element = document.getElementById(`plan-${targetPlanId}`);
        if (!element) return;
        setTimeout(() => element.scrollIntoView({behavior: "smooth", block: "center"}), 80);
    }, [targetPlanId, catalog.items]);

    const toggleFrequency = (value: number) => {
        setSelectedFrequencies((current) =>
            current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        );
        setPage(1);
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleSelectPlan = (plan: (typeof filteredPlans)[number]) => {
        if (profile?.role === "producer") {
            toast({
                title: "Assinaturas são para clientes",
                description: "Entre com uma conta de cliente para assinar um plano.",
            });
            return;
        }

        if (!isCustomer) {
            toast({
                title: "Entre para assinar",
                description: "Faça login ou cadastre-se como cliente para continuar.",
            });
            navigate("/login?mode=signup&type=customer", {state: {selectedPlan: plan.id}});
            return;
        }

        if (!plan.product_id) {
            toast({
                title: "Este plano ainda não tem um kit vinculado.",
                variant: "destructive",
            });
            return;
        }

        void addCartItem
            .mutateAsync({
                product_id: plan.product_id,
                purchase_mode: "subscription",
                subscription_plan_id: plan.id,
                quantity: 1,
            })
            .then(() => {
                toast({
                    title: "Plano adicionado ao carrinho",
                    description: "Pode continuar escolhendo outros planos.",
                    action: (
                        <ToastAction altText="Ver carrinho" onClick={() => navigate("/customer/carrinho")}>
                            Ver carrinho
                        </ToastAction>
                    ),
                });
            });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 py-6">
                <div className="container space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-foreground">Planos de assinatura</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Receba ovos frescos no ritmo que preferir. Quer comprar só uma vez?
                            </p>
                        </div>
                        <Link to="/produtos">
                            <Button variant="outline" size="sm">Ver kits de ovos</Button>
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
                                        <Label>Frequência</Label>
                                        {frequencyOptions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Nenhuma opção no momento.</p>
                                        ) : frequencyOptions.map((frequency) => (
                                            <label key={frequency} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={selectedFrequencies.includes(frequency)}
                                                    onCheckedChange={() => toggleFrequency(frequency)}
                                                />
                                                {frequencyLabels[frequency] ?? `Frequência ${frequency}`}
                                            </label>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>

                        <section className="lg:col-span-3 space-y-4">
                            {filteredPlans.length === 0 ? (
                                <Card>
                                    <CardContent className="p-10 min-h-[16rem] flex flex-col items-center justify-center text-center space-y-3">
                                        <p className="text-muted-foreground">
                                            Nenhum plano de assinatura encontrado com os filtros selecionados.
                                        </p>
                                        <Link to="/produtos">
                                            <Button variant="outline" size="sm">Ver kits de ovos</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <div className={catalogGridClassName}>
                                        {catalog.items.map((plan) => (
                                            <div
                                                key={plan.id}
                                                id={`plan-${plan.id}`}
                                                className={`h-full ${String(plan.id) === targetPlanId ? "rounded-md ring-2 ring-primary" : ""}`}
                                            >
                                                <PlanCard
                                                    name={plan.name}
                                                    price={`R$ ${Number(plan.price).toFixed(2).replace(".", ",")}`}
                                                    imageUrl={plan.image_url || plan.product?.image_url}
                                                    frequency={frequencyLabels[plan.frequency] ?? "entrega"}
                                                    description={
                                                        plan.product?.name
                                                            ? `${plan.product.name}${plan.description ? ` — ${plan.description}` : ""}`
                                                            : plan.description || "Plano de assinatura de ovos frescos."
                                                    }
                                                    isPopular={plan.is_featured}
                                                    features={[
                                                        plan.product?.kit_quantity
                                                            ? `Kit com ${plan.product.kit_quantity} ovos`
                                                            : "Ovos frescos",
                                                    ]}
                                                    onSelect={() => handleSelectPlan(plan)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <CatalogPagination
                                        page={catalog.currentPage}
                                        totalPages={catalog.totalPages}
                                        total={catalog.total}
                                        pageSize={catalog.pageSize}
                                        noun="planos"
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

export default Planos;
