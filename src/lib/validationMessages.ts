/** Rótulos amigáveis para chaves de validação da API (Laravel). */

export const API_FIELD_LABELS: Record<string, string> = {
    email: "E-mail",
    username: "Identificador (igual ao e-mail na conta)",
    name: "Nome",
    password: "Senha",
    password_confirmation: "Confirmação de senha",
    role: "Tipo de conta",
    farm_name: "Nome da propriedade",
    location: "Localização",
    egg_size: "Tamanho do ovo",
    egg_color: "Cor do ovo",
    kit_quantity: "Quantidade por kit",
    description: "Descrição",
    price: "Preço",
    subscription_price: "Preço da assinatura",
    one_time_price: "Preço da compra única",
    allow_subscription: "Permitir assinatura",
    allow_one_time_purchase: "Permitir compra única",
    is_active: "Ativo",
    image: "Imagem",
    image_url: "Imagem",
    producer_id: "Produtor",
    frequency: "Frequência",
    product_id: "Kit de ovos",
    delivery_address: "Endereço de entrega",
    payment_method_id: "Pagamento",
    notes: "Observações",
};

function firstMessage(value: string | string[] | undefined): string {
    if (value == null) return "";
    if (Array.isArray(value)) return value[0] ?? "";
    return String(value);
}

/** Uma linha por campo: "E-mail: já está em uso." */
export function formatLaravelValidationMessage(
    errors: Record<string, string[] | string>,
    labels: Record<string, string> = API_FIELD_LABELS,
): string {
    return Object.entries(errors)
        .map(([key, raw]) => {
            const label = labels[key] ?? key.replace(/_/g, " ");
            return `${label}: ${firstMessage(raw)}`;
        })
        .join("\n");
}

/** Primeira mensagem por chave (chave = nome do campo na API). */
export function firstMessagePerField(errors: Record<string, string[] | string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, raw] of Object.entries(errors)) {
        out[key] = firstMessage(raw);
    }
    return out;
}

/** Mapeia erros da API (snake_case) para chaves do formulário de kit no front. */
export function mapProductApiErrorsToFormKeys(
    errors: Record<string, string[] | string>,
): Partial<Record<ProductFormErrorKey, string>> {
    const apiToForm: Record<string, ProductFormErrorKey> = {
        name: "name",
        egg_size: "eggSize",
        egg_color: "eggColor",
        kit_quantity: "kitQuantity",
        subscription_price: "subscriptionPrice",
        one_time_price: "oneTimePrice",
        description: "description",
        price: "price",
        image: "image",
        image_url: "image",
        allow_subscription: "allowSubscription",
        allow_one_time_purchase: "allowOneTimePurchase",
    };
    const out: Partial<Record<ProductFormErrorKey, string>> = {};
    for (const [apiKey, raw] of Object.entries(errors)) {
        const formKey = apiToForm[apiKey];
        if (!formKey) continue;
        const msg = firstMessage(raw);
        out[formKey] = out[formKey] ? `${out[formKey]} ${msg}` : msg;
    }
    return out;
}

export type ProductFormErrorKey =
    | "name"
    | "eggSize"
    | "eggColor"
    | "kitQuantity"
    | "subscriptionPrice"
    | "oneTimePrice"
    | "description"
    | "price"
    | "image"
    | "allowSubscription"
    | "allowOneTimePurchase";
