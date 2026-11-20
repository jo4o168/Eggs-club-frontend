import {describe, expect, it} from "vitest";
import {allowsOneTimePurchase, allowsSubscription} from "./productPurchase";

describe("allowsOneTimePurchase", () => {
    it("only treats explicit true flags as compra única", () => {
        expect(allowsOneTimePurchase({allow_one_time_purchase: true})).toBe(true);
        expect(allowsOneTimePurchase({allow_one_time_purchase: 1})).toBe(true);
        expect(allowsOneTimePurchase({allow_one_time_purchase: "1"})).toBe(true);
        expect(allowsOneTimePurchase({allow_one_time_purchase: false})).toBe(false);
        expect(allowsOneTimePurchase({allow_one_time_purchase: 0})).toBe(false);
        expect(allowsOneTimePurchase({allow_one_time_purchase: undefined})).toBe(false);
        expect(allowsOneTimePurchase(null)).toBe(false);
    });

    it("does not infer compra única from leftover price", () => {
        expect(allowsOneTimePurchase({
            allow_one_time_purchase: false,
            one_time_price: 22,
        } as {allow_one_time_purchase?: unknown})).toBe(false);
    });
});

describe("allowsSubscription", () => {
    it("reads the subscription flag strictly", () => {
        expect(allowsSubscription({allow_subscription: true})).toBe(true);
        expect(allowsSubscription({allow_subscription: false})).toBe(false);
        expect(allowsSubscription({})).toBe(false);
    });
});
