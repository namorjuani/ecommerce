import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import Footer from "./Footer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { usuario } = useAuth();
  const { carrito } = useCarrito();
  const [esAdmin, setEsAdmin] = useState(false);
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [slugActivo, setSlugActivo] = useState<string | null>(null);

  useEffect(() => {
    const verificarAdminYColor = async () => {
      if (!slug) return;

      try {
        const visualRef = doc(db, "tiendas", slug, "configuracion", "visual");
        const visualSnap = await getDoc(visualRef);
        if (visualSnap.exists()) {
          const data = visualSnap.data();
          if (data?.colorFondo) {
            setColorFondo(data.colorFondo);
            document.documentElement.style.setProperty("--color-fondo", data.colorFondo);
          }
        }

        if (usuario) {
          const tiendaRef = doc(db, "tiendas", slug);
          const tiendaSnap = await getDoc(tiendaRef);
          if (tiendaSnap.exists() && tiendaSnap.data()?.adminEmail === usuario.email) {
            setEsAdmin(true);
            localStorage.setItem("userId", slug);
            setSlugActivo(slug);
            return;
          }

          const userRef = doc(db, "tiendas", slug, "usuarios", usuario.email || "");
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data()?.rol === "admin") {
            setEsAdmin(true);
            localStorage.setItem("userId", slug);
            setSlugActivo(slug);
            return;
          }

          setEsAdmin(false);
        }
      } catch (error) {
        console.error("Error en Layout:", error);
        setEsAdmin(false);
      }
    };

    verificarAdminYColor();
  }, [usuario, slug]);

  // Ya no hace falta el botón acá, lo mandamos al header
  return (
    <div className="layout" style={{ backgroundColor: colorFondo }}>
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
