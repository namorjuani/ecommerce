// src/routes/PrivateRoute.tsx
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { slug } = useParams();
  const tiendaId = slug || localStorage.getItem("userId") || "";
  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAdmin = async () => {
      if (!usuario || !tiendaId) {
        setEsAdmin(false);
        return;
      }

      try {
        const tiendaRef = doc(db, "tiendas", tiendaId);
        const tiendaSnap = await getDoc(tiendaRef);

        if (!tiendaSnap.exists()) {
          setEsAdmin(false);
          return;
        }

        const data = tiendaSnap.data();
        if (data?.adminEmail === usuario.email) {
          setEsAdmin(true);
          return;
        }

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

  // Debug para chequear flujo si algo no funciona
  console.log("PrivateRoute → usuario:", usuario?.email, "tiendaId:", tiendaId, "esAdmin:", esAdmin);

  if (esAdmin === null) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>🔒 Verificando permisos...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
