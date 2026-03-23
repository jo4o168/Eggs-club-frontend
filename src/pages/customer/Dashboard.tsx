import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";
import {Heart, Package, CreditCard, Calendar, ArrowRight, Loader2} from "lucide-react";
import {useCustomerStats} from "@/hooks/useStats";
import {useCustomerOrders} from "@/hooks/useOrders";
import {useAuth} from "@/contexts/AuthContext";

const ClienteDashboard = () => {
    const {profile} = useAuth();
    const {data: stats, isLoading: statsLoading} = useCustomerStats();
    const {data: orders, isLoading: ordersLoading} = useCustomerOrders();

    const recentOrders = orders?.slice(0, 3) || [];

    if (statsLoading) {
        return (
            <DashboardLayout userType="cliente">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                </div>
            </DashboardLayout>
        );
    }

    const subscription = stats?.subscription;

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-semibold">Olá, {profile?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-muted-foreground mt-1">Bem-vindo de volta ao Egg's Club.</p>
                </div>

                {subscription ? (
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary"/>
                                    Sua Assinatura Ativa
                                </CardTitle>
                                <span
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Ativa</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Plano</p>
                                    <p className="font-semibold text-lg">{subscription.plan?.name || 'Plano'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Produtor</p>
                                    <p className="font-semibold text-lg">{(subscription.producer as any)?.producer_settings?.[0]?.farm_name || subscription.producer?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Próxima Entrega</p>
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary"/>
                                        {subscription.next_delivery_date ? new Date(subscription.next_delivery_date).toLocaleDateString('pt-BR') : 'A definir'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex gap-4">
                                <Link to="/cliente/assinatura"><Button variant="hero" size="sm">Gerenciar
                                    Assinatura</Button></Link>
                                <Link to="/produtores"><Button variant="outline" size="sm">Ver Outros
                                    Produtores</Button></Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-primary/20">
                        <CardContent className="py-8 text-center">
                            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Você ainda não tem uma assinatura</h3>
                            <p className="text-muted-foreground mb-4">Explore nossos produtores e escolha seu plano.</p>
                            <Link to="/planos"><Button variant="hero">Ver Planos</Button></Link>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de
                                Pedidos</CardTitle>
                            <Package className="w-5 h-5 text-primary"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats?.ordersCount || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Meses Assinando</CardTitle>
                            <Heart className="w-5 h-5 text-primary"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats?.monthsSubscribed || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
                            <CreditCard className="w-5 h-5 text-primary"/>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">R$ {(stats?.totalSpent || 0).toFixed(2)}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pedidos Recentes</CardTitle>
                        <Link to="/cliente/pedidos"><Button variant="ghost" size="sm">Ver todos <ArrowRight
                            className="w-4 h-4 ml-1"/></Button></Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">Nenhum pedido ainda.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order: any) => (
                                    <div key={order.id}
                                         className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-primary"/>
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.order_number}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <span
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{order.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ClienteDashboard;
