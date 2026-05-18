import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/contexts/AuthContext";
import {toast} from "@/hooks/use-toast";
import {api} from "@/api/http";

export type CartPurchaseMode = "one_time" | "subscription";

export interface ServerCartItem {
    id: number;
    product_id: number;
    quantity: number;
    purchase_mode: CartPurchaseMode;
    subscription_plan_id: number | null;
    unit_price: number;
    line_total: number;
    product: {
        id: number;
        name: string;
        producer_id: number;
        allow_one_time_purchase: boolean;
        allow_subscription: boolean;
        image_url?: string | null;
    } | null;
    plan: {
        id: number;
        name: string;
        price: number;
        producer_id: number;
    } | null;
}

export interface CheckoutResult {
    order_ids: number[];
    subscription_ids: number[];
}

const cartQueryKey = (userId?: number) => ["customer-cart", userId] as const;

export function serverCartItemCount(items: ServerCartItem[] | undefined): number {
    return (items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function useCustomerCart() {
    const {user, isClient} = useAuth();

    return useQuery({
        queryKey: cartQueryKey(user?.id),
        queryFn: () => api.get<ServerCartItem[]>("/customer/cart"),
        enabled: !!user && isClient(),
    });
}

export function useAddCartItem() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (payload: {
            product_id: number;
            purchase_mode: CartPurchaseMode;
            quantity?: number;
            subscription_plan_id?: number | null;
        }) => api.post<ServerCartItem>("/customer/cart/items", payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: cartQueryKey(user?.id)});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível atualizar o carrinho", description: error.message, variant: "destructive"});
        },
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: ({
            id,
            ...body
        }: {
            id: number;
            purchase_mode?: CartPurchaseMode;
            quantity?: number;
            subscription_plan_id?: number | null;
        }) => api.put<ServerCartItem>(`/customer/cart/items/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: cartQueryKey(user?.id)});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível atualizar o item", description: error.message, variant: "destructive"});
        },
    });
}

export function useRemoveCartItem() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (id: number) => api.delete(`/customer/cart/items/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: cartQueryKey(user?.id)});
        },
        onError: (error: Error) => {
            toast({title: "Erro ao remover", description: error.message, variant: "destructive"});
        },
    });
}

export function useCheckoutCart() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (body?: { delivery_address?: string | null; notes?: string | null; payment_method_id?: number | null }) =>
            api.post<CheckoutResult>("/customer/checkout", body ?? {}),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: cartQueryKey(user?.id)});
            void queryClient.invalidateQueries({queryKey: ["customer-orders", user?.id]});
            void queryClient.invalidateQueries({queryKey: ["customer-subscriptions", user?.id]});
            toast({title: "Compra finalizada com sucesso!"});
        },
        onError: (error: Error) => {
            toast({title: "Erro no checkout", description: error.message, variant: "destructive"});
        },
    });
}
