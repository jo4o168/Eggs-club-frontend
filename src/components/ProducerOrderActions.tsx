import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Order} from "@/hooks/useOrders";

type Props = {
    order: Order;
    disabled?: boolean;
    onUpdate: (status: Order["status"], producerMessage?: string) => Promise<void>;
};

export function ProducerOrderActions({order, disabled, onUpdate}: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (order.status === "delivered" || order.status === "cancelled") {
        return null;
    }

    const runUpdate = async (status: Order["status"], message?: string) => {
        setSubmitting(true);
        try {
            await onUpdate(status, message);
            setConfirmOpen(false);
            setCancelOpen(false);
            setCancelReason("");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        const reason = cancelReason.trim();
        if (reason.length < 5) {
            return;
        }
        await runUpdate("cancelled", reason);
    };

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {order.status === "pending" && (
                    <>
                        <Button size="sm" disabled={disabled || submitting} onClick={() => setConfirmOpen(true)}>
                            Confirmar Pedido
                        </Button>
                        <Button variant="outline" size="sm" disabled={disabled || submitting} onClick={() => setCancelOpen(true)}>
                            Cancelar
                        </Button>
                    </>
                )}
                {order.status === "confirmed" && (
                    <>
                        <Button size="sm" disabled={disabled || submitting} onClick={() => void runUpdate("preparing")}>
                            Marcar como Em preparo
                        </Button>
                        <Button variant="outline" size="sm" disabled={disabled || submitting} onClick={() => setCancelOpen(true)}>
                            Cancelar
                        </Button>
                    </>
                )}
                {order.status === "preparing" && (
                    <Button size="sm" disabled={disabled || submitting} onClick={() => void runUpdate("shipped")}>
                        Marcar como Enviado
                    </Button>
                )}
                {order.status === "shipped" && (
                    <Button size="sm" disabled={disabled || submitting} onClick={() => void runUpdate("delivered")}>
                        Marcar como Entregue
                    </Button>
                )}
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar este pedido?</DialogTitle>
                        <DialogDescription>
                            Tem certeza? O cliente será informado que o pedido{" "}
                            <strong>{order.order_number ?? `#${order.id}`}</strong> foi confirmado e está em preparação.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                            Voltar
                        </Button>
                        <Button disabled={submitting} onClick={() => void runUpdate("confirmed")}>
                            {submitting ? "Confirmando..." : "Sim, confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar pedido?</DialogTitle>
                        <DialogDescription>
                            O cliente verá o motivo abaixo e será informado de que o valor de{" "}
                            <strong>R$ {Number(order.total_amount).toFixed(2).replace(".", ",")}</strong> será estornado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor={`cancel-reason-${order.id}`}>Observação para o cliente *</Label>
                        <Textarea
                            id={`cancel-reason-${order.id}`}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Explique o motivo do cancelamento..."
                            rows={4}
                        />
                        {cancelReason.trim().length > 0 && cancelReason.trim().length < 5 && (
                            <p className="text-xs text-destructive">Escreva pelo menos 5 caracteres.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={submitting}>
                            Voltar
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={submitting || cancelReason.trim().length < 5}
                            onClick={() => void handleCancel()}
                        >
                            {submitting ? "Cancelando..." : "Cancelar e estornar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
