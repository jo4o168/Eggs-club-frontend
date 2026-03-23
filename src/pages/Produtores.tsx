import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProducerCard from "@/components/ProducerCard";

const producers = [
    {
        id: "sitio-verde",
        name: "Sítio Verde",
        displayName: "Sítio Verde",
        owner: "Família Almeida",
        location: "Piraju, SP",
        description:
            "Há 3 gerações, a Família Almeida se dedica à criação de galinhas caipiras livres, com alimentação natural e muito espaço para ciscar e se desenvolver.",
        color: "green" as const,
    },
    {
        id: "chacara-sol",
        name: "Chácara Sol Nascente",
        displayName: "Chácara Sol",
        owner: "Roberto & Lúcia",
        location: "Sarutaiá, SP",
        description:
            "Roberto e Lúcia cuidam de suas galinhas com um manejo sustentável, focados no bem-estar animal e na produção de ovos com a gema bem amarelinha e saborosa.",
        color: "yellow" as const,
    },
    {
        id: "granja-azul",
        name: "Granja Ovos Azuis",
        displayName: "Granja Azul",
        owner: "Sra. Elvira",
        location: "Fartura, SP",
        description:
            "Especializada em raças que botam ovos de casca azulada, a Sra. Elvira oferece um produto diferenciado, nutritivo e que encanta pela beleza e qualidade.",
        color: "blue" as const,
    },
];

const Produtores = () => {
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
                        {producers.map((producer) => (
                            <ProducerCard key={producer.id} {...producer} />
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
                        <a
                            href="/login"
                            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Cadastre-se como produtor
                        </a>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default Produtores;
