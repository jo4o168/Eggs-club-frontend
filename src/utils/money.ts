export function formatMoney(value: unknown): string {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "0,00";
    return parsed.toFixed(2).replace(".", ",");
}

export function formatBRL(value: unknown): string {
    return `R$ ${formatMoney(value)}`;
}
