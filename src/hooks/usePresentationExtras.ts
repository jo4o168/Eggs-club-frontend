import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/contexts/AuthContext";
import {toast} from "@/hooks/use-toast";
import {api} from "@/api/http";

export interface OrderPix {
    demo: boolean;
    notice: string;
    beneficiary: string;
    city: string;
    amount: number;
    txid: string;
    copia_e_cola: string;
    qr_image_url: string;
}

export interface DemoNfeItem {
    name: string;
    ncm: string;
    cfop: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface DemoNfe {
    demo: boolean;
    notice: string;
    model: string;
    series: number;
    number: number;
    issued_at: string;
    access_key: string;
    nature: string;
    issuer: {name?: string | null; document: string; ie: string; address: string};
    recipient: {name?: string | null; document?: string | null; address?: string | null};
    items: DemoNfeItem[];
    totals: {products: number; icms: number; invoice: number};
}

export interface ProductReview {
    id: number;
    rating: number;
    comment: string | null;
    customer_name?: string | null;
    product_id?: number;
    created_at?: string;
}

export const useOrderPix = (orderId: number | undefined, enabled = true) => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ["order-pix", orderId, user?.id],
        queryFn: () => api.get<OrderPix>(`/orders/${orderId}/pix`),
        enabled: enabled && !!user && !!orderId && orderId > 0,
    });
};

export const useIssueOrderNfe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: number) => api.get<DemoNfe>(`/orders/${orderId}/nfe`),
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({queryKey: ["order", orderId]});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível gerar a NF-e", description: error.message, variant: "destructive"});
        },
    });
};

export const useProductReviews = (productId: number | undefined) =>
    useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: () => api.get<ProductReview[]>(`/public/products/${productId}/reviews`),
        enabled: !!productId && productId > 0,
    });

export const useConfirmOrderDelivery = (orderId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.post(`/orders/${orderId}/confirm-delivery`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["order", orderId]});
            queryClient.invalidateQueries({queryKey: ["customer-orders"]});
            toast({title: "Recebimento confirmado. Agora você pode avaliar ou registrar um problema."});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível confirmar a entrega", description: error.message, variant: "destructive"});
        },
    });
};

export const useReportDeliveryIssue = (orderId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {reason: string; description: string; requested_resolution: "refund" | "replacement"; video: File; photos: File[]}) => {
            const form = new FormData();
            form.append("reason", payload.reason);
            form.append("description", payload.description);
            form.append("requested_resolution", payload.requested_resolution);
            form.append("video", payload.video);
            payload.photos.forEach((file) => form.append("photos[]", file));
            return api.postForm(`/orders/${orderId}/delivery-issues`, form);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["order", orderId]});
            toast({title: "Chamado aberto. O produtor confirma o estorno ou o reenvio."});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível abrir o chamado", description: error.message, variant: "destructive"});
        },
    });
};

export const useResolveDeliveryIssue = (orderId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {status: "refunded" | "replaced" | "rejected"; resolution_message: string}) =>
            api.put(`/orders/${orderId}/delivery-issues`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["order", orderId]});
            queryClient.invalidateQueries({queryKey: ["producer-orders"]});
            toast({title: "Pós-compra atualizado"});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível resolver o chamado", description: error.message, variant: "destructive"});
        },
    });
};

export const useSubmitOrderReview = (orderId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {product_id: number; rating: number; comment?: string | null}) =>
            api.post<ProductReview>(`/orders/${orderId}/reviews`, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ["order", orderId]});
            queryClient.invalidateQueries({queryKey: ["product-reviews", variables.product_id]});
            queryClient.invalidateQueries({queryKey: ["public-products"]});
            toast({title: "Avaliação registrada"});
        },
        onError: (error: Error) => {
            toast({title: "Não foi possível avaliar", description: error.message, variant: "destructive"});
        },
    });
};
