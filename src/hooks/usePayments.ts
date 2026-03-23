import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface PaymentMethod {
    id: number;
    type: string;
    last_four: string | null;
    is_default: boolean;
    customer_id: number;
}

export const usePaymentMethods = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['payment-methods', user?.id],
        queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
        enabled: !!user,
    });
};

export const useDeletePaymentMethod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.delete(`/payment-methods/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['payment-methods']});
            toast({title: 'Método de pagamento removido!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao remover', description: error.message, variant: 'destructive'});
        },
    });
};