import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface RequireAuthProps {
    children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
    const { authUser, loading } = useUser();
    const loc = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Checking authentication ...</p>
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/" replace state={{ from: loc.pathname + loc.search }} />
    }

    return <>{children}</>;
}
