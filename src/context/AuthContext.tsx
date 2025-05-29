import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const adminEmail = "namor.juanignacio@gmail.com"; // tu email admin

interface AuthContextType {
  usuario: User | null;
  rol: "admin" | "empleado" | "cliente";
  esAdmin: boolean;
  esEmpleado: boolean;
  tiendaNombre: string;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  rol: "cliente",
  esAdmin: false,
  esEmpleado: false,
  tiendaNombre: "",
  cerrarSesion: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [rol, setRol] = useState<"admin" | "empleado" | "cliente">("cliente");
  const [tiendaNombre, setTiendaNombre] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        console.log("👤 Usuario detectado:", user.email);

        // Admin directo por correo
        if (user.email === adminEmail) {
          setRol("admin");
        } else {
          // Busca en Firestore por email
          const userDocRef = doc(db, "usuarios", user.email!);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setRol(data.rol || "cliente");
          } else {
            setRol("cliente");
          }
        }

        // Cargar el nombre de la tienda
        const tiendaRef = doc(db, "tiendas", user.uid);
        const tiendaSnap = await getDoc(tiendaRef);
        if (tiendaSnap.exists()) {
          setTiendaNombre(tiendaSnap.data().nombre || "");
        }

      } else {
        setUsuario(null);
        setRol("cliente");
        setTiendaNombre("");
      }
    });

    return () => unsubscribe();
  }, []);

  const cerrarSesion = () => {
    signOut(auth);
    setUsuario(null);
    setRol("cliente");
    setTiendaNombre("");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
        esAdmin: rol === "admin",
        esEmpleado: rol === "empleado",
        tiendaNombre,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
