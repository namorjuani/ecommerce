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
    cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType>({
    usuario: null,
    rol: "cliente",
    esAdmin: false,
    esEmpleado: false,
    cerrarSesion: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [rol, setRol] = useState<"admin" | "empleado" | "cliente">("cliente");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUsuario(user);
                console.log("👤 Usuario detectado:", user.email);

                // Admin directo por correo
                if (user.email === adminEmail) {
                    console.log("✅ Es admin por email");
                    setRol("admin");
                    return;
                }

                // Busca en Firestore por email
                const userDocRef = doc(db, "usuarios", user.email!);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    console.log("📄 Documento encontrado en Firestore:", data);
                    const rolDetectado = data.rol || "cliente";
                    console.log("🔍 Rol detectado:", rolDetectado);
                    setRol(rolDetectado);
                } else {
                    console.log("⚠️ No se encontró documento del usuario. Se asigna rol: cliente");
                    setRol("cliente");
                }
            } else {
                console.log("🚫 Usuario deslogueado");
                setUsuario(null);
                setRol("cliente");
            }
        });

        return () => unsubscribe();
    }, []);

    const cerrarSesion = () => {
        signOut(auth);
        setUsuario(null);
        setRol("cliente");
        localStorage.removeItem("userId");
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                rol,
                esAdmin: rol === "admin",
                esEmpleado: rol === "empleado",
                cerrarSesion,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};