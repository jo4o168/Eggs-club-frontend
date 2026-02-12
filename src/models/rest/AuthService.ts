export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginResponse = {
    access_token: string;
    user: {
        id: number;
        name: string;
    }
}