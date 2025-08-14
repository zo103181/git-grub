import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface RequireAuthProps {
    children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
    const { authUser, loading } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Checking authentication ...</p>
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
