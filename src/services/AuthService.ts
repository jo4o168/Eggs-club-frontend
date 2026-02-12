import type {ApiResponse, LoginRequest, LoginResponse} from "../models/rest";

export class AuthService {
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        await fetch('/api/auth/login')
    }
}