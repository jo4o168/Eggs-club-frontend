import {ChangeEvent, useEffect, useRef, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Camera, MapPin, Phone, Mail} from "lucide-react";
import {useProfile, useUpdateProfile, useUpdateProfileAvatar} from "@/hooks/useProfiles";
import {maskCep, maskCpf, maskPhone, onlyDigits} from "@/utils/inputMasks";
import {normalizeUfToSigla} from "@/utils/brazilStates";
import BrazilLocationFields from "@/components/BrazilLocationFields";

const ClientePerfil = () => {
    const {data: remoteProfile, isLoading} = useProfile();
    const updateProfile = useUpdateProfile();
    const updateProfileAvatar = useUpdateProfileAvatar();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        complement: "",
    });

    useEffect(() => {
        if (!remoteProfile) return;
        setProfile((prev) => ({
            ...prev,
            name: remoteProfile.name ?? "",
            email: remoteProfile.email ?? "",
            phone: maskPhone(remoteProfile.phone ?? ""),
            cpf: maskCpf(remoteProfile.cpf ?? ""),
            address: remoteProfile.address ?? "",
            city: remoteProfile.city ?? "",
            state: normalizeUfToSigla(remoteProfile.state ?? ""),
            zipCode: maskCep(remoteProfile.zip_code ?? ""),
            complement: remoteProfile.complement ?? "",
        }));
    }, [remoteProfile]);

    const handleSave = async () => {
        await updateProfile.mutateAsync({
            name: profile.name,
            email: profile.email,
            phone: onlyDigits(profile.phone) || null,
            cpf: onlyDigits(profile.cpf) || null,
            address: profile.address || null,
            city: profile.city || null,
            state: profile.state ? profile.state.toUpperCase() : null,
            zip_code: onlyDigits(profile.zipCode) || null,
            complement: profile.complement || null,
        });
    };

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await updateProfileAvatar.mutateAsync(file);
        event.target.value = "";
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
                                {remoteProfile?.avatar_url ? (
                                    <img
                                        src={remoteProfile.avatar_url}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-semibold text-primary">
                                        {(profile.name || "US").slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white"/>
                                </button>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Clique para alterar sua foto
                                </p>
                                <Button variant="outline" size="sm" type="button" onClick={handleAvatarClick} disabled={updateProfileAvatar.isPending}>
                                    Alterar foto
                                </Button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
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
                                        setProfile({...profile, cpf: maskCpf(e.target.value)})
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
                                        setProfile({...profile, phone: maskPhone(e.target.value)})
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
                    <CardContent>
                        <BrazilLocationFields
                            zipCode={profile.zipCode}
                            onZipCodeChange={(masked) => setProfile((p) => ({...p, zipCode: masked}))}
                            address={profile.address}
                            onAddressChange={(value) => setProfile((p) => ({...p, address: value}))}
                            complement={profile.complement}
                            onComplementChange={(value) => setProfile((p) => ({...p, complement: value}))}
                            stateUf={profile.state}
                            onStateUfChange={(uf) => setProfile((p) => ({...p, state: uf}))}
                            city={profile.city}
                            onCityChange={(value) => setProfile((p) => ({...p, city: value}))}
                        />
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
                    <Button variant="hero" onClick={handleSave} disabled={updateProfile.isPending || isLoading}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientePerfil;
