import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Camera, MapPin, Phone, Mail} from "lucide-react";
import {toast} from "@/hooks/use-toast";

const ClientePerfil = () => {
    const [profile, setProfile] = useState({
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 99999-9999",
        cpf: "123.456.789-00",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        complement: "Apto 42",
    });

    const handleSave = () => {
        toast({title: "Perfil atualizado com sucesso!"});
    };

    return (
        <DashboardLayout userType="cliente">
            <div className="space-y-6 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-semibold">Meu Perfil</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas informações pessoais
                    </p>
                </div>

                {/* Profile Photo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Foto de Perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div
                                className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center relative overflow-hidden">
                                <span className="text-3xl font-semibold text-primary">JS</span>
                                <button
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white"/>
                                </button>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Clique para alterar sua foto
                                </p>
                                <Button variant="outline" size="sm">
                                    Alterar foto
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) =>
                                        setProfile({...profile, name: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    value={profile.cpf}
                                    onChange={(e) =>
                                        setProfile({...profile, cpf: e.target.value})
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="w-4 h-4 inline mr-2"/>
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) =>
                                        setProfile({...profile, email: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    <Phone className="w-4 h-4 inline mr-2"/>
                                    Telefone
                                </Label>
                                <Input
                                    id="phone"
                                    value={profile.phone}
                                    onChange={(e) =>
                                        setProfile({...profile, phone: e.target.value})
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <MapPin className="w-5 h-5 inline mr-2"/>
                            Endereço de Entrega
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    value={profile.address}
                                    onChange={(e) =>
                                        setProfile({...profile, address: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input
                                    id="zipCode"
                                    value={profile.zipCode}
                                    onChange={(e) =>
                                        setProfile({...profile, zipCode: e.target.value})
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    id="complement"
                                    value={profile.complement}
                                    onChange={(e) =>
                                        setProfile({...profile, complement: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={profile.city}
                                    onChange={(e) =>
                                        setProfile({...profile, city: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    value={profile.state}
                                    onChange={(e) =>
                                        setProfile({...profile, state: e.target.value})
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Segurança</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input id="currentPassword" type="password"/>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input id="newPassword" type="password"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                <Input id="confirmPassword" type="password"/>
                            </div>
                        </div>
                        <Button variant="outline">Alterar Senha</Button>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button variant="hero" onClick={handleSave}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientePerfil;
