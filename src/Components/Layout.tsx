import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import Footer from "./Footer";
import { useTienda } from "../context/TiendaContext";

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const { carrito } = useCarrito();
  const tienda = useTienda();

  useEffect(() => {
    if (tienda?.colorFondo) {
      document.documentElement.style.setProperty("--color-fondo", tienda.colorFondo);
    }
  }, [tienda?.colorFondo]);

  return (
    <div className="layout">
      <header
        className="navbar"
        style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}
      >
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
              <button className="login-btn" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Ingresar
            </button>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>

      <Footer />
    </div>
  );
}
