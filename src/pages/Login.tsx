import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const provider = new GoogleAuthProvider();

export default function Login() {
    const navigate = useNavigate();
    const { usuario, esAdmin } = useAuth();

    useEffect(() => {
        if (usuario) {
            // Redirigimos según si es admin o no
            esAdmin ? navigate("/admin") : navigate("/");
        }
    }, [usuario, esAdmin, navigate]);

    const handleLoginGoogle = async () => {
        try {
            await signInWithPopup(auth, provider);
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
