// src/pages/Login.tsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export default function Login() {
    const navigate = useNavigate();
    const { usuario, rol } = useAuth();

    useEffect(() => {
        if (!usuario) return;

        // 🔁 Redirigir automáticamente según el rol
        if (rol === "admin") navigate("/admin");
        else if (rol === "empleado") navigate("/ventas-presenciales");
        else navigate("/");
    }, [usuario, rol, navigate]);

    const handleLoginGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 🔍 Buscamos por email en la colección de usuarios
            const ref = doc(db, "usuarios", user.email!);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();

                console.log("📄 Documento encontrado en Firestore:", data);

                // ✅ Guardamos el userId de la tienda correspondiente
                localStorage.setItem("userId", data.tiendaId);

                // Redirigimos según su rol
                if (data.rol === "empleado") navigate("/ventas-presenciales");
                else if (user.email === "namor.juanignacio@gmail.com") navigate("/admin");
                else navigate("/");
            } else {
                console.warn("❌ El usuario no tiene documento en Firestore");
                navigate("/");
            }

        } catch (err) {
            console.error("Error al iniciar sesión con Google:", err);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
            <h2>Iniciar sesión</h2>
            <button onClick={handleLoginGoogle} className="login-btn">
                Ingresar con Google
            </button>
        </div>
    );
}