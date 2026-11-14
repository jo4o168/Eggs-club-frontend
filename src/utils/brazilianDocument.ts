import {maskCpf, onlyDigits} from "./inputMasks";

export function isValidCpf(value: string): boolean {
    const digits = onlyDigits(value);
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    return cpfDigit(digits, 9) === Number(digits[9]) && cpfDigit(digits, 10) === Number(digits[10]);
}

export function isValidCnpj(value: string): boolean {
    const digits = onlyDigits(value);
    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
    return cnpjDigit(digits, 12) === Number(digits[12]) && cnpjDigit(digits, 13) === Number(digits[13]);
}

export function identityIsComplete(input: {
    documentType?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    document?: string | null;
    birthDate?: string | null;
}): boolean {
    const type = input.documentType === "cnpj" ? "cnpj" : "cpf";
    const document = input.document ?? (type === "cnpj" ? input.cnpj : input.cpf) ?? "";
    const valid = type === "cnpj" ? isValidCnpj(document) : isValidCpf(document);
    return valid && isAdult(input.birthDate ?? "");
}

export function isAdult(birthDate: string, today = new Date()): boolean {
    if (!birthDate) return false;
    const born = new Date(`${birthDate}T00:00:00`);
    if (Number.isNaN(born.getTime()) || born > today) return false;
    const age = today.getFullYear() - born.getFullYear();
    const hadBirthday =
        today.getMonth() > born.getMonth() ||
        (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
    return (hadBirthday ? age : age - 1) >= 18;
}

export function maskCnpj(value: string): string {
    const digits = onlyDigits(value).slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskDocument(value: string, type: "cpf" | "cnpj"): string {
    return type === "cnpj" ? maskCnpj(value) : maskCpf(value);
}

function cpfDigit(digits: string, length: number): number {
    let sum = 0;
    const weight = length + 1;
    for (let i = 0; i < length; i += 1) {
        sum += Number(digits[i]) * (weight - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
}

function cnpjDigit(digits: string, length: number): number {
    const weights = length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
        sum += Number(digits[i]) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
}
