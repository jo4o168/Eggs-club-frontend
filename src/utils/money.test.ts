import {describe, expect, it} from "vitest";
import {formatBRL, formatMoney} from "./money";

describe("formatMoney", () => {
    it("formats BRL with comma decimals", () => {
        expect(formatMoney(12)).toBe("12,00");
        expect(formatMoney(12.5)).toBe("12,50");
        expect(formatBRL(9.9)).toBe("R$ 9,90");
    });

    it("falls back to zero for invalid values", () => {
        expect(formatMoney("abc")).toBe("0,00");
    });
});
