import DashboardLayout from "@/components/DashboardLayout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Package, MapPin, Calendar, Eye} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const ClientePedidos = () => {
    const orders = [
        {
            id: "#1234",
            date: "15 de Janeiro, 2024",
            items: [{name: "Ovos Caipiras", quantity: 30, price: 18.9}],
            total: 18.9,
            status: "entregue",
            producer: "Fazenda Boa Vista",
            deliveryAddress: "Rua das Flores, 123 - São Paulo, SP",
            trackingCode: "BR1234567890",
        },
        {
            id: "#1220",
            date: "08 de Janeiro, 2024",
            items: [{name: "Ovos Caipiras", quantity: 30, price: 18.9}],
            total: 18.9,
            status: "entregue",
            producer: "Fazenda Boa Vista",
            deliveryAddress: "Rua das Flores, 123 - São Paulo, SP",
            trackingCode: "BR1234567889",
        },
        {
            id: "#1205",
            date: "01 de Janeiro, 2024",
            items: [{name: "Ovos Caipiras", quantity: 30, price: 18.9}],
            total: 18.9,
            status: "entregue",
            producer: "Fazenda Boa Vista",
            deliveryAddress: "Rua das Flores, 123 - São Paulo, SP",
            trackingCode: "BR1234567888",
        },
        {
            id: "#1190",
            date: "25 de Dezembro, 2023",
            items: [{name: "Ovos Caipiras", quantity: 30, price: 18.9}],
            total: 18.9,
            status: "entregue",
            producer: "Fazenda Boa Vista",
            deliveryAddress: "Rua das Flores, 123 - São Paulo, SP",
            trackingCode: "BR1234567887",
        },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pendente: "bg-yellow-100 text-yellow-700",
            confirmado: "bg-blue-100 text-blue-700",
            enviado: "bg-purple-100 text-purple-700",
            entregue: "bg-green-100 text-green-700",
            cancelado: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-semibold">Meus Pedidos</h1>
                    <p className="text-muted-foreground mt-1">
                        Histórico de todos os seus pedidos
                    </p>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg">{order.id}</CardTitle>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() +
                                                order.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4"/>
                                        {order.date}
                  </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Items */}
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                            Itens do Pedido
                                        </h4>
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-primary"/>
                                                    <span>
                            {item.quantity}x {item.name}
                          </span>
                                                </div>
                                                <span className="font-medium">
                          R$ {item.price.toFixed(2)}
                        </span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-border flex justify-between font-medium">
                                            <span>Total</span>
                                            <span className="text-primary">
                        R$ {order.total.toFixed(2)}
                      </span>
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                            Informações de Entrega
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-primary mt-0.5"/>
                                                {order.deliveryAddress}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Produtor: {order.producer}
                                            </p>
                                            {order.trackingCode && (
                                                <p className="text-muted-foreground">
                                                    Rastreio: {order.trackingCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-1"/>
                                                Ver Detalhes
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Pedido {order.id}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">Itens</h4>
                                                    {order.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between py-2 border-b border-border"
                                                        >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                                                            <span>R$ {item.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between py-2 font-bold">
                                                        <span>Total</span>
                                                        <span className="text-primary">
                              R$ {order.total.toFixed(2)}
                            </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">Entrega</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.deliveryAddress}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">Produtor</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.producer}
                                                    </p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="sm">
                                        Pedir Novamente
                                    </Button>
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
