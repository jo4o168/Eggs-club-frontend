import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';
import {normalizePublicAssetUrl} from '@/lib/apiBase';

export interface Profile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    document?: string | null;
    document_type?: "cpf" | "cnpj" | string | null;
    birth_date?: string | null;
    address?: string | null;
    address_number?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    complement?: string | null;
    avatar_url?: string | null;
    role: number;
    producerSetting?: {
        farm_name?: string | null;
        city?: string | null;
        state?: string | null;
    } | null;
}

interface AvatarUploadResponse {
    avatar_url: string;
}

function normalizeAvatarUrl(url?: string | null) {
    return normalizePublicAssetUrl(url);
}

export const useProfile = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            const profile = await api.get<Profile>(`/profiles/me`);
            return {
                ...profile,
                avatar_url: normalizeAvatarUrl(profile.avatar_url),
            };
        },
        enabled: !!user,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (updates: Partial<Profile>) =>
            api.put<Profile>(`/profiles/me`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile']});
            toast({title: 'Perfil atualizado com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive'});
        },
    });
};

export const useUpdateProfileAvatar = () => {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: async (avatarFile: File) => {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            return api.postForm<AvatarUploadResponse>('/profiles/me/avatar', formData);
        },
        onSuccess: (payload) => {
            const nextAvatarUrl = normalizeAvatarUrl(payload.avatar_url);

            queryClient.setQueryData<Profile | undefined>(['profile', user?.id], (prev) =>
                prev
                    ? {
                        ...prev,
                        avatar_url: nextAvatarUrl,
                    }
                    : prev
            );

            queryClient.invalidateQueries({queryKey: ['profile']});
            toast({title: 'Foto atualizada com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar foto', description: error.message, variant: 'destructive'});
        },
    });
};
