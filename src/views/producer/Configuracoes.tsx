import {useEffect, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "@/hooks/use-toast";
import {useProducerSetting, useUpsertProducerSetting} from "@/hooks/useProducerSettings";
import {api} from "@/api/http";
import {Loader2} from "lucide-react";

const ProdutorConfiguracoes = () => {
    const {data: producerSetting, isLoading} = useProducerSetting();
    const upsertProducerSetting = useUpsertProducerSetting();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        newOrderAlert: true,
        weeklyReport: true,
        showOnSearch: true,
        acceptNewSubscribers: true,
    });
    const [farm, setFarm] = useState({
        farm_name: "",
        description: "",
        certifications: "",
        address: "",
        city: "",
        state: "",
        website: "",
        delivery_info: "",
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (!producerSetting) return;

        setSettings({
            emailNotifications: producerSetting.email_notifications ?? true,
            smsNotifications: producerSetting.sms_notifications ?? false,
            newOrderAlert: producerSetting.new_order_alert ?? true,
            weeklyReport: producerSetting.weekly_report ?? true,
            showOnSearch: producerSetting.visible_in_search ?? true,
            acceptNewSubscribers: producerSetting.accepts_new_subscribers ?? true,
        });
        setFarm({
            farm_name: producerSetting.farm_name ?? "",
            description: producerSetting.description ?? "",
            certifications: producerSetting.certifications ?? "",
            address: producerSetting.address ?? "",
            city: producerSetting.city ?? "",
            state: producerSetting.state ?? "",
            website: producerSetting.website ?? "",
            delivery_info: producerSetting.delivery_info ?? "",
        });
    }, [producerSetting]);

    const handleSave = async () => {
        if (!farm.farm_name.trim()) {
            toast({title: "Informe o nome da propriedade", variant: "destructive"});
            return;
        }
        await upsertProducerSetting.mutateAsync({
            farm_name: farm.farm_name.trim(),
            description: farm.description.trim() || null,
            certifications: farm.certifications.trim() || null,
            address: farm.address.trim() || null,
            city: farm.city.trim() || null,
            state: farm.state.trim() || null,
            website: farm.website.trim() || null,
            delivery_info: farm.delivery_info.trim() || null,
            email_notifications: settings.emailNotifications,
            sms_notifications: settings.smsNotifications,
            new_order_alert: settings.newOrderAlert,
            weekly_report: settings.weeklyReport,
            visible_in_search: settings.showOnSearch,
            accepts_new_subscribers: settings.acceptNewSubscribers,
        });
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({title: "As senhas não coincidem", variant: "destructive"});
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.put('/user/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            toast({title: "Senha alterada com sucesso!"});
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro ao alterar senha";
            toast({title: "Erro ao alterar senha", description: message, variant: "destructive"});
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <DashboardLayout userType="produtor">
            <div className="space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-3xl font-display font-semibold">Configurações</h1>
                    <p className="text-muted-foreground mt-1">
                        Dados da propriedade, visibilidade e notificações
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Propriedade e contato</CardTitle>
                        <CardDescription>Nome da fazenda, localização e informações públicas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="farm_name">Nome da propriedade</Label>
                            <Input
                                id="farm_name"
                                value={farm.farm_name}
                                onChange={(e) => setFarm({...farm, farm_name: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={farm.city}
                                    onChange={(e) => setFarm({...farm, city: e.target.value})}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado (UF)</Label>
                                <Input
                                    id="state"
                                    value={farm.state}
                                    onChange={(e) => setFarm({...farm, state: e.target.value})}
                                    maxLength={2}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                value={farm.address}
                                onChange={(e) => setFarm({...farm, address: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={farm.description}
                                onChange={(e) => setFarm({...farm, description: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certifications">Certificações</Label>
                            <Textarea
                                id="certifications"
                                rows={2}
                                placeholder="Orgânico, bem-estar animal, etc."
                                value={farm.certifications}
                                onChange={(e) => setFarm({...farm, certifications: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Site</Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://"
                                value={farm.website}
                                onChange={(e) => setFarm({...farm, website: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery_info">Informações de entrega</Label>
                            <Textarea
                                id="delivery_info"
                                rows={3}
                                placeholder="Regiões atendidas, dias de rota, taxas…"
                                value={farm.delivery_info}
                                onChange={(e) => setFarm({...farm, delivery_info: e.target.value})}
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>
                            Configure como você deseja receber alertas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {key: "emailNotifications", label: "Notificações por E-mail", desc: "Receba atualizações por e-mail"},
                            {key: "smsNotifications", label: "Notificações por SMS", desc: "Receba alertas via SMS"},
                            {key: "newOrderAlert", label: "Alerta de Novo Pedido", desc: "Seja notificado quando receber um pedido"},
                            {key: "weeklyReport", label: "Relatório Semanal", desc: "Receba um resumo semanal das vendas"},
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
                    </CardContent>
                </Card>

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
                                    Permita que novos clientes assinem seus kits de ovos
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
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
                            {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                            Alterar Senha
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button variant="hero" onClick={() => void handleSave()} disabled={isLoading || upsertProducerSetting.isPending}>
                        Salvar Configurações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorConfiguracoes;
