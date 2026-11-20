import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {toast} from "@/hooks/use-toast";
import {useCreatePaymentMethod, type PaymentMethod} from "@/hooks/usePayments";
import {Loader2} from "lucide-react";

export type PaymentType = "credit_card" | "debit_card" | "pix";

interface AddPaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialType?: PaymentType;
    allowedTypes?: PaymentType[];
    makeDefault?: boolean;
    onCreated?: (method: PaymentMethod) => void;
}

function detectCardBrand(number: string): string {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "American Express";
    if (cleaned.startsWith("6011")) return "Discover";
    return "Cartão";
}

function formatCardNumber(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
}

function formatExpiry(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
}

const ALL_TYPES: PaymentType[] = ["credit_card", "debit_card", "pix"];

const AddPaymentMethodDialog = ({
    open,
    onOpenChange,
    initialType = "credit_card",
    allowedTypes = ALL_TYPES,
    makeDefault = false,
    onCreated,
}: AddPaymentMethodDialogProps) => {
    const createPaymentMethod = useCreatePaymentMethod();
    const [cardType, setCardType] = useState<PaymentType>(initialType);
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");

    useEffect(() => {
        if (!open) return;
        const nextType = allowedTypes.includes(initialType) ? initialType : allowedTypes[0] ?? "credit_card";
        setCardType(nextType);
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setCardName("");
    }, [open, initialType, allowedTypes]);

    const handleSave = async () => {
        try {
            if (cardType === "pix") {
                const method = await createPaymentMethod.mutateAsync({
                    type: "pix",
                    is_default: makeDefault,
                });
                if (method?.id) onCreated?.(method);
                onOpenChange(false);
                return;
            }

            const cleaned = cardNumber.replace(/\s/g, "");
            if (cleaned.length < 13) {
                toast({title: "Número do cartão inválido", variant: "destructive"});
                return;
            }

            const [monthStr = "", yearStr = ""] = cardExpiry.split("/");
            const method = await createPaymentMethod.mutateAsync({
                type: cardType,
                card_last_four: cleaned.slice(-4),
                card_brand: detectCardBrand(cleaned),
                expiration_month: Number(monthStr) || undefined,
                expiration_year: yearStr ? Number(`20${yearStr}`) : undefined,
                is_default: makeDefault,
            });
            if (method?.id) onCreated?.(method);
            onOpenChange(false);
        } catch {
            // toast already shown by the mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {cardType === "pix" ? "Adicionar Pix" : "Adicionar cartão"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {allowedTypes.length > 1 ? (
                        <div className="space-y-2">
                            <Label htmlFor="checkout-pm-type">Forma</Label>
                            <Select value={cardType} onValueChange={(value: PaymentType) => setCardType(value)}>
                                <SelectTrigger id="checkout-pm-type">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {allowedTypes.includes("credit_card") ? (
                                        <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                                    ) : null}
                                    {allowedTypes.includes("debit_card") ? (
                                        <SelectItem value="debit_card">Cartão de débito</SelectItem>
                                    ) : null}
                                    {allowedTypes.includes("pix") ? (
                                        <SelectItem value="pix">Pix</SelectItem>
                                    ) : null}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : allowedTypes[0] === "credit_card" ? (
                        <p className="text-sm text-muted-foreground">
                            Assinatura usa cartão de crédito para a cobrança recorrente.
                        </p>
                    ) : null}
                    {cardType !== "pix" ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="checkout-card-number">Número do cartão</Label>
                                <Input
                                    id="checkout-card-number"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="checkout-card-expiry">Validade</Label>
                                    <Input
                                        id="checkout-card-expiry"
                                        placeholder="MM/AA"
                                        value={cardExpiry}
                                        onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="checkout-card-cvv">CVV</Label>
                                    <Input
                                        id="checkout-card-cvv"
                                        placeholder="123"
                                        value={cardCvv}
                                        onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="checkout-card-name">Nome no cartão</Label>
                                <Input
                                    id="checkout-card-name"
                                    placeholder="JOAO SILVA"
                                    value={cardName}
                                    onChange={(event) => setCardName(event.target.value.toUpperCase())}
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nesta apresentação o Pix gera um QR Code depois de confirmar o pedido. Não precisa de chave real.
                        </p>
                    )}
                    <Button
                        variant="hero"
                        className="w-full"
                        onClick={() => void handleSave()}
                        disabled={createPaymentMethod.isPending}
                    >
                        {createPaymentMethod.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                        {cardType === "pix" ? "Usar Pix neste pedido" : "Salvar e usar neste pedido"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddPaymentMethodDialog;
