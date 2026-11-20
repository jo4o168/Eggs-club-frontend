import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import type {PaymentMethod} from "@/hooks/usePayments";
import {useCreatePaymentMethod} from "@/hooks/usePayments";
import {paymentMethodLabel, paymentTypeLabel} from "@/utils/paymentLabels";
import {cn} from "@/lib/utils";
import {CreditCard, Loader2, Plus, QrCode} from "lucide-react";
import AddPaymentMethodDialog, {type PaymentType} from "@/components/checkout/AddPaymentMethodDialog";

interface CheckoutPaymentSectionProps {
    methods: PaymentMethod[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    allowedTypes?: PaymentType[];
}

const TYPES: {id: PaymentType; label: string; hint: string}[] = [
    {id: "pix", label: "Pix", hint: "QR Code na confirmação"},
    {id: "credit_card", label: "Crédito", hint: "Cartão de crédito"},
    {id: "debit_card", label: "Débito", hint: "Cartão de débito"},
];

const CheckoutPaymentSection = ({methods, selectedId, onSelect, allowedTypes}: CheckoutPaymentSectionProps) => {
    const createPaymentMethod = useCreatePaymentMethod();
    const selected = methods.find((method) => method.id === selectedId) ?? null;
    const [activeType, setActiveType] = useState<PaymentType | null>((selected?.type as PaymentType | undefined) ?? null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<PaymentType>("credit_card");

    useEffect(() => {
        if (selected?.type) {
            setActiveType(selected.type as PaymentType);
        }
    }, [selected?.type]);

    const visibleTypes = useMemo(
        () => (allowedTypes?.length ? TYPES.filter((type) => allowedTypes.includes(type.id)) : TYPES),
        [allowedTypes],
    );

    useEffect(() => {
        if (visibleTypes.length === 1) {
            setActiveType(visibleTypes[0].id);
        }
    }, [visibleTypes]);

    const methodsOfType = useMemo(
        () => methods.filter((method) => method.type === activeType),
        [methods, activeType],
    );

    const pickType = async (type: PaymentType) => {
        if (allowedTypes?.length && !allowedTypes.includes(type)) return;
        setActiveType(type);
        const existing = methods.filter((method) => method.type === type);
        const preferred = existing.find((method) => method.is_default) ?? existing[0];
        if (preferred) {
            onSelect(preferred.id);
            return;
        }
        if (type === "pix") {
            try {
                const method = await createPaymentMethod.mutateAsync({
                    type: "pix",
                    is_default: methods.length === 0,
                });
                if (method?.id) onSelect(method.id);
            } catch {
                // toast already shown by the mutation
            }
            return;
        }
        setDialogType(type);
        setDialogOpen(true);
    };

    return (
        <section id="checkout-payment" className="rounded-2xl border border-border bg-card p-5 space-y-4 scroll-mt-24">
            <div>
                <h2 className="font-display text-xl font-semibold">Forma de pagamento</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {allowedTypes?.length === 1 && allowedTypes[0] === "credit_card"
                        ? "Plano de assinatura é cobrado só no cartão de crédito, para a recorrência."
                        : "Escolha Pix, crédito ou débito para este pedido. Dá para trocar agora, sem sair da finalização."}
                </p>
            </div>

            <div className={cn("grid gap-2", visibleTypes.length === 1 ? "grid-cols-1" : "grid-cols-3")}>
                {visibleTypes.map((type) => {
                    const active = activeType === type.id;
                    return (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => void pickType(type.id)}
                            disabled={createPaymentMethod.isPending}
                            className={cn(
                                "rounded-xl border-2 px-3 py-3 text-left transition-colors",
                                active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                            )}
                        >
                            <span className="flex items-center gap-2 font-medium text-sm">
                                {type.id === "pix" ? <QrCode className="h-4 w-4 text-primary"/> : <CreditCard className="h-4 w-4 text-primary"/>}
                                {type.label}
                            </span>
                            <span className="mt-1 block text-[11px] text-muted-foreground leading-snug">{type.hint}</span>
                        </button>
                    );
                })}
            </div>

            {createPaymentMethod.isPending && activeType === "pix" && methodsOfType.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    Preparando Pix para este pedido...
                </p>
            ) : null}

            {activeType !== "pix" && methodsOfType.length > 0 ? (
                <RadioGroup
                    value={selectedId && methodsOfType.some((method) => method.id === selectedId) ? String(selectedId) : ""}
                    onValueChange={(value) => onSelect(Number(value))}
                    className="gap-3"
                >
                    {methodsOfType.map((method) => {
                        const chosen = selectedId === method.id;
                        return (
                            <Label
                                key={method.id}
                                htmlFor={`pm-${method.id}`}
                                className={cn(
                                    "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors",
                                    chosen ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
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
            ) : null}

            {activeType === "pix" && methodsOfType.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                    Depois de confirmar, o pedido mostra o QR Code Pix de demonstração. Nada é cobrado de verdade.
                </p>
            ) : null}

            {activeType && activeType !== "pix" ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setDialogType(activeType);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4"/>
                    {methodsOfType.length === 0 ? "Cadastrar cartão para este pedido" : "Usar outro cartão"}
                </Button>
            ) : null}

            <AddPaymentMethodDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialType={dialogType}
                allowedTypes={allowedTypes}
                makeDefault={methods.length === 0}
                onCreated={(method) => {
                    setActiveType(method.type as PaymentType);
                    onSelect(method.id);
                }}
            />
        </section>
    );
};

export default CheckoutPaymentSection;
