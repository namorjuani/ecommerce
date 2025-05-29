import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

interface ClienteContextType {
  cliente: User | null;
  iniciarSesion: () => void;
  cerrarSesion: () => void;
}

const ClienteContext = createContext<ClienteContextType>({} as ClienteContextType);

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCliente(user);
    });
    return () => unsubscribe();
  }, []);

  const iniciarSesion = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  return (
    <ClienteContext.Provider value={{ cliente, iniciarSesion, cerrarSesion }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  return useContext(ClienteContext);
}