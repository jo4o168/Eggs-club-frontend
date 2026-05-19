import type {ApiResponse, LoginRequest, LoginResponse} from "../models/rest/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class AuthService {
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const res = await fetch(`${API_URL}/auth/sign-in`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        const payload = (await res.json()) as ApiResponse<LoginResponse> & {
            message?: string;
            errors?: Record<string, string[]>;
        };

        if (!res.ok) {
            const fromErrors = payload.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
            throw new Error(fromErrors ?? payload.message ?? "Falha no login");
        }

        return payload as ApiResponse<LoginResponse>;
    }
}
