import {useMemo, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {OrderDateRangeFilter} from "@/components/OrderDateRangeFilter";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Package, Calendar, Loader2} from "lucide-react";
import {useCustomerOrders} from "@/hooks/useOrders";
import {filterByCreatedAtDateRange, type OrderDateRange} from "@/lib/orderDateRange";
import {Link} from "react-router-dom";

const ClientePedidos = () => {
    const {data: orders = [], isLoading} = useCustomerOrders();
    const [dateRange, setDateRange] = useState<OrderDateRange>({from: "", to: ""});

    const filteredOrders = useMemo(
        () => filterByCreatedAtDateRange(orders, dateRange),
        [orders, dateRange],
    );

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-700",
            confirmed: "bg-blue-100 text-blue-700",
            shipped: "bg-purple-100 text-purple-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="cliente">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">Meus Pedidos</h1>
                        <p className="text-muted-foreground mt-1">
                            Histórico de todos os seus pedidos
                        </p>
                    </div>
                    <OrderDateRangeFilter value={dateRange} onChange={setDateRange}/>
                </div>

                <div className="space-y-4">
                    {filteredOrders.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                {orders.length === 0
                                    ? "Nenhum pedido encontrado ainda."
                                    : "Nenhum pedido neste período."}
                            </CardContent>
                        </Card>
                    )}
                    {filteredOrders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg">{order.order_number ?? `#${order.id}`}</CardTitle>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() +
                                                order.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-4 h-4"/>
                                            {new Date(order.created_at).toLocaleDateString("pt-BR")}
                                        </span>
                                        <Link to={`/customer/pedidos/${order.id}`}>
                                            <Button variant="outline" size="sm">Ver detalhes</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary"/>
                                        <span>Pedido realizado</span>
                                    </div>
                                    <span className="font-semibold text-primary">R$ {Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientePedidos;
