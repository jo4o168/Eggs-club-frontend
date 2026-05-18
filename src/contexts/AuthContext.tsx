import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {api, ApiRequestError} from "@/api/http";
import {API_FIELD_LABELS, formatLaravelValidationMessage} from "@/lib/validationMessages";

// Espelha o enum do Laravel
export enum ProfileRole {
    CLIENT = 0,
    PRODUCER = 1,
}

interface User {
    id: number;
    profile_id?: number;
    name: string;
    email?: string;
    avatar_url?: string | null;
    roles: ProfileRole;
}

export interface ProducerSettings {
    id?: number;
    farm_name?: string | null;
    description?: string | null;
    certifications?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    website?: string | null;
    delivery_info?: string | null;
    accepts_new_subscribers?: boolean;
    visible_in_search?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    new_order_alert?: boolean;
    weekly_report?: boolean;
}

interface Profile extends User {
    role: "customer" | "producer";
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    producerSettings: ProducerSettings | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        passwordConfirmation: string,
        name: string,
        role: ProfileRole,
        farmName?: string,
        location?: string,
    ) => Promise<void>;
    logout: () => void;
    signOut: () => Promise<void>;
    isProducer: () => boolean;
    isClient: () => boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

async function parseApiResponse(res: Response) {
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return res.json();
    }

    const text = await res.text();
    throw new Error(
        `Resposta inválida da API (${res.status}). Verifique NEXT_PUBLIC_API_URL e backend. Trecho: ${text.slice(0, 80)}`
    );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const inactivityTimeoutRef = useRef<number | null>(null);
    function getApiErrorMessage(payload: any, fallback: string) {
        if (!payload) return fallback;
        if (payload.errors && typeof payload.errors === "object") {
            return formatLaravelValidationMessage(payload.errors, API_FIELD_LABELS);
        }
        if (payload.message) return payload.message;
        if (payload.error) return payload.error;
        return fallback;
    }

    const [user, setUser] = useState<User | null>(null);
    const [producerSettings, setProducerSettings] = useState<ProducerSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedProducerSettings = localStorage.getItem("producerSettings");

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            if (savedProducerSettings) {
                setProducerSettings(JSON.parse(savedProducerSettings));
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!user || user.roles !== ProfileRole.PRODUCER) {
            return;
        }
        if (!localStorage.getItem("token")) {
            return;
        }

        void (async () => {
            try {
                const s = await api.get<ProducerSettings | null>("/producer-settings/me");
                if (s && typeof s === "object") {
                    localStorage.setItem("producerSettings", JSON.stringify(s));
                    setProducerSettings(s);
                }
            } catch {
                /* ignore */
            }
        })();
    }, [user?.id, user?.roles]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("producerSettings");
        setUser(null);
        setProducerSettings(null);
    }

    async function signIn(email: string, password: string) {
        const res = await fetch(`${API_URL}/auth/sign-in`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({email, password}),
        });

        const payload = await parseApiResponse(res);
        if (!res.ok) {
            if (res.status === 429) {
                throw new Error("Muitas tentativas de login. Aguarde 1 minuto e tente novamente.");
            }
            if (res.status === 403) {
                throw new Error(
                    getApiErrorMessage(
                        payload,
                        "Confirme seu e-mail antes de entrar. Enviamos um link para o endereço usado no cadastro — verifique a caixa de entrada e o spam.",
                    ),
                );
            }
            throw new Error(getApiErrorMessage(payload, "Credenciais inválidas"));
        }

        const authData = payload.data;
        localStorage.setItem("token", authData.accessToken);
        localStorage.setItem("user", JSON.stringify(authData.user));
        setUser(authData.user);

        if (authData.user.roles === ProfileRole.PRODUCER) {
            try {
                const settings = await api.get<ProducerSettings | null>("/producer-settings/me");
                if (settings && typeof settings === "object") {
                    localStorage.setItem("producerSettings", JSON.stringify(settings));
                    setProducerSettings(settings);
                } else {
                    localStorage.removeItem("producerSettings");
                    setProducerSettings(null);
                }
            } catch {
                localStorage.removeItem("producerSettings");
                setProducerSettings(null);
            }
        } else {
            localStorage.removeItem("producerSettings");
            setProducerSettings(null);
        }
    }

    async function signUp(
        email: string,
        password: string,
        passwordConfirmation: string,
        name: string,
        role: ProfileRole,
        farmName?: string,
        location?: string,
    ) {
        const res = await fetch(`${API_URL}/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                password_confirmation: passwordConfirmation,
                name,
                role,
                farm_name: farmName,
                location,
            }),
        });

        if (!res.ok) {
            const data = await parseApiResponse(res);
            if (res.status === 429) {
                throw new Error("Muitas tentativas de cadastro. Aguarde 1 minuto e tente novamente.");
            }
            if (data.errors && typeof data.errors === "object") {
                throw new ApiRequestError(
                    formatLaravelValidationMessage(data.errors, API_FIELD_LABELS),
                    res.status,
                    data.errors,
                );
            }
            throw new Error(getApiErrorMessage(data, "Erro ao criar conta"));
        }
    }

    async function signOut() {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await api.post<unknown>("/auth/sign-out", {});
            } catch {
                // no-op: local cleanup still applies
            }
        }
        logout();
    }

    useEffect(() => {
        if (!user) {
            if (inactivityTimeoutRef.current) {
                window.clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = null;
            }
            return;
        }

        const resetInactivityTimer = () => {
            if (inactivityTimeoutRef.current) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }

            inactivityTimeoutRef.current = window.setTimeout(() => {
                signOut().catch(() => {
                    logout();
                });
            }, INACTIVITY_TIMEOUT_MS);
        };

        const events: Array<keyof WindowEventMap> = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
        ];

        events.forEach((eventName) => window.addEventListener(eventName, resetInactivityTimer, {passive: true}));
        resetInactivityTimer();

        return () => {
            events.forEach((eventName) => window.removeEventListener(eventName, resetInactivityTimer));

            if (inactivityTimeoutRef.current) {
                window.clearTimeout(inactivityTimeoutRef.current);
                inactivityTimeoutRef.current = null;
            }
        };
    }, [user]);

    function isProducer() {
        return user?.roles === ProfileRole.PRODUCER;
    }

    function isClient() {
        return user?.roles === ProfileRole.CLIENT;
    }

    const profile: Profile | null = user
        ? {
            ...user,
            role: user.roles === ProfileRole.PRODUCER ? "producer" : "customer",
        }
        : null;

    return (
        <AuthContext.Provider value={{user, profile, producerSettings, loading, signIn, signUp, logout, signOut, isProducer, isClient}}>
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