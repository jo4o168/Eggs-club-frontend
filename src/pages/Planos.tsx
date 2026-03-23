import {useNavigate} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlanCard from "@/components/PlanCard";
import {toast} from "@/hooks/use-toast";

const plans = [
    {
        id: "quinzenal",
        name: "Plano Quinzenal",
        price: "R$ 26,00",
        frequency: "entrega",
        description:
            "O equilíbrio ideal para casais ou famílias pequenas que buscam conveniência.",
        features: ["12 ovos por entrega", "Entrega a cada 15 dias", "Suporte por WhatsApp"],
        isPopular: false,
    },
    {
        id: "semanal",
        name: "Plano Semanal",
        price: "R$ 25,00",
        frequency: "entrega",
        description:
            "Perfeito para quem ama ovos e usa em todas as refeições. Frescor máximo garantido!",
        features: ["12 ovos por entrega", "Entrega toda semana", "Suporte prioritário", "Receitas exclusivas"],
        isPopular: true,
    },
    {
        id: "mensal",
        name: "Plano Mensal",
        price: "R$ 28,00",
        frequency: "entrega",
        description:
            "Para quem consome ovos esporadicamente mas não abre mão da qualidade superior.",
        features: ["12 ovos por entrega", "Entrega mensal", "Suporte por WhatsApp"],
        isPopular: false,
    },
];

const Planos = () => {
    const navigate = useNavigate();

    const handleSelectPlan = (planId: string) => {
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
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                {...plan}
                                onSelect={() => handleSelectPlan(plan.id)}
                            />
                        ))}
                    </div>

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
