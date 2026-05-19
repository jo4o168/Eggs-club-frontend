export type ViaCepResponse =
    | {
          cep: string;
          logradouro: string;
          complemento: string;
          bairro: string;
          localidade: string;
          uf: string;
          erro?: undefined;
      }
    | {erro: true};

export async function fetchViaCep(cepDigits: string): Promise<Exclude<ViaCepResponse, {erro: true}> | null> {
    const clean = cepDigits.replace(/\D/g, "");
    if (clean.length !== 8) return null;

    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;

    const data = (await res.json()) as ViaCepResponse;
    if ("erro" in data && data.erro) return null;

    return data as Exclude<ViaCepResponse, {erro: true}>;
}

export function buildStreetLineFromViaCep(data: Exclude<ViaCepResponse, {erro: true}>): string {
    const parts = [data.logradouro, data.bairro].map((p) => p?.trim()).filter(Boolean);
    return parts.join(" — ");
}
