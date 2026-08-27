"use client";

import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {toast} from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token") ?? "";
    const emailParam = searchParams?.get("email") ?? "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !emailParam) {
            toast({title: "Link inválido", description: "Use o link recebido por e-mail.", variant: "destructive"});
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                body: JSON.stringify({
                    token,
                    email: decodeURIComponent(emailParam),
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });
            const payload = await res.json();
            if (!res.ok) {
                const err =
                    payload.errors?.password?.[0] ??
                    payload.errors?.email?.[0] ??
                    payload.message ??
                    "Não foi possível redefinir a senha.";
                throw new Error(err);
            }
            toast({title: "Senha atualizada", description: "Redirecionando para o login…"});
            router.replace("/login");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erro ao redefinir senha.";
            toast({title: "Erro", description: message, variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 py-16">
                <div className="container max-w-md">
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-lg space-y-6">
                        <div>
                            <h1 className="text-2xl font-display font-semibold">Nova senha</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Defina uma nova senha (8+ caracteres, maiúscula, minúscula, número e símbolo).
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={decodeURIComponent(emailParam)} disabled readOnly/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password2">Confirmar senha</Label>
                                <Input
                                    id="password2"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" variant="hero" className="w-full" disabled={loading || !token}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        Salvando…
                                    </>
                                ) : (
                                    "Redefinir senha"
                                )}
                            </Button>
                        </form>
                        <p className="text-center text-sm">
                            <Link href="/login" className="text-primary hover:underline">
                                Ir para o login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
