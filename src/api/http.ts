import {API_FIELD_LABELS, formatLaravelValidationMessage} from "@/lib/validationMessages";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getToken() {
    return localStorage.getItem("token");
}

interface ApiEnvelope<T> {
    data: T;
    message: string;
}

/** Erro de API com corpo de validação Laravel (`errors`). */
export class ApiRequestError extends Error {
    readonly status: number;
    readonly errors?: Record<string, string[] | string>;

    constructor(message: string, status: number, errors?: Record<string, string[] | string>) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Accept": "application/json",
                Authorization: `Bearer ${getToken()}`,
                ...(isFormData ? {} : {"Content-Type": "application/json"}),
                ...options.headers,
            },
        });
    } catch {
        throw new Error(`Falha de rede ao acessar ${API_URL}${path}. Verifique se o backend está rodando e CORS liberado.`);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        const payload = await res.json();
        if (!res.ok) {
            const errors = (payload as {errors?: Record<string, string[] | string>}).errors;
            if (errors && typeof errors === "object" && Object.keys(errors).length > 0) {
                throw new ApiRequestError(
                    formatLaravelValidationMessage(errors, API_FIELD_LABELS),
                    res.status,
                    errors,
                );
            }
            throw new ApiRequestError(
                (payload as {message?: string}).message ??
                    (payload as {error?: string}).error ??
                    `Erro ${res.status} em ${path}`,
                res.status,
            );
        }
        return (payload as ApiEnvelope<T>).data;
    }

    const text = await res.text();
    if (!res.ok) throw new Error(`Erro ${res.status} em ${path}: ${text.slice(0, 120)}`);
    throw new Error(`Resposta inesperada da API em ${path}`);
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, {method: "POST", body: JSON.stringify(body)}),
    postForm: <T>(path: string, body: FormData) => request<T>(path, {method: "POST", body}),
    putForm: <T>(path: string, body: FormData) => request<T>(path, {method: "PUT", body}),
    put: <T>(path: string, body: unknown) => request<T>(path, {method: "PUT", body: JSON.stringify(body)}),
    delete: <T>(path: string) => request<T>(path, {method: "DELETE"}),
};