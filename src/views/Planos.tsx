import {useNavigate} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlanCard from "@/components/PlanCard";
import {toast} from "@/hooks/use-toast";
import {usePublicPlans} from "@/hooks/usePublicCatalog";

const Planos = () => {
    const navigate = useNavigate();
    const {data: plans = []} = usePublicPlans();
    const activePlans = plans.filter((plan) => plan.is_active);

    const handleSelectPlan = (planId: string | number) => {
        toast({
            title: "Plano selecionado!",
            description: "Faça login ou cadastre-se para continuar.",
        });
        navigate("/login", {state: {selectedPlan: planId}});
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 py-16">
                <div className="container">
                    <div className="text-center mb-12">
                        <h1 className="section-title text-foreground mb-4">
                            Escolha o plano perfeito para você
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Qualidade do campo com a praticidade que você merece.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {activePlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                name={plan.name}
                                price={`R$ ${Number(plan.price).toFixed(2)}`}
                                frequency="entrega"
                                description={plan.description || "Plano de assinatura de ovos frescos."}
                                isPopular={plan.is_featured}
                                features={["Qualidade premium", "Entrega recorrente", "Cancelamento flexível"]}
                                onSelect={() => handleSelectPlan(plan.id)}
                            />
                        ))}
                    </div>
                    {activePlans.length === 0 && (
                        <div className="text-center mt-8 text-muted-foreground">
                            Nenhum plano cadastrado no momento.
                        </div>
                    )}

                    <div className="mt-16 text-center">
                        <p className="text-sm text-muted-foreground">
                            Todos os planos podem ser cancelados a qualquer momento. <br/>
                            A entrega é combinada diretamente com o produtor da sua região.
                        </p>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default Planos;
