export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    accessToken: string
    user: {
        id: number
        name: string
        roles: number
    }
}

export type ApiResponse<T = any> = {
    data: T
    message: string
}
