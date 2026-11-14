import {describe, expect, it} from "vitest";
import {identityIsComplete, isAdult, isValidCnpj, isValidCpf, maskCnpj} from "./brazilianDocument";

describe("brazilianDocument", () => {
    it("validates CPF check digits", () => {
        expect(isValidCpf("390.533.447-05")).toBe(true);
        expect(isValidCpf("111.111.111-11")).toBe(false);
    });

    it("validates CNPJ check digits", () => {
        expect(isValidCnpj("11.444.777/0001-61")).toBe(true);
        expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    });

    it("requires 18 years", () => {
        expect(isAdult("2008-11-14", new Date("2026-11-14T12:00:00"))).toBe(true);
        expect(isAdult("2008-11-15", new Date("2026-11-14T12:00:00"))).toBe(false);
    });

    it("masks CNPJ", () => {
        expect(maskCnpj("11444777000161")).toBe("11.444.777/0001-61");
    });

    it("requires valid document and adulthood", () => {
        expect(identityIsComplete({cpf: "390.533.447-05", birthDate: "1998-01-15"})).toBe(true);
        expect(identityIsComplete({cpf: "390.533.447-05", birthDate: "2015-01-15"})).toBe(false);
    });
});
