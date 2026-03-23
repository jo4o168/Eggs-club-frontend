import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Package, ShoppingCart, DollarSign, TrendingUp, Loader2} from "lucide-react";
import {useProducerStats} from "@/hooks/useStats";
import {useProducerOrders} from "@/hooks/useOrders";
import {useAuth} from "@/contexts/AuthContext";

const ProdutorDashboard = () => {
    const {producerSettings} = useAuth();
    const {data: stats, isLoading: statsLoading} = useProducerStats();
    const {data: orders, isLoading: ordersLoading} = useProducerOrders();

    const recentOrders = orders?.slice(0, 3) || [];

    if (statsLoading) {
        return (
            <DashboardLayout userType="produtor">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                </div>
            </DashboardLayout>
        );
    }

    const statsData = [
        {title: "Produtos Ativos", value: stats?.productsCount || 0, icon: Package, change: "produtos cadastrados"},
        {
            title: "Pedidos Pendentes",
            value: stats?.pendingOrdersCount || 0,
            icon: ShoppingCart,
            change: "aguardando ação"
        },
        {
            title: "Faturamento",
            value: `R$ ${(stats?.totalRevenue || 0).toFixed(2)}`,
            icon: DollarSign,
            change: "total acumulado"
        },
        {title: "Assinantes", value: stats?.subscribersCount || 0, icon: TrendingUp, change: "assinaturas ativas"},
    ];

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-semibold">
                        Olá, {producerSettings?.farm_name || "Produtor"}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">Aqui está o resumo da sua conta hoje.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsData.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle
                                        className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                    <Icon className="w-5 h-5 text-primary"/>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader><CardTitle>Pedidos Recentes</CardTitle></CardHeader>
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
                                                <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                                  "bg-green-100 text-green-700"
                      }`}>
                        {order.status}
                      </span>
                                        </div>
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

export default ProdutorDashboard;
