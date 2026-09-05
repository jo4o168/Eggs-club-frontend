const TYPE_LABELS: Record<string, string> = {
    credit_card: "Cartão de crédito",
    debit_card: "Cartão de débito",
    pix: "Pix",
};

export function paymentTypeLabel(type: string | null | undefined): string {
    if (!type) return "Pagamento";
    return TYPE_LABELS[type] ?? type;
}

export function paymentMethodLabel(method: {
    type: string;
    last_four?: string | null;
    card_brand?: string | null;
    is_default?: boolean;
}): string {
    const brand = method.card_brand?.trim();
    const type = paymentTypeLabel(method.type);
    const lastFour = method.last_four ? `•••• ${method.last_four}` : null;
    const parts = [brand && brand !== "Cartão" ? `${type} ${brand}` : type, lastFour].filter(Boolean);
    const label = parts.join(" · ");
    return method.is_default ? `${label} (padrão)` : label;
}
