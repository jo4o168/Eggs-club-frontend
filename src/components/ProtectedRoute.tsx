import {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {Loader2} from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('customer' | 'producer')[];
}

const ProtectedRoute = ({children, allowedRoles}: ProtectedRouteProps) => {
    const {user, profile, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect to correct dashboard based on role
        const redirectPath = profile.role === 'producer'
            ? '/producer/dashboard'
            : '/customer/dashboard';
        return <Navigate to={redirectPath} replace/>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
