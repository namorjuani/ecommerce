import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PrivateRoute({
  children,
  permiteEmpleado = false,
}: {
  children: ReactNode;
  permiteEmpleado?: boolean;
}) {
  const { usuario } = useAuth();
  const { slug } = useParams();
  const tiendaId = slug || localStorage.getItem("userId") || "";
  const [rolDetectado, setRolDetectado] = useState<"admin" | "empleado" | null>(null);

  useEffect(() => {
    const verificarRol = async () => {
      if (!usuario || !tiendaId) {
        setRolDetectado(null);
        return;
      }

      try {
        const tiendaRef = doc(db, "tiendas", tiendaId);
        const tiendaSnap = await getDoc(tiendaRef);

        if (tiendaSnap.exists() && tiendaSnap.data()?.adminEmail === usuario.email) {
          setRolDetectado("admin");
          return;
        }

        const userRef = doc(db, "tiendas", tiendaId, "usuarios", usuario.email ?? "");
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data()?.rol === "empleado") {
          setRolDetectado("empleado");
          return;
        }

        setRolDetectado(null);
      } catch (error) {
        console.error("Error verificando rol:", error);
        setRolDetectado(null);
      }
    };

    verificarRol();
  }, [usuario, tiendaId]);

  if (rolDetectado === null) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>🔒 Verificando permisos...</p>
      </div>
    );
  }

  if (rolDetectado === "admin") return <>{children}</>;
  if (permiteEmpleado && rolDetectado === "empleado") return <>{children}</>;

  return <Navigate to="/" replace />;
}
