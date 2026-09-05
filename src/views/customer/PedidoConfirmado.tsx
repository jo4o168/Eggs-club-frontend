import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import {Button} from "@/components/ui/button";
import {Link, useLocation} from "react-router-dom";
import {CheckCircle2, History, Package} from "lucide-react";

const PedidoConfirmado = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const orderIds = (params.get("orders") ?? "").split(",").map((value) => Number(value)).filter((id) => id > 0);
    const subscriptionCount = (params.get("subs") ?? "").split(",").filter(Boolean).length;
    const primaryOrderId = orderIds[0];

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-8">
                <div className="container max-w-2xl space-y-8">
                    <CheckoutStepper current="confirmed"/>

                    <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center space-y-5">
                        <CheckCircle2 className="h-14 w-14 mx-auto text-primary"/>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-display font-semibold">Pedido enviado ao produtor</h1>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {orderIds.length > 1
                                    ? `${orderIds.length} pedidos foram criados, um para cada produtor dos itens do carrinho.`
                                    : "Recebemos a confirmação de entrega e pagamento. O produtor já pode preparar o kit."}
                            </p>
                        </div>

                        {subscriptionCount > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {subscriptionCount === 1
                                    ? "Uma assinatura também foi ativada."
                                    : `${subscriptionCount} assinaturas também foram ativadas.`}
                            </p>
                        ) : null}

                        <ul className="text-left max-w-md mx-auto space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <Package className="h-4 w-4 text-primary shrink-0 mt-0.5"/>
                                O endereço informado vai no pedido para o produtor combinar a entrega.
                            </li>
                            <li className="flex gap-2">
                                <History className="h-4 w-4 text-primary shrink-0 mt-0.5"/>
                                Acompanhe o status em Meus pedidos: pendente, em preparo, enviado e entregue.
                            </li>
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            {primaryOrderId ? (
                                <Button variant="hero" asChild>
                                    <Link to={`/customer/pedidos/${primaryOrderId}`}>Ver pedido</Link>
                                </Button>
                            ) : (
                                <Button variant="hero" asChild>
                                    <Link to="/customer/pedidos">Ver meus pedidos</Link>
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link to="/produtos">Continuar comprando</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default PedidoConfirmado;
