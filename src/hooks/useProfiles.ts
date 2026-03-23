import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface Profile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: number;
}

export const useProfile = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => api.get<Profile>(`/profiles/${user!.id}`),
        enabled: !!user,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (updates: Partial<Profile>) =>
            api.put<Profile>(`/profiles/${user!.id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile']});
            toast({title: 'Perfil atualizado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive'});
        },
    });
};