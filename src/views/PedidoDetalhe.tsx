"use client";

import {useMemo, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Textarea} from "@/components/ui/textarea";
import {Link, useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, Calendar, Loader2, MapPin, Package, User} from "lucide-react";
import {OrderReview, useOrder, useUpdateOrderStatus} from "@/hooks/useOrders";
import {useSubmitOrderReview} from "@/hooks/usePresentationExtras";
import {ProducerOrderActions} from "@/components/ProducerOrderActions";
import DemoPixPanel from "@/components/checkout/DemoPixPanel";
import DemoNfeDialog from "@/components/checkout/DemoNfeDialog";
import StarRating from "@/components/StarRating";
import {useAuth} from "@/contexts/AuthContext";

const statusLabel: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    preparing: "Em preparo",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
};

const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function PedidoDetalhe() {
    const {id} = useParams<{ id: string }>();
    const orderId = useMemo(() => Number(id), [id]);
    const navigate = useNavigate();
    const {isProducer} = useAuth();
    const {data: order, isLoading, error} = useOrder(Number.isFinite(orderId) ? orderId : undefined);
    const updateOrderStatus = useUpdateOrderStatus();

    const viewerProducer = isProducer();

    if (!Number.isFinite(orderId) || orderId < 1) {
        return (
            <DashboardLayout userType={viewerProducer ? "produtor" : "cliente"}>
                <p className="text-muted-foreground">Pedido inválido.</p>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout userType={viewerProducer ? "produtor" : "cliente"}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !order) {
        return (
            <DashboardLayout userType={viewerProducer ? "produtor" : "cliente"}>
                <p className="text-destructive">Não foi possível carregar o pedido.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    Voltar
                </Button>
            </DashboardLayout>
        );
    }

    const backHref = viewerProducer ? "/producer/pedidos" : "/customer/pedidos";

    return (
        <DashboardLayout userType={viewerProducer ? "produtor" : "cliente"}>
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={backHref} className="gap-2">
                            <ArrowLeft className="w-4 h-4"/>
                            Voltar
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-semibold">
                            {order.order_number ?? `Pedido #${order.id}`}
                        </h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4"/>
                            {new Date(order.created_at).toLocaleString("pt-BR")}
                        </p>
                    </div>
                    <Badge className={statusColor[order.status] ?? "bg-muted"}>
                        {statusLabel[order.status] ?? order.status}
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Itens</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(order.items ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sem itens detalhados.</p>
                        ) : (
                            (order.items ?? []).map((line) => (
                                <div
                                    key={line.id}
                                    className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                                >
                                    <div className="flex gap-2">
                                        <Package className="w-4 h-4 text-primary shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="font-medium">{line.product_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {line.quantity} × R$ {Number(line.unit_price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-semibold whitespace-nowrap">
                                        R$ {(line.quantity * Number(line.unit_price)).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                        <div className="flex justify-between pt-2 font-semibold text-primary">
                            <span>Total</span>
                            <span>R$ {Number(order.total_amount).toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-4 h-4"/>
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p className="font-medium">{order.customer?.name ?? "—"}</p>
                            {order.customer?.email ? (
                                <p className="text-muted-foreground">{order.customer.email}</p>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-4 h-4"/>
                                Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="text-muted-foreground">
                                {order.delivery_address?.trim() ? order.delivery_address : "Endereço não informado."}
                            </p>
                            {order.notes?.trim() ? (
                                <div>
                                    <p className="font-medium text-foreground">Observações</p>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>

                {!viewerProducer && order.status !== "cancelled" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pix</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DemoPixPanel orderId={order.id}/>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Nota fiscal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {order.nfe_access_key ? (
                            <p className="text-sm font-mono break-all text-muted-foreground">
                                Chave {order.nfe_access_key}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                NF-e de demonstração pode ser gerada a qualquer momento para a apresentação.
                            </p>
                        )}
                        <DemoNfeDialog orderId={order.id} alreadyIssued={Boolean(order.nfe_access_key)}/>
                    </CardContent>
                </Card>

                {!viewerProducer && order.status !== "cancelled" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Avaliar kits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(order.items ?? [])
                                .filter((line) => line.product_id)
                                .map((line) => {
                                    const existing = (order.reviews ?? []).find((review) => review.product_id === line.product_id);
                                    return (
                                        <OrderItemReview
                                            key={line.id}
                                            orderId={order.id}
                                            productId={line.product_id as number}
                                            productName={line.product_name}
                                            existing={existing}
                                        />
                                    );
                                })}
                        </CardContent>
                    </Card>
                ) : null}

                {order.producer_message ? (
                    <Card className={order.status === "cancelled" ? "border-destructive/40" : "border-primary/30"}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {order.status === "cancelled" ? "Pedido cancelado" : "Atualização do produtor"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p className="whitespace-pre-wrap">{order.producer_message}</p>
                            {order.status === "cancelled" && (
                                <p className="text-muted-foreground">
                                    O valor de R$ {Number(order.total_amount).toFixed(2).replace(".", ",")} será estornado.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {viewerProducer && order.status !== "delivered" && order.status !== "cancelled" ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Atualizar status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProducerOrderActions
                                order={order}
                                disabled={updateOrderStatus.isPending}
                                onUpdate={(status, producer_message) =>
                                    updateOrderStatus.mutateAsync({id: order.id, status, producer_message})
                                }
                            />
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </DashboardLayout>
    );
}

function OrderItemReview({
    orderId,
    productId,
    productName,
    existing,
}: {
    orderId: number;
    productId: number;
    productName: string;
    existing?: OrderReview;
}) {
    const submitReview = useSubmitOrderReview(orderId);
    const [rating, setRating] = useState(existing?.rating ?? 0);
    const [comment, setComment] = useState(existing?.comment ?? "");

    return (
        <div className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sm">{productName}</p>
                <StarRating value={rating} onChange={setRating}/>
            </div>
            <Textarea
                rows={2}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Como estavam os ovos? (opcional)"
            />
            <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={rating < 1 || submitReview.isPending}
                onClick={() => void submitReview.mutateAsync({product_id: productId, rating, comment: comment.trim() || null})}
            >
                {existing ? "Atualizar avaliação" : "Enviar avaliação"}
            </Button>
        </div>
    );
}
