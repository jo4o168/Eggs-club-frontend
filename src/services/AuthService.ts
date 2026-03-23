import http from "../api/http"
import type {ApiResponse, LoginRequest, LoginResponse} from "../models/rest/auth"
import type {AxiosResponse} from "axios"

export class AuthService {
    async login(
        credentials: LoginRequest
    ): Promise<ApiResponse<LoginResponse>> {

        const response: AxiosResponse<ApiResponse<LoginResponse>> =
            await http.post(
                "/auth/sign-in",
                credentials
            )

        return response.data
    }
}
