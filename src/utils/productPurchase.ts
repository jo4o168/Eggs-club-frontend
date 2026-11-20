export function isFlagTrue(value: unknown): boolean {
    return value === true || value === 1 || value === "1" || value === "true";
}

export function allowsOneTimePurchase(product: {allow_one_time_purchase?: unknown} | null | undefined): boolean {
    return isFlagTrue(product?.allow_one_time_purchase);
}

export function allowsSubscription(product: {allow_subscription?: unknown} | null | undefined): boolean {
    return isFlagTrue(product?.allow_subscription);
}
