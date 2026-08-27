"use client";

import {useState} from "react";
import {Link} from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2} from "lucide-react";
import {toast} from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default function RecuperarSenha() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json", Accept: "application/json"},
                body: JSON.stringify({email}),
            });
            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload.message ?? payload.errors?.email?.[0] ?? "Não foi possível enviar o e-mail.");
            }
            const msg = payload.data?.notice ?? payload.message ?? "Verifique sua caixa de entrada.";
            toast({title: "E-mail enviado", description: msg});
            setEmail("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erro ao solicitar recuperação.";
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
                            <h1 className="text-2xl font-display font-semibold">Recuperar senha</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um link para redefinir a senha.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        Enviando…
                                    </>
                                ) : (
                                    "Enviar link"
                                )}
                            </Button>
                        </form>
                        <p className="text-center text-sm">
                            <Link to="/login" className="text-primary hover:underline">
                                Voltar ao login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
