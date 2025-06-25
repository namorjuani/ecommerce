import { ReactNode, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import Footer from "./Footer";
import { useTienda } from "../context/TiendaContext";

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const { carrito } = useCarrito();
  const tienda = useTienda();
  const { slug } = useParams();

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
              {esAdmin && slug && (
                <button className="login-btn" onClick={() => navigate(`/admin/${slug}`)}>
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
          ) : null}
        </div>
      </header>

      <main className="main-content">{children}</main>

      <Footer />
    </div>
  );
}

