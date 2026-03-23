import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    frequency: string;
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
            toast({title: 'Plano removido!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao remover plano', description: error.message, variant: 'destructive'});
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

export const useCreateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { plan_id: number; producer_id: number }) =>
            api.post<Subscription>('/subscriptions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-subscriptions']});
            toast({title: 'Assinatura realizada com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao assinar', description: error.message, variant: 'destructive'});
        },
    });
};