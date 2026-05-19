import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProducerCard from "@/components/ProducerCard";
import { usePublicProducers } from "@/hooks/usePublicCatalog";
import {Link} from "react-router-dom";

const Produtores = () => {
    const { data: producers = [] } = usePublicProducers();
    const colors = ["green", "yellow", "blue"] as const;

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 py-16">
                <div className="container">
                    <div className="text-center mb-12">
                        <h1 className="section-title text-foreground mb-4">
                            Conheça quem produz o seu alimento
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                            Apoiamos pequenos produtores que trabalham com amor, respeito e
                            cuidado com os animais e o meio ambiente.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {producers.map((producer, index) => (
                            <ProducerCard
                                key={producer.id}
                                id={producer.id}
                                name={producer.producerSetting?.farm_name || producer.name}
                                displayName={(producer.producerSetting?.farm_name || producer.name).slice(0, 16)}
                                owner={producer.name}
                                location={[
                                    producer.producerSetting?.city,
                                    producer.producerSetting?.state,
                                ]
                                    .filter(Boolean)
                                    .join(", ") || "Local não informado"}
                                description={producer.producerSetting?.description || "Produtor parceiro da Eggs Club."}
                                color={colors[index % colors.length]}
                            />
                        ))}
                    </div>

                    <div className="mt-16 text-center bg-accent rounded-2xl p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-display font-semibold mb-4">
                            É produtor de ovos caipiras?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Junte-se à nossa rede de produtores e alcance clientes que valorizam
                            a qualidade e procedência dos alimentos.
                        </p>
                        <Link
                            to="/login?mode=signup&type=producer"
                            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Cadastre-se como produtor
                        </Link>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default Produtores;
