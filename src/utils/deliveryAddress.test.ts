import {describe, expect, it} from "vitest";
import {formatDeliveryAddress, isDeliveryAddressComplete, splitStreetAndNumber} from "./deliveryAddress";

describe("isDeliveryAddressComplete", () => {
    const base = {
        address: "Rua das Flores",
        number: "123",
        city: "Campinas",
        state: "SP",
        zipCode: "13010-000",
    };

    it("accepts a full Brazilian address", () => {
        expect(isDeliveryAddressComplete(base)).toBe(true);
    });

    it("rejects missing street, house number, city, UF or CEP", () => {
        expect(isDeliveryAddressComplete({...base, address: "Rua"})).toBe(false);
        expect(isDeliveryAddressComplete({...base, number: ""})).toBe(false);
        expect(isDeliveryAddressComplete({...base, city: ""})).toBe(false);
        expect(isDeliveryAddressComplete({...base, state: "S"})).toBe(false);
        expect(isDeliveryAddressComplete({...base, zipCode: "13010"})).toBe(false);
    });
});

describe("splitStreetAndNumber", () => {
    it("extracts a trailing house number from older saved addresses", () => {
        expect(splitStreetAndNumber("Rua das Flores, 123")).toEqual({
            street: "Rua das Flores",
            number: "123",
        });
    });
});

describe("formatDeliveryAddress", () => {
    it("formats recipient, street and locality for the producer", () => {
        expect(
            formatDeliveryAddress({
                recipientName: "Maria Silva",
                phone: "(19) 98888-0000",
                address: "Rua das Flores",
                number: "123",
                complement: "Apto 12",
                city: "Campinas",
                state: "sp",
                zipCode: "13010000",
            }),
        ).toBe(
            [
                "Maria Silva",
                "(19) 98888-0000",
                "Rua das Flores, nº 123 — Apto 12",
                "Campinas/SP — CEP 13010-000",
            ].join("\n"),
        );
    });
});
