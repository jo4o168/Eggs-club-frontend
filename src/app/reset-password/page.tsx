"use client";

import {Suspense} from "react";
import ResetPasswordForm from "@/views/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                    Carregando…
                </div>
            }
        >
            <ResetPasswordForm/>
        </Suspense>
    );
}
