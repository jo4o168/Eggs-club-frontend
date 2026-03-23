import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/contexts/AuthContext';
import {api} from '@/api/http';

export const useProducerStats = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['producer-stats', user?.id],
        queryFn: () => api.get<{
            productsCount: number;
            pendingOrdersCount: number;
            totalRevenue: number;
            subscribersCount: number;
        }>('/stats/producer'),
        enabled: !!user,
    });
};

export const useCustomerStats = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['customer-stats', user?.id],
        queryFn: () => api.get<{
            ordersCount: number;
            monthsSubscribed: number;
            totalSpent: number;
            subscription: unknown;
        }>('/stats/customer'),
        enabled: !!user,
    });
};