import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const { usuario, esAdmin } = useAuth();

    if (!usuario || !esAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
