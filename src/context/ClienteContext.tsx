import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from "firebase/auth";
import { auth } from "../firebase";

interface ClienteContextType {
  cliente: User | null;
  iniciarSesion: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const ClienteContext = createContext<ClienteContextType>({
  cliente: null,
  iniciarSesion: async () => {},
  cerrarSesion: async () => {},
});

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCliente(user);
    });
    return () => unsubscribe();
  }, []);

  const iniciarSesion = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al iniciar sesión. Intentalo nuevamente.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Ocurrió un error al cerrar sesión.");
    }
  };

  return (
    <ClienteContext.Provider value={{ cliente, iniciarSesion, cerrarSesion }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const context = useContext(ClienteContext);
  if (!context) throw new Error("useCliente debe usarse dentro de un ClienteProvider");
  return context;
}
