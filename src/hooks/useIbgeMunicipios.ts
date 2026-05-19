import {useQuery} from "@tanstack/react-query";

async function fetchMunicipiosPorUf(uf: string): Promise<string[]> {
    const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios`,
    );
    if (!res.ok) throw new Error("Não foi possível carregar as cidades.");
    const data = (await res.json()) as {nome: string}[];
    return data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export const useIbgeMunicipios = (uf: string | undefined) => {
    const normalized = uf?.trim().toUpperCase() ?? "";
    const enabled = normalized.length === 2;

    return useQuery({
        queryKey: ["ibge-municipios", normalized],
        queryFn: () => fetchMunicipiosPorUf(normalized),
        enabled,
        staleTime: 1000 * 60 * 60 * 24,
    });
};
