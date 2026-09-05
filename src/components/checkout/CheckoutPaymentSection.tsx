import {Link} from "react-router-dom";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import type {PaymentMethod} from "@/hooks/usePayments";
import {paymentMethodLabel, paymentTypeLabel} from "@/utils/paymentLabels";
import {CreditCard} from "lucide-react";
import {cn} from "@/lib/utils";

interface CheckoutPaymentSectionProps {
    methods: PaymentMethod[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

const CheckoutPaymentSection = ({methods, selectedId, onSelect}: CheckoutPaymentSectionProps) => {
    if (methods.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary"/>
                    <h2 className="font-display text-xl font-semibold">Pagamento</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Cadastre um cartão ou Pix para confirmar o pedido. O produtor só inicia o preparo depois desta confirmação.
                </p>
                <Button asChild>
                    <Link to="/customer/pagamentos">Cadastrar forma de pagamento</Link>
                </Button>
            </div>
        );
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-xl font-semibold">Pagamento</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Escolha como este pedido será cobrado.
                    </p>
                </div>
                <Button variant="link" className="px-0 h-auto" asChild>
                    <Link to="/customer/pagamentos">Gerenciar</Link>
                </Button>
            </div>

            <RadioGroup
                value={selectedId ? String(selectedId) : ""}
                onValueChange={(value) => onSelect(Number(value))}
                className="gap-3"
            >
                {methods.map((method) => {
                    const selected = selectedId === method.id;
                    return (
                        <Label
                            key={method.id}
                            htmlFor={`pm-${method.id}`}
                            className={cn(
                                "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors",
                                selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                            )}
                        >
                            <RadioGroupItem id={`pm-${method.id}`} value={String(method.id)} className="mt-0.5"/>
                            <span className="space-y-0.5">
                                <span className="block font-medium">{paymentMethodLabel(method)}</span>
                                <span className="block text-xs text-muted-foreground font-normal">
                                    {paymentTypeLabel(method.type)}
                                    {method.expiration_month && method.expiration_year
                                        ? ` · validade ${String(method.expiration_month).padStart(2, "0")}/${method.expiration_year}`
                                        : ""}
                                </span>
                            </span>
                        </Label>
                    );
                })}
            </RadioGroup>
        </section>
    );
};

export default CheckoutPaymentSection;
