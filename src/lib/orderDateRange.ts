/** Inclusive calendar-day range filter for order `created_at` (ISO). */

export type OrderDateRange = {
    from: string; // yyyy-mm-dd or ""
    to: string;
};

export function isOrderInDateRange(
    createdAt: string,
    range: OrderDateRange,
): boolean {
    if (!range.from && !range.to) return true;

    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return false;

    if (range.from) {
        const start = new Date(`${range.from}T00:00:00`);
        if (created < start) return false;
    }

    if (range.to) {
        const end = new Date(`${range.to}T23:59:59.999`);
        if (created > end) return false;
    }

    return true;
}

export function filterByCreatedAtDateRange<T extends {created_at: string}>(
    items: T[],
    range: OrderDateRange,
): T[] {
    if (!range.from && !range.to) return items;
    return items.filter((item) => isOrderInDateRange(item.created_at, range));
}
