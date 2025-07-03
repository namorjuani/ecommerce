import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  usuario: User | null;
  esAdmin: boolean;
  esEmpleado: boolean;  // 👉 Ahora lo incluimos
  rol: string;
  cerrarSesion: () => void;
}

// 👉 Contexto base
const AuthContext = createContext<AuthContextType>({
  usuario: null,
  esAdmin: false,
  esEmpleado: false,
  rol: "",
  cerrarSesion: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esEmpleado, setEsEmpleado] = useState(false);
  const [rol, setRol] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      setEsAdmin(false);
      setEsEmpleado(false);
      setRol("");

      if (user) {
        const tiendaId = localStorage.getItem("userId");

        if (tiendaId) {
          try {
            const tiendaRef = doc(db, "tiendas", tiendaId);
            const tiendaSnap = await getDoc(tiendaRef);

            if (tiendaSnap.exists()) {
              const data = tiendaSnap.data();
              if (data.adminEmail === user.email) {
                setEsAdmin(true);
                setRol("admin");
                return;
              }

              // Verificar si es usuario con rol
              const userRef = doc(db, "tiendas", tiendaId, "usuarios", user.email || "");
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.rol) {
                  setRol(userData.rol);
                  setEsAdmin(userData.rol === "admin");
                  setEsEmpleado(userData.rol === "empleado");
                  return;
                }
              }
            }
          } catch (error) {
            console.error("Error cargando datos de usuario:", error);
          }
        }

        // Por defecto lo tratamos como cliente
        setRol("cliente");
      }
    });

    return () => unsubscribe();
  }, []);

  const cerrarSesion = () => {
    signOut(auth).catch((err) => console.error("Error cerrando sesión:", err));
    localStorage.removeItem("userId");
    localStorage.removeItem("correoAdmin");
  };

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, esEmpleado, rol, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}
