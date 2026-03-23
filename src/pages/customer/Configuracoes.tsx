import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {toast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import {Loader2} from "lucide-react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const ClienteConfiguracoes = () => {
    const {user} = useAuth();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        deliveryReminders: true,
        promotions: false,
    });

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

    const handleSaveNotifications = () => {
        toast({title: "Preferências de notificação salvas!"});
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({title: "As senhas não coincidem", variant: "destructive"});
            return;
        }
        if (newPassword.length < 6) {
            toast({title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive"});
            return;
        }

        setIsChangingPassword(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/user/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message ?? "Erro ao alterar senha");
            }

            toast({title: "Senha alterada com sucesso!"});
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({title: "Erro ao alterar senha", description: error.message, variant: "destructive"});
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !newEmail.includes("@")) {
            toast({title: "Digite um e-mail válido", variant: "destructive"});
            return;
        }

        setIsChangingEmail(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/user/email`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({email: newEmail}),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message ?? "Erro ao alterar e-mail");
            }

            toast({title: "E-mail alterado com sucesso!"});
            setEmailDialogOpen(false);
            setNewEmail("");
        } catch (error: any) {
            toast({title: "Erro ao alterar e-mail", description: error.message, variant: "destructive"});
        } finally {
            setIsChangingEmail(false);
        }
    };

    const handleDeactivateAccount = async () => {
        toast({title: "Conta desativada", description: "Sua conta foi desativada temporariamente."});
        setDeactivateDialogOpen(false);
    };

    const handleDeleteAccount = async () => {
        toast({title: "Solicitação enviada", description: "Sua solicitação de exclusão foi enviada."});
        setDeleteDialogOpen(false);
    };

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-3xl font-display font-semibold">Configurações</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas preferências e configurações de conta
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>Configure como você deseja receber alertas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                key: "emailNotifications",
                                label: "Notificações por E-mail",
                                desc: "Receba atualizações por e-mail"
                            },
                            {key: "smsNotifications", label: "Notificações por SMS", desc: "Receba alertas via SMS"},
                            {
                                key: "orderUpdates",
                                label: "Atualizações de Pedidos",
                                desc: "Seja notificado sobre o status dos seus pedidos"
                            },
                            {
                                key: "deliveryReminders",
                                label: "Lembretes de Entrega",
                                desc: "Receba lembretes antes das entregas"
                            },
                            {
                                key: "promotions",
                                label: "Promoções e Novidades",
                                desc: "Receba ofertas especiais e novidades"
                            },
                        ].map(({key, label, desc}) => (
                            <div key={key} className="flex items-center justify-between">
                                <div>
                                    <Label>{label}</Label>
                                    <p className="text-sm text-muted-foreground">{desc}</p>
                                </div>
                                <Switch
                                    checked={settings[key as keyof typeof settings]}
                                    onCheckedChange={(checked) => setSettings({...settings, [key]: checked})}
                                />
                            </div>
                        ))}
                        <div className="pt-4">
                            <Button variant="outline" onClick={handleSaveNotifications}>Salvar Preferências</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>E-mail</CardTitle>
                        <CardDescription>Altere o e-mail associado à sua conta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">E-mail atual</p>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Alterar E-mail</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Alterar E-mail</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newEmail">Novo E-mail</Label>
                                            <Input
                                                id="newEmail"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="hero" onClick={handleChangeEmail} disabled={isChangingEmail}>
                                            {isChangingEmail && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                            Confirmar Alteração
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Segurança</CardTitle>
                        <CardDescription>Altere sua senha</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input id="currentPassword" type="password" value={currentPassword}
                                   onChange={(e) => setCurrentPassword(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input id="newPassword" type="password" value={newPassword}
                                   onChange={(e) => setNewPassword(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)}/>
                        </div>
                        <Button variant="outline" onClick={handleChangePassword}
                                disabled={isChangingPassword || !newPassword || !confirmPassword}>
                            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                            Alterar Senha
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                        <CardDescription>Ações irreversíveis para sua conta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Desativar Conta</p>
                                <p className="text-sm text-muted-foreground">Sua conta ficará inativa
                                    temporariamente</p>
                            </div>
                            <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
                                <DialogTrigger asChild><Button variant="outline">Desativar</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Desativar Conta</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <p className="text-muted-foreground">Tem certeza que deseja desativar sua
                                            conta?</p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1"
                                                    onClick={() => setDeactivateDialogOpen(false)}>Cancelar</Button>
                                            <Button variant="destructive" className="flex-1"
                                                    onClick={handleDeactivateAccount}>Desativar Conta</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Excluir Conta</p>
                                <p className="text-sm text-muted-foreground">Remove permanentemente sua conta e
                                    dados</p>
                            </div>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild><Button variant="destructive">Excluir</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Excluir Conta</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <p className="text-muted-foreground">Esta ação não pode ser desfeita.</p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="flex-1"
                                                    onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                                            <Button variant="destructive" className="flex-1"
                                                    onClick={handleDeleteAccount}>Excluir Permanentemente</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ClienteConfiguracoes;