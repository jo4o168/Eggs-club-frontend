import {describe, expect, it} from "vitest";
import {CATALOG_PAGE_SIZE, pageContainingIndex, paginate, paginationItems, readPageParam} from "./paginate";

describe("paginate", () => {
    it("returns an empty first page when there are no items", () => {
        expect(paginate([], 1)).toEqual({
            items: [],
            currentPage: 1,
            totalPages: 1,
            total: 0,
            pageSize: CATALOG_PAGE_SIZE,
        });
    });

    it("slices the requested page and clamps out-of-range pages", () => {
        const items = Array.from({length: 20}, (_, index) => index + 1);

        expect(paginate(items, 2, 12).items).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
        expect(paginate(items, 2, 12).totalPages).toBe(2);
        expect(paginate(items, 99, 12).currentPage).toBe(2);
        expect(paginate(items, 0, 12).currentPage).toBe(1);
    });
});

describe("pageContainingIndex", () => {
    it("maps a zero-based index to a 1-based page", () => {
        expect(pageContainingIndex(0, 12)).toBe(1);
        expect(pageContainingIndex(11, 12)).toBe(1);
        expect(pageContainingIndex(12, 12)).toBe(2);
    });
});

describe("paginationItems", () => {
    it("lists every page when the catalog is short", () => {
        expect(paginationItems(1, 4)).toEqual([1, 2, 3, 4]);
    });

    it("keeps first and last pages with an ellipsis window", () => {
        expect(paginationItems(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
    });
});

describe("readPageParam", () => {
    it("reads a positive integer page from the query string", () => {
        expect(readPageParam("?q=ovos&page=3")).toBe(3);
        expect(readPageParam("")).toBe(1);
        expect(readPageParam("?page=abc")).toBe(1);
    });
});
