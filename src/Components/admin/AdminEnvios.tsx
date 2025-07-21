import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";

interface Envio {
    nombre: string;
    costoExtra: number;
    id?: string;
}

export default function AdminEnvios({ slug }: { slug: string }) {
    const [envios, setEnvios] = useState<Envio[]>([]);
    const [nombre, setNombre] = useState("");
    const [costoExtra, setCostoExtra] = useState("");

    const cargarEnvios = async () => {
        const ref = collection(db, "tiendas", slug, "envios");
        const snap = await getDocs(ref);
        const lista = snap.docs.map((d) => ({ ...(d.data() as Envio), id: d.id }));
        setEnvios(lista);
    };

    useEffect(() => {
        if (slug) cargarEnvios();
    }, [slug]);

    const crearEnvio = async () => {
        if (!nombre.trim()) {
            Swal.fire("Nombre requerido", "", "info");
            return;
        }
        await addDoc(collection(db, "tiendas", slug, "envios"), {
            nombre,
            costoExtra: parseFloat(costoExtra) || 0,
        });
        setNombre("");
        setCostoExtra("");
        cargarEnvios();
        Swal.fire("Envío guardado", "", "success");
    };

    const eliminarEnvio = async (id: string) => {
        await deleteDoc(doc(db, "tiendas", slug, "envios", id));
        cargarEnvios();
        Swal.fire("Eliminado", "", "success");
    };

    return (
        <div>
            <h3>🚚 Empresas de Envío</h3>
            <input
                type="text"
                placeholder="Nombre transporte"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <input
                type="number"
                placeholder="Costo extra ($)"
                value={costoExtra}
                onChange={(e) => setCostoExtra(e.target.value)}
            />
            <button onClick={crearEnvio}>Guardar</button>

            <ul style={{ marginTop: "1rem", listStyle: "none", padding: 0 }}>
                {envios.map((e) => (
                    <li key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        {e.nombre} (${e.costoExtra})
                        <button onClick={() => eliminarEnvio(e.id!)} style={{ backgroundColor: "crimson", color: "#fff", border: "none", padding: "0.3rem 0.7rem" }}>
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
