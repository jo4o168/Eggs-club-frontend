"use client";

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

export function ProducerWorkspaceGuard() {
    const pathname = usePathname();
    const router = useRouter();
    const {profile, loading} = useAuth();

    useEffect(() => {
        if (loading || profile?.role !== "producer") return;

        const inProducerArea = pathname === "/producer" || pathname.startsWith("/producer/");
        if (!inProducerArea) {
            router.replace("/producer/dashboard");
        }
    }, [loading, pathname, profile?.role, router]);

    return null;
}
