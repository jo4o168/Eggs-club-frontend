import DemoPixPanel from "@/components/checkout/DemoPixPanel";
import DemoCardPaidPanel from "@/components/checkout/DemoCardPaidPanel";
import type {OrderPayment} from "@/hooks/useOrders";
import {paymentTypeLabel} from "@/utils/paymentLabels";

interface OrderPaymentPanelProps {
    orderId: number;
    payment?: OrderPayment | null;
    extraNote?: string;
}

const OrderPaymentPanel = ({orderId, payment, extraNote}: OrderPaymentPanelProps) => {
    const type = payment?.type ?? null;

    if (type === "pix") {
        return (
            <div className="text-left rounded-xl border border-border p-4">
                <h2 className="font-display font-semibold mb-3">Pague com Pix</h2>
                <DemoPixPanel orderId={orderId}/>
                {extraNote ? <p className="text-xs text-muted-foreground mt-3">{extraNote}</p> : null}
            </div>
        );
    }

    if (type === "credit_card" || type === "debit_card") {
        return (
            <div className="text-left rounded-xl border border-border p-4">
                <h2 className="font-display font-semibold mb-3">Pagamento no cartão</h2>
                <DemoCardPaidPanel type={type} last_four={payment?.last_four} card_brand={payment?.card_brand}/>
            </div>
        );
    }

    return (
        <div className="text-left rounded-xl border border-border p-4 space-y-2">
            <h2 className="font-display font-semibold">Pagamento</h2>
            <p className="text-sm text-muted-foreground">
                {type ? `${paymentTypeLabel(type)} registrado neste pedido.` : "Pagamento confirmado neste pedido."}
            </p>
        </div>
    );
};

export default OrderPaymentPanel;
