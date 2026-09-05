import {onlyDigits} from "@/utils/inputMasks";

export interface DeliveryAddressParts {
    recipientName?: string | null;
    phone?: string | null;
    address: string;
    number?: string | null;
    complement?: string | null;
    city: string;
    state: string;
    zipCode: string;
}

const TRAILING_NUMBER = /,\s*(?:n[ºo°.]?\s*)?(\d+[A-Za-z0-9\-\/]*|S\/N)$/i;

export function splitStreetAndNumber(line: string): {street: string; number: string} {
    const trimmed = line.trim();
    const match = trimmed.match(TRAILING_NUMBER);
    if (!match || match.index == null) {
        return {street: trimmed, number: ""};
    }
    return {street: trimmed.slice(0, match.index).trim(), number: match[1]};
}

export function formatStreetWithNumber(street: string, number?: string | null): string {
    const line = street.trim();
    const houseNumber = number?.trim();
    if (!line) return "";
    if (!houseNumber) return line;
    return `${line}, nº ${houseNumber}`;
}

export function isDeliveryAddressComplete(parts: DeliveryAddressParts): boolean {
    const street = parts.address.trim();
    const houseNumber = (parts.number ?? "").trim();
    const city = parts.city.trim();
    const state = parts.state.trim().toUpperCase();
    const zip = onlyDigits(parts.zipCode);

    return street.length >= 5 && houseNumber.length >= 1 && city.length >= 2 && state.length === 2 && zip.length === 8;
}

export function formatDeliveryAddress(parts: DeliveryAddressParts): string {
    const lines: string[] = [];
    const name = parts.recipientName?.trim();
    const phone = parts.phone?.trim();
    const street = formatStreetWithNumber(parts.address, parts.number);
    const complement = parts.complement?.trim();
    const city = parts.city.trim();
    const state = parts.state.trim().toUpperCase();
    const zip = onlyDigits(parts.zipCode);
    const zipMasked = zip.length === 8 ? `${zip.slice(0, 5)}-${zip.slice(5)}` : parts.zipCode.trim();

    if (name) lines.push(name);
    if (phone) lines.push(phone);

    if (street && complement) {
        lines.push(`${street} — ${complement}`);
    } else if (street) {
        lines.push(street);
    }

    const locality = [city, state].filter(Boolean).join("/");
    if (locality && zipMasked) {
        lines.push(`${locality} — CEP ${zipMasked}`);
    } else if (locality) {
        lines.push(locality);
    } else if (zipMasked) {
        lines.push(`CEP ${zipMasked}`);
    }

    return lines.join("\n");
}
