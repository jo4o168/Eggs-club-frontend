import {createContext, ReactNode, useContext, useEffect, useState} from "react";

// Espelha o enum do Laravel
export enum ProfileRole {
    CLIENT = 0,
    PRODUCER = 1,
    ADMIN = 2,
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: ProfileRole;
}

interface AuthContextType {
    user: User | null;
    profile: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: ProfileRole, farmName?: string, location?: string) => Promise<void>;
    logout: () => void;
    isProducer: () => boolean;
    isClient: () => boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    async function signIn(email: string, password: string) {
        const res = await fetch(`${API_URL}/auth/sign-in`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password}),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Credenciais inválidas");

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    }

    async function signUp(
        email: string,
        password: string,
        name: string,
        role: ProfileRole,
        farmName?: string,
        location?: string
    ) {
        const username = email.split("@")[0];

        const res = await fetch(`${API_URL}/auth/sign-up`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password, name, username, roles: role}),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message ?? "Erro ao criar conta");
        }

        await signIn(email, password);
    }

    function isProducer() {
        return user?.roles === ProfileRole.PRODUCER;
    }

    function isClient() {
        return user?.roles === ProfileRole.CLIENT;
    }

    return (
        <AuthContext.Provider value={{user, profile: user, loading, signIn, signUp, logout, isProducer, isClient}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }
    return context;
}