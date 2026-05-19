"use client";

import {ReactNode, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

type AllowedRole = "customer" | "producer";

interface ProtectedAreaProps {
    children: ReactNode;
    allow: AllowedRole;
}

const ProtectedArea = ({children, allow}: ProtectedAreaProps) => {
    const router = useRouter();
    const {user, profile, loading} = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user || !profile) {
            router.replace("/login");
            return;
        }

        if (profile.role !== allow) {
            if (profile.role === "producer") {
                router.replace("/producer/dashboard");
                return;
            }
            if (profile.role === "customer") {
                router.replace("/customer/dashboard");
                return;
            }
            router.replace("/");
        }
    }, [allow, loading, profile, router, user]);

    if (loading) return null;
    if (!user || !profile) return null;
    if (profile.role !== allow) return null;

    return <>{children}</>;
};

export default ProtectedArea;
