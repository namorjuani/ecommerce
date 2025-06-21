import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
    const { usuario, esAdmin } = useAuth();

    if (!usuario || !esAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
localStorage.getItem("userId");

