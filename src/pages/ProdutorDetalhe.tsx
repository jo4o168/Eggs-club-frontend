import {useParams, Link} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {ArrowLeft, MapPin, Phone, Mail} from "lucide-react";
import {usePublicProducer} from "@/hooks/usePublicCatalog";

const ProdutorDetalhe = () => {
    const {id} = useParams<{ id: string }>();
    const {data: producer} = usePublicProducer(id);

    if (!producer) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header/>
                <main className="flex-1 py-16">
                    <div className="container text-center">
                        <h1 className="text-2xl font-display font-semibold mb-4">
                            Produtor não encontrado
                        </h1>
                        <Link to="/produtores">
                            <Button variant="default">Voltar para produtores</Button>
                        </Link>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1 py-8">
                <div className="container">
                    <Link
                        to="/produtores"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Voltar para produtores
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div
                            className="producer-card-green rounded-2xl h-64 lg:h-96 flex items-center justify-center"
                        >
              <span className="text-4xl lg:text-5xl font-display font-semibold text-foreground/80">
                {(producer.producerSetting?.farm_name || producer.name).slice(0, 24)}
              </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-display font-semibold mb-2">
                                    {producer.producerSetting?.farm_name || producer.name}
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    {producer.name}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary"/>
                                <span>{[producer.producerSetting?.city, producer.producerSetting?.state].filter(Boolean).join(", ") || "Local não informado"}</span>
                            </div>

                            <p className="text-foreground leading-relaxed">
                                {producer.producerSetting?.description || "Produtor parceiro da Eggs Club."}
                            </p>

                            <div className="bg-secondary rounded-xl p-6 space-y-4">
                                <h3 className="font-semibold">Entre em contato</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-primary"/>
                                        <span>{producer.phone || "Telefone não informado"}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-primary"/>
                                        <span>{producer.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Link to="/planos">
                                <Button variant="hero" className="w-full">
                                    Ver planos disponíveis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default ProdutorDetalhe;
