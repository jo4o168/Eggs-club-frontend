import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    frequency: number;
    is_active: boolean;
    is_featured: boolean;
    producer_id: number;
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

export const useProducerPlans = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['producer-plans', user?.id],
        queryFn: () => api.get<SubscriptionPlan[]>('/subscription-plans'),
        enabled: !!user,
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plan: Partial<SubscriptionPlan>) =>
            api.post<SubscriptionPlan>('/subscription-plans', plan),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-plans']});
            queryClient.invalidateQueries({queryKey: ['public-plans']});
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
        mutationFn: ({id, ...updates}: Partial<SubscriptionPlan> & { id: number }) =>
            api.put<SubscriptionPlan>(`/subscription-plans/${id}`, updates),
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