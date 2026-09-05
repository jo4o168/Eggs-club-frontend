import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface PlanProduct {
    id: number;
    name: string;
    kit_quantity?: number | null;
    allow_one_time_purchase?: boolean;
    image_url?: string | null;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    image_url?: string | null;
    price: number | string;
    eggs_quantity?: number;
    frequency: number;
    is_active: boolean;
    is_featured: boolean;
    producer_id: number;
    product_id?: number | null;
    product?: PlanProduct | null;
}

export interface CreatePlanPayload {
    name: string;
    description?: string | null;
    price: number;
    frequency: number;
    is_featured?: boolean;
    is_active?: boolean;
    product_id?: number;
    product?: {
        name: string;
        egg_size: string;
        egg_color: string;
        kit_quantity: number;
        description?: string | null;
    };
    image_file?: File | null;
}

export interface Subscription {
    id: number;
    status: string;
    plan_id: number;
    plan?: SubscriptionPlan;
    producer_id: number;
    customer_id: number;
    next_delivery_date: string | null;
    created_at: string;
}

const statusMap: Record<string, number> = {
    active: 0,
    paused: 1,
    cancelled: 2,
    expired: 3,
};

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

function appendScalar(formData: FormData, key: string, value: unknown) {
    if (value === undefined || value === null) return;
    if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
        return;
    }
    formData.append(key, String(value));
}

function buildPlanFormData(payload: CreatePlanPayload): FormData {
    const formData = new FormData();
    appendScalar(formData, 'name', payload.name);
    appendScalar(formData, 'description', payload.description);
    appendScalar(formData, 'price', payload.price);
    appendScalar(formData, 'frequency', payload.frequency);
    appendScalar(formData, 'is_featured', payload.is_featured);
    appendScalar(formData, 'is_active', payload.is_active);
    appendScalar(formData, 'product_id', payload.product_id);

    if (payload.product) {
        appendScalar(formData, 'product[name]', payload.product.name);
        appendScalar(formData, 'product[egg_size]', payload.product.egg_size);
        appendScalar(formData, 'product[egg_color]', payload.product.egg_color);
        appendScalar(formData, 'product[kit_quantity]', payload.product.kit_quantity);
        appendScalar(formData, 'product[description]', payload.product.description);
    }

    if (payload.image_file) {
        formData.append('image', payload.image_file);
    }

    return formData;
}

export const useProducerPlans = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['producer-plans', user?.id],
        queryFn: async () => {
            const plans = await api.get<SubscriptionPlan[]>('/subscription-plans');
            return plans.map((plan) => ({
                ...plan,
                image_url: normalizeImageUrl(plan.image_url),
                product: plan.product
                    ? {...plan.product, image_url: normalizeImageUrl(plan.product.image_url)}
                    : plan.product,
            }));
        },
        enabled: !!user,
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plan: CreatePlanPayload) => {
            if (plan.image_file) {
                return api.postForm<SubscriptionPlan>('/subscription-plans', buildPlanFormData(plan));
            }
            const payload = {...plan};
            delete payload.image_file;
            return api.post<SubscriptionPlan>('/subscription-plans', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
            queryClient.invalidateQueries({queryKey: ['public-plans']});
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['public-products']});
            toast({title: 'Plano criado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao criar plano', description: error.message, variant: 'destructive'});
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, ...updates}: Partial<CreatePlanPayload> & { id: number }) => {
            if (updates.image_file) {
                return api.putForm<SubscriptionPlan>(`/subscription-plans/${id}`, buildPlanFormData(updates as CreatePlanPayload));
            }
            const payload = {...updates};
            delete payload.image_file;
            return api.put<SubscriptionPlan>(`/subscription-plans/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
            queryClient.invalidateQueries({queryKey: ['public-plans']});
            toast({title: 'Plano atualizado!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar plano', description: error.message, variant: 'destructive'});
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.delete(`/subscription-plans/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
            queryClient.invalidateQueries({queryKey: ['public-plans']});
            toast({title: 'Plano removido!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao remover plano', description: error.message, variant: 'destructive'});
        },
    });
};

export const useTogglePlanActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.post(`/subscription-plans/${id}/toggle-active`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
            queryClient.invalidateQueries({queryKey: ['public-plans']});
        },
    });
};

export const useTogglePlanFeatured = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.post(`/subscription-plans/${id}/toggle-featured`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
        },
    });
};

export const useCustomerSubscriptions = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['customer-subscriptions', user?.id],
        queryFn: () => api.get<Subscription[]>('/subscriptions'),
        enabled: !!user,
    });
};

export const useSubscriptionPlans = (producerId?: string) => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['subscription-plans', producerId, user?.id],
        queryFn: async () => {
            const plans = await api.get<SubscriptionPlan[]>('/subscription-plans');
            if (!producerId) return plans;
            return plans.filter((plan) => String(plan.producer_id) === String(producerId));
        },
        enabled: !!user,
    });
};

export const useCreateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { planId: string; producerId?: string; payment_method_id?: number }) => {
            const body: Record<string, unknown> = {
                subscription_plan_id: Number(data.planId),
            };
            if (data.payment_method_id) {
                body.payment_method_id = data.payment_method_id;
            }
            return api.post<Subscription>('/subscriptions', body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-subscriptions']});
            toast({title: 'Assinatura realizada com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao assinar', description: error.message, variant: 'destructive'});
        },
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            id: number | string;
            status?: string;
            pause_until?: string | null;
            next_delivery_date?: string | null;
            plan_id?: string | number;
            subscription_plan_id?: string | number;
        }) => {
            const payload: Record<string, unknown> = {};
            if (data.status) payload.status = statusMap[data.status] ?? data.status;
            if (data.pause_until !== undefined) payload.pause_until = data.pause_until;
            if (data.next_delivery_date !== undefined) payload.next_delivery_date = data.next_delivery_date;
            if (data.subscription_plan_id !== undefined) payload.subscription_plan_id = Number(data.subscription_plan_id);
            if (data.plan_id !== undefined) payload.subscription_plan_id = Number(data.plan_id);
            return api.put(`/subscriptions/${data.id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-subscriptions']});
            toast({title: 'Assinatura atualizada!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar assinatura', description: error.message, variant: 'destructive'});
        },
    });
};