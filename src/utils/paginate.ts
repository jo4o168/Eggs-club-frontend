export const CATALOG_PAGE_SIZE = 12;

export type Paginated<T> = {
    items: T[];
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
};

export function paginate<T>(
    items: T[],
    page: number,
    pageSize: number = CATALOG_PAGE_SIZE,
): Paginated<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
    const start = (currentPage - 1) * pageSize;

    return {
        items: items.slice(start, start + pageSize),
        currentPage,
        totalPages,
        total,
        pageSize,
    };
}

export function pageContainingIndex(index: number, pageSize: number = CATALOG_PAGE_SIZE): number {
    if (index < 0) return 1;
    return Math.floor(index / pageSize) + 1;
}

export function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
    if (total <= 1) return [1];
    if (total <= 7) {
        return Array.from({length: total}, (_, index) => index + 1);
    }

    const items: Array<number | "ellipsis"> = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) items.push("ellipsis");
    for (let page = start; page <= end; page += 1) {
        items.push(page);
    }
    if (end < total - 1) items.push("ellipsis");
    items.push(total);

    return items;
}

export function readPageParam(search: string): number {
    const page = Number(new URLSearchParams(search).get("page") ?? 1);
    if (!Number.isFinite(page) || page < 1) return 1;
    return Math.floor(page);
}
