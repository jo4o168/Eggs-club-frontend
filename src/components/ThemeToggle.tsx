"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useSyncExternalStore} from "react";
import {Button} from "@/components/ui/button";

const emptySubscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );
}

export function ThemeToggle() {
    const {setTheme, resolvedTheme} = useTheme();
    const mounted = useIsClient();

    if (!mounted) {
        return <div className="h-10 w-10 shrink-0" aria-hidden/>;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={isDark ? "Modo claro" : "Modo escuro"}
        >
            {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </Button>
    );
}
