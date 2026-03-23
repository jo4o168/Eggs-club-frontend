import {useState} from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Camera, MapPin, Phone, Mail, Globe} from "lucide-react";
import {toast} from "@/hooks/use-toast";

const ProdutorPerfil = () => {
    const [profile, setProfile] = useState({
        farmName: "Fazenda Boa Vista",
        ownerName: "José da Silva",
        email: "contato@fazendaboavista.com",
        phone: "(11) 99999-9999",
        location: "Campinas, SP",
        address: "Estrada Rural km 15, Campinas - SP",
        website: "www.fazendaboavista.com",
        description:
            "Produzimos ovos caipiras há mais de 20 anos, com galinhas criadas soltas em ambiente natural. Nossa fazenda segue práticas sustentáveis e garantimos a qualidade e frescor de cada ovo.",
        certifications: "Certificação Orgânica, Selo de Qualidade SP",
        deliveryInfo:
            "Entregamos em toda região de Campinas e São Paulo capital. Frete grátis para pedidos acima de R$ 100.",
    });

    const handleSave = () => {
        toast({title: "Perfil atualizado com sucesso!"});
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
                        <CardTitle>Foto da Propriedade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div
                                className="w-32 h-32 bg-secondary rounded-xl flex items-center justify-center relative overflow-hidden">
                                <img
                                    src="/eggs-club/public/placeholder.svg"
                                    alt="Farm"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white"/>
                                </button>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Esta imagem aparecerá na sua página de produtor
                                </p>
                                <Button variant="outline" size="sm">
                                    Alterar foto
                                </Button>
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
                                        setProfile({...profile, phone: e.target.value})
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">
                                    <MapPin className="w-4 h-4 inline mr-2"/>
                                    Cidade/Estado
                                </Label>
                                <Input
                                    id="location"
                                    value={profile.location}
                                    onChange={(e) =>
                                        setProfile({...profile, location: e.target.value})
                                    }
                                />
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input
                                id="address"
                                value={profile.address}
                                onChange={(e) =>
                                    setProfile({...profile, address: e.target.value})
                                }
                            />
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
                    <Button variant="hero" onClick={handleSave}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProdutorPerfil;
