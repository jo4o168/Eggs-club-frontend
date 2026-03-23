import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import {Egg, Truck, Heart} from "lucide-react";

const Index = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1">
                <HeroSection/>

                {/* Feature Banner */}
                <section className="py-16">
                    <div className="container">
                        <div className="bg-accent rounded-3xl p-12 md:p-16 text-center">
                            <h2 className="section-title text-foreground mb-4">
                                Ovos Frescos na Cesta
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Direto do galinheiro para sua mesa. Ovos caipiras de galinhas
                                criadas soltas, com alimentação natural e muito cuidado.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-16 bg-secondary/50">
                    <div className="container">
                        <h2 className="section-title text-center mb-12">
                            Como funciona?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Egg className="w-8 h-8"/>}
                                title="Escolha seu plano"
                                description="Selecione a frequência de entrega que melhor se adapta ao seu consumo: semanal, quinzenal ou mensal."
                            />
                            <FeatureCard
                                icon={<Heart className="w-8 h-8"/>}
                                title="Conheça o produtor"
                                description="Saiba de onde vêm seus ovos. Cada produtor tem sua história e forma única de criar suas galinhas."
                            />
                            <FeatureCard
                                icon={<Truck className="w-8 h-8"/>}
                                title="Receba em casa"
                                description="Combine a entrega diretamente com o produtor. Ovos fresquinhos na sua porta!"
                            />
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-16">
                    <div className="container text-center">
                        <h2 className="section-title mb-6">
                            Qualidade que você pode confiar
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Trabalhamos apenas com produtores certificados que seguem práticas
                            sustentáveis e garantem o bem-estar animal. Cada ovo que chega à
                            sua mesa passou por rigoroso controle de qualidade.
                        </p>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
};

export default Index;
