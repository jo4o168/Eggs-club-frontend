import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BRAZIL_UFS} from "@/utils/brazilStates";
import {buildStreetLineFromViaCep, fetchViaCep} from "@/utils/viacep";
import {useIbgeMunicipios} from "@/hooks/useIbgeMunicipios";
import {maskCep, onlyDigits} from "@/utils/inputMasks";
import {toast} from "@/hooks/use-toast";
import {ChevronsUpDown, Loader2, Search} from "lucide-react";
import {cn} from "@/lib/utils";

interface BrazilLocationFieldsProps {
    zipCode: string;
    onZipCodeChange: (masked: string) => void;
    address: string;
    onAddressChange: (value: string) => void;
    addressNumber?: string;
    onAddressNumberChange?: (value: string) => void;
    complement?: string;
    onComplementChange?: (value: string) => void;
    stateUf: string;
    onStateUfChange: (uf: string) => void;
    city: string;
    onCityChange: (city: string) => void;
    /** Quando false, o CEP ainda busca endereço, mas pode ser omitido do layout externo se necessário */
    showZipField?: boolean;
    showComplement?: boolean;
    className?: string;
}

const BrazilLocationFields = ({
    zipCode,
    onZipCodeChange,
    address,
    onAddressChange,
    addressNumber = "",
    onAddressNumberChange,
    complement = "",
    onComplementChange = () => {},
    stateUf,
    onStateUfChange,
    city,
    onCityChange,
    showZipField = true,
    showComplement = true,
    className,
}: BrazilLocationFieldsProps) => {
    const [cepLoading, setCepLoading] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [citySearch, setCitySearch] = useState("");
    const {data: municipios = [], isLoading: municipiosLoading} = useIbgeMunicipios(stateUf);

    useEffect(() => {
        setCitySearch("");
    }, [stateUf]);

    const filteredMunicipios = useMemo(() => {
        const q = citySearch.trim().toLowerCase();
        if (!q) return municipios;
        return municipios.filter((nome) => nome.toLowerCase().includes(q));
    }, [municipios, citySearch]);

    const handleBuscarCep = async () => {
        const digits = onlyDigits(zipCode);
        if (digits.length !== 8) {
            toast({title: "CEP inválido", description: "Informe um CEP com 8 dígitos.", variant: "destructive"});
            return;
        }
        setCepLoading(true);
        try {
            const data = await fetchViaCep(digits);
            if (!data) {
                toast({title: "CEP não encontrado", variant: "destructive"});
                return;
            }
            const uf = String(data.uf ?? "")
                .trim()
                .toUpperCase();
            const localidade = String(data.localidade ?? "").trim();
            if (uf) onStateUfChange(uf);
            if (localidade) onCityChange(localidade);
            const line = buildStreetLineFromViaCep(data);
            if (line) onAddressChange(line);
            if (showComplement && data.complemento?.trim() && !complement.trim()) {
                onComplementChange(data.complemento.trim());
            }
            toast({title: "Endereço encontrado", description: "Confira os dados e ajuste se precisar."});
        } catch {
            toast({title: "Erro ao consultar CEP", description: "Tente novamente em instantes.", variant: "destructive"});
        } finally {
            setCepLoading(false);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {showZipField && (
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="brazil-cep">CEP</Label>
                        <div className="flex gap-2">
                            <Input
                                id="brazil-cep"
                                value={zipCode}
                                onChange={(e) => onZipCodeChange(maskCep(e.target.value))}
                                placeholder="00000-000"
                                maxLength={9}
                            />
                            <Button type="button" variant="outline" onClick={handleBuscarCep} disabled={cepLoading}>
                                {cepLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Buscar CEP"}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Consulta automática via ViaCEP.</p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="brazil-address">Endereço (logradouro)</Label>
                    <Input
                        id="brazil-address"
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        placeholder="Rua, avenida, travessa..."
                    />
                </div>
                {onAddressNumberChange ? (
                    <div className="space-y-2">
                        <Label htmlFor="brazil-address-number">Número</Label>
                        <Input
                            id="brazil-address-number"
                            value={addressNumber}
                            onChange={(e) => onAddressNumberChange(e.target.value)}
                            placeholder="123"
                            autoComplete="address-line2"
                        />
                        <p className="text-xs text-muted-foreground">Sem número? Use S/N.</p>
                    </div>
                ) : null}
            </div>

            {showComplement ? (
                <div className="space-y-2">
                    <Label htmlFor="brazil-complement">Complemento</Label>
                    <Input
                        id="brazil-complement"
                        value={complement}
                        onChange={(e) => onComplementChange(e.target.value)}
                        placeholder="Apto, bloco, ponto de referência..."
                    />
                </div>
            ) : null}

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Estado (UF)</Label>
                    <Select
                        value={stateUf || undefined}
                        onValueChange={(uf) => {
                            onStateUfChange(uf);
                            onCityChange("");
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado"/>
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                            {BRAZIL_UFS.map((uf) => (
                                <SelectItem key={uf.sigla} value={uf.sigla}>
                                    {uf.sigla} — {uf.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={cityOpen}
                                disabled={!stateUf || municipiosLoading}
                                className="w-full justify-between font-normal"
                            >
                                {city || (municipiosLoading ? "Carregando cidades..." : "Selecione a cidade")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                            <div className="relative mb-2">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    className="pl-8 h-9"
                                    placeholder="Buscar cidade..."
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                />
                            </div>
                            <ScrollArea className="h-[min(260px,var(--radix-popover-content-available-height))] rounded-md border">
                                <div className="p-1">
                                    {filteredMunicipios.length === 0 ? (
                                        <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>
                                    ) : (
                                        filteredMunicipios.map((nome) => (
                                            <button
                                                key={nome}
                                                type="button"
                                                className="flex w-full cursor-default rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => {
                                                    onCityChange(nome);
                                                    setCityOpen(false);
                                                }}
                                            >
                                                {nome}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">Lista oficial do IBGE para o estado selecionado.</p>
                </div>
            </div>
        </div>
    );
};

export default BrazilLocationFields;
