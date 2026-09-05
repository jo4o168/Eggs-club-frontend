import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface OrderLineItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    product_id: number | null;
}

export interface Order {
    id: number;
    order_number?: string;
    status: string;
    total_amount: number;
    customer_id?: number;
    producer_id: number;
    customer?: { id: number; name: string; email?: string } | null;
    producer_message?: string | null;
    items?: OrderLineItem[];
    created_at: string;
}

function asOrderList(payload: unknown): Order[] {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === "object" && "data" in payload) {
        const nested = (payload as {data: unknown}).data;
        if (Array.isArray(nested)) {
            return nested;
        }
    }
    return [];
}

export interface OrderDetail extends Order {
    delivery_address?: string | null;
    notes?: string | null;
    items: OrderLineItem[];
}

export const useProducerOrders = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['producer-orders', user?.id],
        queryFn: async () => asOrderList(await api.get<Order[] | {data: Order[]}>('/orders')),
        enabled: !!user,
    });
};

export const useCustomerOrders = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['customer-orders', user?.id],
        queryFn: async () => asOrderList(await api.get<Order[] | {data: Order[]}>('/orders')),
        enabled: !!user,
    });
};

export const useOrder = (id: number | undefined) => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['order', id, user?.id],
        queryFn: () => api.get<OrderDetail>(`/orders/${id}`),
        enabled: !!user && !!id && id > 0,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, status, producer_message}: { id: number; status: string; producer_message?: string }) =>
            api.put(`/orders/${id}`, {status, producer_message}),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ['producer-orders']});
            queryClient.invalidateQueries({queryKey: ['customer-orders']});
            queryClient.invalidateQueries({queryKey: ['producer-stats']});
            queryClient.invalidateQueries({queryKey: ['order', variables.id]});
            const title =
                variables.status === "cancelled"
                    ? "Pedido cancelado. O cliente foi informado e o valor será estornado."
                    : variables.status === "confirmed"
                        ? "Pedido confirmado. O cliente foi avisado que está em preparação."
                        : "Status do pedido atualizado!";
            toast({title});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar status', description: error.message, variant: 'destructive'});
        },
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { product_id: number; quantity?: number; delivery_address?: string | null; notes?: string | null }) =>
            api.post('/orders', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-orders']});
            toast({title: 'Compra realizada com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao realizar compra', description: error.message, variant: 'destructive'});
        },
    });
};
