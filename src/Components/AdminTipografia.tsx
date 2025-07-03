import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";

export default function AdminTipografia() {
    const { usuario } = useAuth();
    const { slug } = useParams();  // ✅ Obtenemos el slug de la URL
    const [fuentes, setFuentes] = useState({
        fuenteGeneral: "Arial",
        tamañoH1: "32px",
        tamañoH2: "24px",
        tamañoCategorias: "18px",
    });

    useEffect(() => {
        const cargarDatos = async () => {
            if (!slug) return;
            const ref = doc(db, "tiendas", slug);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                if (data.estilosTexto) setFuentes(data.estilosTexto);
            }
        };
        cargarDatos();
    }, [slug]);

    const guardarCambios = async () => {
        if (!slug) return;
        const ref = doc(db, "tiendas", slug);
        await updateDoc(ref, {
            estilosTexto: fuentes,
        });
        alert("Tipografía actualizada ✅");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Personalizar Tipografía</h2>

            <label>Fuente general:</label>
            <input
                value={fuentes.fuenteGeneral}
                onChange={(e) =>
                    setFuentes({ ...fuentes, fuenteGeneral: e.target.value })
                }
                placeholder="Ej: Arial, Roboto, etc."
            />

            <br />
            <br />

            <label>Tamaño Título H1:</label>
            <input
                value={fuentes.tamañoH1}
                onChange={(e) => setFuentes({ ...fuentes, tamañoH1: e.target.value })}
                placeholder="Ej: 32px"
            />

            <br />
            <br />

            <label>Tamaño Título H2:</label>
            <input
                value={fuentes.tamañoH2}
                onChange={(e) => setFuentes({ ...fuentes, tamañoH2: e.target.value })}
                placeholder="Ej: 24px"
            />

            <br />
            <br />

            <label>Tamaño texto categorías:</label>
            <input
                value={fuentes.tamañoCategorias}
                onChange={(e) =>
                    setFuentes({ ...fuentes, tamañoCategorias: e.target.value })
                }
                placeholder="Ej: 18px"
            />

            <br />
            <br />
            <button onClick={guardarCambios}>💾 Guardar cambios</button>
        </div>
    );
}
