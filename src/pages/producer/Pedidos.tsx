import {useMemo, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Loader2, User} from "lucide-react";
import {Order, useProducerOrders, useUpdateOrderStatus} from "@/hooks/useOrders";
import {Link} from "react-router-dom";

const ProdutorPedidos = () => {
    const {data: orders = [], isLoading} = useProducerOrders();
    const updateOrderStatus = useUpdateOrderStatus();
    const [filter, setFilter] = useState<string>("todos");

    const updateStatus = async (orderId: number, newStatus: Order["status"]) => {
        await updateOrderStatus.mutateAsync({id: orderId, status: newStatus});
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-700",
            confirmed: "bg-blue-100 text-blue-700",
            preparing: "bg-indigo-100 text-indigo-700",
            shipped: "bg-purple-100 text-purple-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return colors[status as keyof typeof colors] ?? "bg-gray-100 text-gray-700";
    };

    const statusLabel: Record<string, string> = {
        pending: "Pendente",
        confirmed: "Confirmado",
        preparing: "Em preparo",
        shipped: "Enviado",
        delivered: "Entregue",
        cancelled: "Cancelado",
    };

    const filteredOrders = useMemo(
        () =>
        filter === "todos"
            ? orders
            : orders.filter((order) => order.status === filter),
        [filter, orders]
    );

    if (isLoading) {
        return (
            <DashboardLayout userType="produtor">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">Pedidos</h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie os pedidos dos seus clientes
                        </p>
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pending">Pendentes</SelectItem>
                            <SelectItem value="confirmed">Confirmados</SelectItem>
                            <SelectItem value="preparing">Em preparo</SelectItem>
                            <SelectItem value="shipped">Enviados</SelectItem>
                            <SelectItem value="delivered">Entregues</SelectItem>
                            <SelectItem value="cancelled">Cancelados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 && (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground">
                                Nenhum pedido encontrado.
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
                                            {statusLabel[order.status] ?? order.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString("pt-BR")}
                                        </span>
                                        <Link to={`/producer/pedidos/${order.id}`}>
                                            <Button variant="outline" size="sm">Detalhes</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            Cliente
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-primary"/>
                                                {order.customer?.name ?? "Cliente não informado"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            Resumo
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="pt-2 border-t border-border flex justify-between font-medium">
                                                <span>Total</span>
                                                <span className="text-primary">
                          R$ {order.total_amount.toFixed(2)}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {order.status !== "delivered" && order.status !== "cancelled" && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                        {order.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    disabled={updateOrderStatus.isPending}
                                                    onClick={() => updateStatus(order.id, "confirmed")}
                                                >
                                                    Confirmar Pedido
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updateOrderStatus.isPending}
                                                    onClick={() => updateStatus(order.id, "cancelled")}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}
                                        {order.status === "confirmed" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    disabled={updateOrderStatus.isPending}
                                                    onClick={() => updateStatus(order.id, "preparing")}
                                                >
                                                    Marcar como Em preparo
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updateOrderStatus.isPending}
                                                    onClick={() => updateStatus(order.id, "cancelled")}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}
                                        {order.status === "preparing" && (
                                            <Button
                                                size="sm"
                                                disabled={updateOrderStatus.isPending}
                                                onClick={() => updateStatus(order.id, "shipped")}
                                            >
                                                Marcar como Enviado
                                            </Button>
                                        )}
                                        {order.status === "shipped" && (
                                            <Button
                                                size="sm"
                                                disabled={updateOrderStatus.isPending}
                                                onClick={() => updateStatus(order.id, "delivered")}
                                            >
                                                Marcar como Entregue
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorPedidos;
