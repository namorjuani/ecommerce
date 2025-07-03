// src/pages/SeleccionarTienda.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SeleccionarTienda() {
    const [tiendas, setTiendas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();
    const { usuario } = useAuth();

    useEffect(() => {
        const obtenerTiendas = async () => {
            if (!usuario?.email) return;

            setCargando(true);
            try {
                const q = query(
                    collection(db, "tiendas"),
                    where("adminEmail", "==", usuario.email)
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTiendas(results);

                // Si solo tiene una tienda, redirigir directo
                if (results.length === 1) {
                    localStorage.setItem("userId", results[0].id);
                    navigate(`/admin/${results[0].id}`);
                }

            } catch (err) {
                console.error("Error obteniendo tiendas:", err);
            } finally {
                setCargando(false);
            }
        };

        obtenerTiendas();
    }, [usuario, navigate]);

    const seleccionar = (tiendaId: string) => {
        localStorage.setItem("userId", tiendaId);
        navigate(`/admin/${tiendaId}`);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Elegí la tienda que querés administrar:</h2>
            {cargando && <p>Cargando tiendas...</p>}
            {!cargando && tiendas.length === 0 && <p>No sos administrador de ninguna tienda.</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {tiendas.map(t => (
                    <li key={t.id} style={{ marginBottom: "1rem" }}>
                        <strong>{t.nombre || t.id}</strong>
                        <button
                            onClick={() => seleccionar(t.id)}
                            style={{
                                marginLeft: "1rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "#3483fa",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                            }}
                        >
                            Administrar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
