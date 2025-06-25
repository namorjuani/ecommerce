import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { slug } = useParams();
  const tiendaId = slug ?? ""; // nos aseguramos de que sea string
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAdmin = async () => {
      if (!usuario || !tiendaId) {
        setEsAdmin(false);
        return;
      }

      try {
        const ref = doc(db, "tiendas", tiendaId, "usuarios", usuario.email ?? "");
        const snap = await getDoc(ref);
        setEsAdmin(snap.exists() && snap.data()?.rol === "admin");
      } catch (error) {
        console.error("Error verificando rol:", error);
        setEsAdmin(false);
      }
    };

    verificarAdmin();
  }, [usuario, tiendaId]);

  if (esAdmin === null) return <p>Cargando permisos...</p>;
  if (!esAdmin) return <Navigate to="/" replace />;

  return children;
}
