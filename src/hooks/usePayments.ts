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
    card_brand?: string | null;
    expiration_month?: number | null;
    expiration_year?: number | null;
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

export const useCreatePaymentMethod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            type: 'credit_card' | 'debit_card' | 'pix';
            card_last_four?: string | null;
            card_brand?: string | null;
            expiration_month?: number;
            expiration_year?: number;
            is_default?: boolean;
        }) => api.post('/payment-methods', {
            type: payload.type,
            last_four: payload.card_last_four ?? null,
            card_brand: payload.card_brand ?? null,
            expiration_month: payload.expiration_month,
            expiration_year: payload.expiration_year,
            is_default: payload.is_default ?? false,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['payment-methods']});
            toast({title: 'Método de pagamento adicionado!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao adicionar', description: error.message, variant: 'destructive'});
        },
    });
};

export const useSetDefaultPaymentMethod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.put(`/payment-methods/${id}/default`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['payment-methods']});
            toast({title: 'Método padrão atualizado!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar', description: error.message, variant: 'destructive'});
        },
    });
};