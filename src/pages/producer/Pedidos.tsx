import {useState} from "react";
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
import {Package, MapPin, Phone, User} from "lucide-react";
import {toast} from "@/hooks/use-toast";

interface Order {
    id: string;
    client: {
        name: string;
        phone: string;
        address: string;
    };
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";
    date: string;
    subscription: string;
}

const ProdutorPedidos = () => {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: "#1234",
            client: {
                name: "Maria Silva",
                phone: "(11) 99999-9999",
                address: "Rua das Flores, 123 - São Paulo, SP",
            },
            items: [{name: "Ovos Caipiras (30un)", quantity: 2, price: 18.9}],
            total: 37.8,
            status: "pendente",
            date: "2024-01-15",
            subscription: "Plano Semanal",
        },
        {
            id: "#1233",
            client: {
                name: "João Santos",
                phone: "(11) 88888-8888",
                address: "Av. Brasil, 456 - São Paulo, SP",
            },
            items: [
                {name: "Ovos Orgânicos (12un)", quantity: 1, price: 24.9},
                {name: "Ovos de Codorna (50un)", quantity: 1, price: 15.9},
            ],
            total: 40.8,
            status: "confirmado",
            date: "2024-01-14",
            subscription: "Plano Mensal",
        },
        {
            id: "#1232",
            client: {
                name: "Ana Costa",
                phone: "(11) 77777-7777",
                address: "Rua São Paulo, 789 - Campinas, SP",
            },
            items: [{name: "Ovos Caipiras (30un)", quantity: 3, price: 18.9}],
            total: 56.7,
            status: "entregue",
            date: "2024-01-13",
            subscription: "Plano Quinzenal",
        },
    ]);

    const [filter, setFilter] = useState<string>("todos");

    const updateStatus = (orderId: string, newStatus: Order["status"]) => {
        setOrders(
            orders.map((order) =>
                order.id === orderId ? {...order, status: newStatus} : order
            )
        );
        toast({title: `Status atualizado para: ${newStatus}`});
    };

    const getStatusColor = (status: Order["status"]) => {
        const colors = {
            pendente: "bg-yellow-100 text-yellow-700",
            confirmado: "bg-blue-100 text-blue-700",
            enviado: "bg-purple-100 text-purple-700",
            entregue: "bg-green-100 text-green-700",
            cancelado: "bg-red-100 text-red-700",
        };
        return colors[status];
    };

    const filteredOrders =
        filter === "todos"
            ? orders
            : orders.filter((order) => order.status === filter);

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
                            <SelectItem value="pendente">Pendentes</SelectItem>
                            <SelectItem value="confirmado">Confirmados</SelectItem>
                            <SelectItem value="enviado">Enviados</SelectItem>
                            <SelectItem value="entregue">Entregues</SelectItem>
                            <SelectItem value="cancelado">Cancelados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg">{order.id}</CardTitle>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() +
                                                order.status.slice(1)}
                                        </Badge>
                                        <Badge variant="outline">{order.subscription}</Badge>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("pt-BR")}
                  </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Client Info */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            Dados do Cliente
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-primary"/>
                                                {order.client.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-primary"/>
                                                {order.client.phone}
                                            </div>
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-primary mt-0.5"/>
                                                {order.client.address}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            Itens do Pedido
                                        </h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-primary"/>
                                                        <span>
                              {item.quantity}x {item.name}
                            </span>
                                                    </div>
                                                    <span>
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                                                </div>
                                            ))}
                                            <div
                                                className="pt-2 border-t border-border flex justify-between font-medium">
                                                <span>Total</span>
                                                <span className="text-primary">
                          R$ {order.total.toFixed(2)}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {order.status !== "entregue" && order.status !== "cancelado" && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                        {order.status === "pendente" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(order.id, "confirmado")}
                                                >
                                                    Confirmar Pedido
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateStatus(order.id, "cancelado")}
                                                >
                                                    Cancelar
                                                </Button>
                                            </>
                                        )}
                                        {order.status === "confirmado" && (
                                            <Button
                                                size="sm"
                                                onClick={() => updateStatus(order.id, "enviado")}
                                            >
                                                Marcar como Enviado
                                            </Button>
                                        )}
                                        {order.status === "enviado" && (
                                            <Button
                                                size="sm"
                                                onClick={() => updateStatus(order.id, "entregue")}
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
