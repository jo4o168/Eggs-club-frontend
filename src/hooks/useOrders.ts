import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface Order {
    id: number;
    status: string;
    total_amount: number;
    customer_id: number;
    producer_id: number;
    created_at: string;
}

export const useProducerOrders = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['producer-orders', user?.id],
        queryFn: () => api.get<Order[]>('/orders'),
        enabled: !!user,
    });
};

export const useCustomerOrders = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['customer-orders', user?.id],
        queryFn: () => api.get<Order[]>('/orders'),
        enabled: !!user,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, status}: { id: number; status: string }) =>
            api.put(`/orders/${id}`, {status}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-orders']});
            queryClient.invalidateQueries({queryKey: ['customer-orders']});
            toast({title: 'Status do pedido atualizado!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar status', description: error.message, variant: 'destructive'});
        },
    });
};