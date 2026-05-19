import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/api/http';
import {toast} from '@/hooks/use-toast';
import {useAuth} from '@/contexts/AuthContext';

export interface ProducerSetting {
    id: number;
    farm_name: string;
    description: string | null;
    certifications: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    website: string | null;
    delivery_info: string | null;
    accepts_new_subscribers: boolean;
    visible_in_search: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    new_order_alert: boolean;
    weekly_report: boolean;
    producer_id: number;
}

export const useProducerSetting = () => {
    const {user} = useAuth();
    return useQuery({
        queryKey: ['producer-setting', user?.id],
        queryFn: () => api.get<ProducerSetting | null>('/producer-settings/me'),
        enabled: !!user,
    });
};

export const useUpsertProducerSetting = () => {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: (payload: Partial<ProducerSetting>) => api.put('/producer-settings/me', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['producer-setting', user?.id]});
            toast({title: 'Configurações do produtor atualizadas com sucesso!'});
        },
        onError: (error: Error) => {
            toast({title: 'Erro ao atualizar configurações do produtor', description: error.message, variant: 'destructive'});
        },
    });
};
