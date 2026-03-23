import {useParams, Link} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {ArrowLeft, MapPin, Phone, Mail} from "lucide-react";

const producersData: Record<string, {
    name: string;
    displayName: string;
    owner: string;
    location: string;
    description: string;
    fullDescription: string;
    color: string;
    phone: string;
    email: string;
}> = {
    "sitio-verde": {
        name: "Sítio Verde",
        displayName: "Sítio Verde",
        owner: "Família Almeida",
        location: "Piraju, SP",
        description: "Criação de galinhas caipiras há 3 gerações",
        fullDescription:
            "Há 3 gerações, a Família Almeida se dedica à criação de galinhas caipiras livres, com alimentação natural e muito espaço para ciscar e se desenvolver. Nossas aves são criadas soltas em um ambiente natural, alimentadas com grãos selecionados e restos de vegetais orgânicos. Acreditamos que galinhas felizes produzem ovos mais saborosos e nutritivos.",
        color: "producer-card-green",
        phone: "(14) 99999-1111",
        email: "contato@sitioverde.com.br",
    },
    "chacara-sol": {
        name: "Chácara Sol Nascente",
        displayName: "Chácara Sol",
        owner: "Roberto & Lúcia",
        location: "Sarutaiá, SP",
        description: "Manejo sustentável focado no bem-estar animal",
        fullDescription:
            "Roberto e Lúcia cuidam de suas galinhas com um manejo sustentável, focados no bem-estar animal e na produção de ovos com a gema bem amarelinha e saborosa. Nossa chácara utiliza técnicas de permacultura e agroecologia, garantindo um produto 100% natural e livre de agrotóxicos. Cada ovo é coletado manualmente e inspecionado com carinho.",
        color: "producer-card-yellow",
        phone: "(14) 99999-2222",
        email: "contato@chacarasol.com.br",
    },
    "granja-azul": {
        name: "Granja Ovos Azuis",
        displayName: "Granja Azul",
        owner: "Sra. Elvira",
        location: "Fartura, SP",
        description: "Especializada em raças de ovos azulados",
        fullDescription:
            "Especializada em raças que botam ovos de casca azulada, a Sra. Elvira oferece um produto diferenciado, nutritivo e que encanta pela beleza e qualidade. Nossas galinhas Araucanas e Ameraucanas são criadas em um ambiente tranquilo, com acesso a pastagem verde e alimentação balanceada. Os ovos azuis são conhecidos por terem menos colesterol e mais ômega-3.",
        color: "producer-card-blue",
        phone: "(14) 99999-3333",
        email: "contato@granjaazul.com.br",
    },
};

const ProdutorDetalhe = () => {
    const {id} = useParams<{ id: string }>();
    const producer = id ? producersData[id] : null;

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
                            className={`${producer.color} rounded-2xl h-64 lg:h-96 flex items-center justify-center`}
                        >
              <span className="text-4xl lg:text-5xl font-display font-semibold text-foreground/80">
                {producer.displayName}
              </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-display font-semibold mb-2">
                                    {producer.name}
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    {producer.owner}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary"/>
                                <span>{producer.location}</span>
                            </div>

                            <p className="text-foreground leading-relaxed">
                                {producer.fullDescription}
                            </p>

                            <div className="bg-secondary rounded-xl p-6 space-y-4">
                                <h3 className="font-semibold">Entre em contato</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-primary"/>
                                        <span>{producer.phone}</span>
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
