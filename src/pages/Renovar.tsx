// ✅ src/components/Renovar.tsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, where, query } from "firebase/firestore";
import Swal from "sweetalert2";

const Renovar = () => {
    const [correo, setCorreo] = useState("");
    const [tiendas, setTiendas] = useState<string[]>([]);
    const [cargando, setCargando] = useState(false);

    const buscarTiendas = async () => {
        if (!correo) return Swal.fire("Error", "Ingresá tu correo", "error");

        setCargando(true);
        try {
            const snapshot = await getDocs(collection(db, "tiendas"));
            const resultados: string[] = [];

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.adminEmail === correo) {
                    resultados.push(docSnap.id);
                }
            });

            if (resultados.length === 0) {
                Swal.fire("No encontramos tiendas con ese correo");
            }

            setTiendas(resultados);
        } catch (err) {
            console.error("Error buscando tiendas:", err);
            Swal.fire("Error", "No se pudo buscar tus tiendas", "error");
        } finally {
            setCargando(false);
        }
    };

    const renovarTienda = async (slug: string) => {
        const confirmar = await Swal.fire({
            title: "¿Deseás renovar esta tienda?",
            text: `Tienda: ${slug}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, renovar",
        });

        if (!confirmar.isConfirmed) return;

        // Acá iría el redireccionamiento a MercadoPago, por ahora simulado
        await updateDoc(doc(db, "tiendas", slug), {
            estado: "activa",
            vence: Date.now() + 30 * 24 * 60 * 60 * 1000, // suma 30 días
        });

        Swal.fire("✅ Renovada", `Tu tienda "${slug}" fue reactivada`, "success");

        // Link a tienda
        window.location.href = `/tienda/${slug}`;
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
            <h2>🔄 Renovar membresía</h2>
            <p>Ingresá el correo con el que creaste tu tienda:</p>

            <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Tu correo"
                style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
            />

            <button onClick={buscarTiendas} disabled={cargando} style={{ padding: "10px 20px" }}>
                {cargando ? "Buscando..." : "Buscar mis tiendas"}
            </button>

            {tiendas.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Tiendas encontradas:</h3>
                    <ul>
                        {tiendas.map((slug) => (
                            <li key={slug} style={{ marginBottom: "0.5rem" }}>
                                🛒 <strong>{slug}</strong>{" "}
                                <button onClick={() => renovarTienda(slug)} style={{ marginLeft: "1rem" }}>
                                    Renovar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Renovar;
