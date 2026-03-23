import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    unit: string;
    is_active: boolean;
    producer_id: number;
    created_at: string;
    updated_at: string;
}

export const useProducts = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['products', user?.id],
        queryFn: () => api.get<Product[]>('/products'),
        enabled: !!user,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (product: Partial<Product>) => api.post<Product>('/products', product),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            toast({title: 'Produto criado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao criar produto', description: error.message, variant: 'destructive'});
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, ...updates}: Partial<Product> & { id: number }) =>
            api.put<Product>(`/products/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            toast({title: 'Produto atualizado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar produto', description: error.message, variant: 'destructive'});
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            toast({title: 'Produto removido com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao remover produto', description: error.message, variant: 'destructive'});
        },
    });
};