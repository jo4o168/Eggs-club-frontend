import {ChangeEvent, useEffect, useRef, useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Camera, MapPin, Phone, Mail, Globe} from "lucide-react";
import {useProfile, useUpdateProfile, useUpdateProfileAvatar} from "@/hooks/useProfiles";
import {useProducerSetting, useUpsertProducerSetting} from "@/hooks/useProducerSettings";
import {maskPhone, onlyDigits} from "@/utils/inputMasks";
import {normalizeUfToSigla} from "@/utils/brazilStates";
import BrazilLocationFields from "@/components/BrazilLocationFields";

const ProdutorPerfil = () => {
    const {data: baseProfile, isLoading: profileLoading} = useProfile();
    const {data: producerSetting, isLoading: producerSettingLoading} = useProducerSetting();
    const updateProfile = useUpdateProfile();
    const updateProfileAvatar = useUpdateProfileAvatar();
    const upsertProducerSetting = useUpsertProducerSetting();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({
        farmName: "",
        ownerName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        zipCode: "",
        address: "",
        website: "",
        description: "",
        certifications: "",
        deliveryInfo: "",
    });

    useEffect(() => {
        setProfile((prev) => ({
            ...prev,
            ownerName: baseProfile?.name ?? "",
            email: baseProfile?.email ?? "",
            phone: maskPhone(baseProfile?.phone ?? ""),
            farmName: producerSetting?.farm_name ?? "",
            address: producerSetting?.address ?? "",
            description: producerSetting?.description ?? "",
            certifications: producerSetting?.certifications ?? "",
            website: producerSetting?.website ?? "",
            deliveryInfo: producerSetting?.delivery_info ?? "",
            city: producerSetting?.city ?? "",
            state: normalizeUfToSigla(producerSetting?.state ?? ""),
            zipCode: "",
        }));
    }, [baseProfile, producerSetting]);

    const handleSave = async () => {
        await updateProfile.mutateAsync({
            name: profile.ownerName,
            email: profile.email,
            phone: onlyDigits(profile.phone) || null,
        });

        await upsertProducerSetting.mutateAsync({
            farm_name: profile.farmName,
            description: profile.description || null,
            certifications: profile.certifications || null,
            address: profile.address || null,
            city: profile.city || null,
            state: profile.state ? profile.state.toUpperCase() : null,
            website: profile.website || null,
            delivery_info: profile.deliveryInfo || null,
            accepts_new_subscribers: true,
            visible_in_search: true,
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
        <DashboardLayout userType="produtor">
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-semibold">Meu Perfil</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure as informações da sua propriedade
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
                                className="w-32 h-32 bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
                                {baseProfile?.avatar_url ? (
                                    <img
                                        src={baseProfile.avatar_url}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <span className="text-lg font-semibold text-primary px-4 text-center">
                                            Foto de perfil
                                        </span>
                                    </div>
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
                                    Esta imagem aparecerá no seu perfil
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

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="farmName">Nome da Propriedade</Label>
                                <Input
                                    id="farmName"
                                    value={profile.farmName}
                                    onChange={(e) =>
                                        setProfile({...profile, farmName: e.target.value})
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerName">Nome do Responsável</Label>
                                <Input
                                    id="ownerName"
                                    value={profile.ownerName}
                                    onChange={(e) =>
                                        setProfile({...profile, ownerName: e.target.value})
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={profile.description}
                                onChange={(e) =>
                                    setProfile({...profile, description: e.target.value})
                                }
                                placeholder="Conte a história da sua propriedade..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certifications">Certificações</Label>
                            <Input
                                id="certifications"
                                value={profile.certifications}
                                onChange={(e) =>
                                    setProfile({...profile, certifications: e.target.value})
                                }
                                placeholder="Ex: Orgânico, Selo de Qualidade"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contato e Localização</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="website">
                                <Globe className="w-4 h-4 inline mr-2"/>
                                Website
                            </Label>
                            <Input
                                id="website"
                                value={profile.website}
                                onChange={(e) =>
                                    setProfile({...profile, website: e.target.value})
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="w-4 h-4"/>
                                Localização
                            </Label>
                            <BrazilLocationFields
                                zipCode={profile.zipCode}
                                onZipCodeChange={(masked) => setProfile((p) => ({...p, zipCode: masked}))}
                                address={profile.address}
                                onAddressChange={(value) => setProfile((p) => ({...p, address: value}))}
                                stateUf={profile.state}
                                onStateUfChange={(uf) => setProfile((p) => ({...p, state: uf}))}
                                city={profile.city}
                                onCityChange={(value) => setProfile((p) => ({...p, city: value}))}
                                showComplement={false}
                            />
                            <p className="text-xs text-muted-foreground">
                                O CEP preenche rua, cidade e UF; a cidade vem da lista do IBGE. O CEP não é salvo no cadastro do produtor por enquanto.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="deliveryInfo">
                                Descreva suas opções de entrega
                            </Label>
                            <Textarea
                                id="deliveryInfo"
                                rows={3}
                                value={profile.deliveryInfo}
                                onChange={(e) =>
                                    setProfile({...profile, deliveryInfo: e.target.value})
                                }
                                placeholder="Regiões atendidas, prazos, valores de frete..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        variant="hero"
                        onClick={handleSave}
                        disabled={profileLoading || producerSettingLoading || updateProfile.isPending || upsertProducerSetting.isPending}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorPerfil;
