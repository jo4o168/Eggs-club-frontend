import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {toast} from "@/hooks/use-toast";

const ProdutorConfiguracoes = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        newOrderAlert: true,
        weeklyReport: true,
        showOnSearch: true,
        acceptNewSubscribers: true,
    });

    const handleSave = () => {
        toast({title: "Configurações salvas com sucesso!"});
    };

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-semibold">Configurações</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas preferências e configurações
                    </p>
                </div>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>
                            Configure como você deseja receber alertas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Notificações por E-mail</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba atualizações por e-mail
                                </p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, emailNotifications: checked})
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Notificações por SMS</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba alertas via SMS
                                </p>
                            </div>
                            <Switch
                                checked={settings.smsNotifications}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, smsNotifications: checked})
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Alerta de Novo Pedido</Label>
                                <p className="text-sm text-muted-foreground">
                                    Seja notificado quando receber um pedido
                                </p>
                            </div>
                            <Switch
                                checked={settings.newOrderAlert}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, newOrderAlert: checked})
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Relatório Semanal</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receba um resumo semanal das vendas
                                </p>
                            </div>
                            <Switch
                                checked={settings.weeklyReport}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, weeklyReport: checked})
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Visibility */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visibilidade</CardTitle>
                        <CardDescription>
                            Controle como sua loja aparece para clientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Aparecer na Busca</Label>
                                <p className="text-sm text-muted-foreground">
                                    Sua loja aparece nos resultados de busca
                                </p>
                            </div>
                            <Switch
                                checked={settings.showOnSearch}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, showOnSearch: checked})
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Aceitar Novos Assinantes</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permita que novos clientes assinem seus produtos
                                </p>
                            </div>
                            <Switch
                                checked={settings.acceptNewSubscribers}
                                onCheckedChange={(checked) =>
                                    setSettings({...settings, acceptNewSubscribers: checked})
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Segurança</CardTitle>
                        <CardDescription>
                            Altere sua senha e configurações de segurança
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input id="currentPassword" type="password"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input id="newPassword" type="password"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input id="confirmPassword" type="password"/>
                        </div>
                        <Button variant="outline">Alterar Senha</Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                        <CardDescription>
                            Ações irreversíveis para sua conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Desativar Conta</p>
                                <p className="text-sm text-muted-foreground">
                                    Sua loja ficará invisível para clientes
                                </p>
                            </div>
                            <Button variant="outline">Desativar</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Excluir Conta</p>
                                <p className="text-sm text-muted-foreground">
                                    Remove permanentemente sua conta e dados
                                </p>
                            </div>
                            <Button variant="destructive">Excluir</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button variant="hero" onClick={handleSave}>
                        Salvar Configurações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorConfiguracoes;
