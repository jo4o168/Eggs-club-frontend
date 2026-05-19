import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface Product {
    id: number;
    name: string;
    egg_size: string | null;
    egg_color: string | null;
    kit_quantity: number | null;
    description: string | null;
    price: number;
    subscription_price: number | null;
    one_time_price: number | null;
    allow_subscription: boolean;
    allow_one_time_purchase: boolean;
    unit: number;
    stock_quantity: number;
    is_active: boolean;
    image_url: string | null;
    producer_id: number;
}

export interface ProductUpsertPayload {
    name?: string;
    egg_size?: string | null;
    egg_color?: string | null;
    kit_quantity?: number | null;
    description?: string | null;
    price?: number;
    subscription_price?: number | null;
    one_time_price?: number | null;
    allow_subscription?: boolean;
    allow_one_time_purchase?: boolean;
    is_active?: boolean;
    image_file?: File | null;
}

function getApiBaseUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    return apiUrl.replace(/\/api\/?$/, '');
}

function normalizeImageUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith('data:')) return url;

    const apiBaseUrl = getApiBaseUrl();
    const apiBase = new URL(apiBaseUrl);

    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const current = new URL(url);
            const hasDefaultLocalhostOrigin =
                current.hostname === 'localhost' &&
                (current.port === '' || current.port === '80');

            if (hasDefaultLocalhostOrigin) {
                current.protocol = apiBase.protocol;
                current.host = apiBase.host;
                return current.toString();
            }
        } catch {
            // no-op
        }
        return url;
    }

    if (url.startsWith('/')) return `${apiBaseUrl}${url}`;
    return `${apiBaseUrl}/${url}`;
}

function buildProductFormData(payload: ProductUpsertPayload): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === 'image_file') return;

        if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
            return;
        }

        formData.append(key, String(value));
    });

    if (payload.image_file) {
        formData.append('image', payload.image_file);
    }

    return formData;
}

export const useProducts = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['products', user?.id],
        queryFn: async () => {
            const products = await api.get<Product[]>('/products');
            return products.map((product) => ({
                ...product,
                image_url: normalizeImageUrl(product.image_url),
            }));
        },
        enabled: !!user,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (product: ProductUpsertPayload) => api.postForm<Product>('/products', buildProductFormData(product)),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['public-products']});
            toast({title: 'Kit de ovos criado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao criar kit de ovos', description: error.message, variant: 'destructive'});
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, ...updates}: ProductUpsertPayload & { id: number }) => {
            if (updates.image_file) {
                return api.putForm<Product>(`/products/${id}`, buildProductFormData(updates));
            }

            const payload = {...updates};
            delete payload.image_file;
            return api.put<Product>(`/products/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['public-products']});
            toast({title: 'Kit de ovos atualizado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar kit de ovos', description: error.message, variant: 'destructive'});
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['public-products']});
            toast({title: 'Kit de ovos removido com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao remover kit de ovos', description: error.message, variant: 'destructive'});
        },
    });
};