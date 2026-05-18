/** Siglas e nomes oficiais das UFs (IBGE). */
export const BRAZIL_UFS = [
    {sigla: "AC", nome: "Acre"},
    {sigla: "AL", nome: "Alagoas"},
    {sigla: "AP", nome: "Amapá"},
    {sigla: "AM", nome: "Amazonas"},
    {sigla: "BA", nome: "Bahia"},
    {sigla: "CE", nome: "Ceará"},
    {sigla: "DF", nome: "Distrito Federal"},
    {sigla: "ES", nome: "Espírito Santo"},
    {sigla: "GO", nome: "Goiás"},
    {sigla: "MA", nome: "Maranhão"},
    {sigla: "MT", nome: "Mato Grosso"},
    {sigla: "MS", nome: "Mato Grosso do Sul"},
    {sigla: "MG", nome: "Minas Gerais"},
    {sigla: "PA", nome: "Pará"},
    {sigla: "PB", nome: "Paraíba"},
    {sigla: "PR", nome: "Paraná"},
    {sigla: "PE", nome: "Pernambuco"},
    {sigla: "PI", nome: "Piauí"},
    {sigla: "RJ", nome: "Rio de Janeiro"},
    {sigla: "RN", nome: "Rio Grande do Norte"},
    {sigla: "RS", nome: "Rio Grande do Sul"},
    {sigla: "RO", nome: "Rondônia"},
    {sigla: "RR", nome: "Roraima"},
    {sigla: "SC", nome: "Santa Catarina"},
    {sigla: "SP", nome: "São Paulo"},
    {sigla: "SE", nome: "Sergipe"},
    {sigla: "TO", nome: "Tocantins"},
] as const;

export function normalizeUfToSigla(raw: string | null | undefined): string {
    if (!raw) return "";
    const t = raw.trim();
    if (t.length === 2) return t.toUpperCase();
    const found = BRAZIL_UFS.find((u) => u.nome.toLowerCase() === t.toLowerCase());
    return found?.sigla ?? "";
}
