import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {toast} from '@/hooks/use-toast';
import {api} from '@/api/http';

export interface Profile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    cpf?: string | null;
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

function getApiBaseUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    return apiUrl.replace(/\/api\/?$/, '');
}

function normalizeAvatarUrl(url?: string | null) {
    if (!url) return null;
    if (url.startsWith('data:')) {
        return url;
    }

    const apiBaseUrl = getApiBaseUrl();
    const apiBase = new URL(apiBaseUrl);

    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const current = new URL(url);
            const hasDefaultLocalhostOrigin =
                current.hostname === 'localhost' &&
                (current.port === '' || current.port === '80');

            if (hasDefaultLocalhostOrigin) {
                current.protocol = apiBase.protocol;
                current.host = apiBase.host;
                return current.toString();
            }
        } catch {
            // Falls back to raw value if URL parsing fails.
        }

        return url;
    }

    if (url.startsWith('/')) {
        return `${apiBaseUrl}${url}`;
    }

    return `${apiBaseUrl}/${url}`;
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
