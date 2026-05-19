import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import {Egg, Truck, Heart, ShoppingBasket, Repeat, BadgeCheck, Search, CreditCard, PackageCheck} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {useEffect} from "react";
import {useLocation} from "react-router-dom";

const Index = () => {
    const location = useLocation();

    useEffect(() => {
        const hashFromLocation = typeof location.hash === "string" ? location.hash : "";
        const hashFromWindow = typeof window !== "undefined" ? window.location.hash : "";
        const targetId = (hashFromLocation || hashFromWindow).replace("#", "");
        if (!targetId) return;
        const element = document.getElementById(targetId);
        if (element) {
            setTimeout(() => element.scrollIntoView({behavior: "smooth", block: "start"}), 50);
        }
    }, [location.hash]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>

            <main className="flex-1">
                <section id="inicio" className="py-16 md:py-24">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="hero-title text-foreground mb-6">
                                Ovos frescos, assinatura fácil e compra única quando quiser.
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Conheça produtores locais, escolha seu kit ideal e decida como comprar:
                                assinatura recorrente ou pedido avulso.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link to="/#assinatura"><Button variant="hero">Como funciona a assinatura</Button></Link>
                                <Link to="/produtos"><Button variant="outline">Explorar kits de ovos</Button></Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-10">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<ShoppingBasket className="w-8 h-8"/>}
                                title="Compra única"
                                description="Compre kits quando quiser, sem vínculo e com praticidade."
                            />
                            <FeatureCard
                                icon={<Repeat className="w-8 h-8"/>}
                                title="Assinatura"
                                description="Receba ovos recorrentes e mantenha sua rotina abastecida."
                            />
                            <FeatureCard
                                icon={<BadgeCheck className="w-8 h-8"/>}
                                title="Produtores selecionados"
                                description="Transparência na origem e cuidado em cada entrega."
                            />
                        </div>
                    </div>
                </section>

                <section id="assinatura" className="py-16 bg-secondary/50">
                    <div className="container">
                        <div className="max-w-3xl">
                            <h2 className="section-title text-foreground mb-4">Como funciona a assinatura</h2>
                            <p className="text-muted-foreground text-lg">
                                Nosso processo de assinatura e simples: você escolhe o kit, define a periodicidade e
                                recebe ovos frescos no ritmo que preferir.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <Card>
                                <CardContent className="p-5 space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                                        <Search className="w-5 h-5"/>
                                    </div>
                                    <h3 className="font-semibold">1. Escolha seu kit</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vá na seção de produtos, aplique os filtros e selecione o kit de ovos que mais combina com você.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-5 space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                                        <CreditCard className="w-5 h-5"/>
                                    </div>
                                    <h3 className="font-semibold">2. Defina a periodicidade</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Escolha a recorrência que deseja e confirme a assinatura. Após a confirmação de pagamento, o pedido é separado.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-5 space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                                        <PackageCheck className="w-5 h-5"/>
                                    </div>
                                    <h3 className="font-semibold">3. Receba no período combinado</h3>
                                    <p className="text-sm text-muted-foreground">
                                        O produtor prepara e envia seus kits conforme a periodicidade escolhida, com ovos frescos em cada entrega.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section id="produtores" className="py-16 bg-secondary/50">
                    <div className="container">
                        <h2 className="section-title text-foreground mb-4">Sobre nossos produtores</h2>
                        <p className="text-muted-foreground text-lg max-w-3xl">
                            Trabalhamos com produtores locais comprometidos com qualidade, cuidado com os animais e
                            entrega responsável.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                            <FeatureCard
                                icon={<Egg className="w-8 h-8"/>}
                                title="Produção local"
                                description="Valorizamos produtores da sua região para fortalecer a economia local."
                            />
                            <FeatureCard
                                icon={<Heart className="w-8 h-8"/>}
                                title="Cuidado no processo"
                                description="Seleção rigorosa e boas práticas para ovos sempre frescos."
                            />
                            <FeatureCard
                                icon={<Truck className="w-8 h-8"/>}
                                title="Entrega combinada"
                                description="Organização de entrega prática para assinatura e compra única."
                            />
                        </div>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container">
                        <div className="bg-accent rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-display font-semibold text-foreground">Pronto para começar?</h2>
                                <p className="text-muted-foreground mt-1">Crie sua conta e escolha entre assinatura ou compra avulsa.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link to="/produtos"><Button variant="hero">Ver kits</Button></Link>
                                <Link to="/login?mode=signup&type=customer"><Button variant="outline">Criar conta</Button></Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
};

export default Index;
