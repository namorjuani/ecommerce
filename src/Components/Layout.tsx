import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

export default function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { usuario, esAdmin, cerrarSesion } = useAuth();
    const { carrito } = useCarrito();

    return (
        <div>
            <header className="navbar" style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
                <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <h1>Mi Tienda</h1>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {usuario ? (
                        <>
                            {esAdmin && (
                                <button className="login-btn" onClick={() => navigate("/admin")}>
                                    Modo Admin
                                </button>
                            )}
                            <button className="login-btn" onClick={() => navigate("/checkout")}>
                                🛒 ({carrito.length})
                            </button>
                            <button className="login-btn" onClick={cerrarSesion}>Cerrar sesión</button>
                        </>
                    ) : (
                        <button className="login-btn" onClick={() => navigate("/login")}>Ingresar</button>
                    )}
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
