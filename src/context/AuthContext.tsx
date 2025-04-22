import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const adminEmail = "namor.juanignacio@gmail.com"; // Cambiá esto por tu mail admin

interface AuthContextType {
    usuario: User | null;
    esAdmin: boolean;
    cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType>({
    usuario: null,
    esAdmin: false,
    cerrarSesion: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [esAdmin, setEsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
            setEsAdmin(user?.email === adminEmail);
        });
        return () => unsubscribe();
    }, []);

    const cerrarSesion = () => {
        signOut(auth);
        setUsuario(null);
        setEsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ usuario, esAdmin, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};
