import SolicitarPin from "../components/SolicitarPin";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

interface Cupon {
    id?: string;
    codigo: string;
    descuento: number;
}

export default function CuponesDescuento() {
    const [cupones, setCupones] = useState<Cupon[]>([]);
    const [codigo, setCodigo] = useState("");
    const [descuento, setDescuento] = useState(0);

    const cargarCupones = async () => {
        const ref = collection(db, "configuracion", "sistema", "cupones");
        const snap = await getDocs(ref);
        const lista = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Cupon, "id">),
        }));
        setCupones(lista);
    };

    useEffect(() => {
        cargarCupones();
    }, []);

    const agregar = async () => {
        if (!codigo.trim() || descuento <= 0) return;
        const ref = collection(db, "configuracion", "sistema", "cupones");
        await addDoc(ref, { codigo, descuento });
        setCodigo("");
        setDescuento(0);
        cargarCupones();
    };

    const eliminar = async (id?: string) => {
        if (!id) return;
        await deleteDoc(doc(db, "configuracion", "sistema", "cupones", id));
        cargarCupones();
    };

    return (
        <SolicitarPin>
            <div style={{ padding: "2rem" }}>
                <h1>🎟️ Cupones de Descuento</h1>
                <input
                    placeholder="Código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    style={{ padding: "0.5rem", marginRight: "0.5rem" }}
                />
                <input
                    type="number"
                    placeholder="% Descuento"
                    value={descuento}
                    onChange={(e) => setDescuento(Number(e.target.value))}
                    style={{ padding: "0.5rem", marginRight: "0.5rem", width: "120px" }}
                />
                <button onClick={agregar}>Agregar</button>

                <ul style={{ marginTop: "2rem" }}>
                    {cupones.map((c) => (
                        <li
                            key={c.id}
                            style={{
                                marginBottom: "0.5rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>
                                <strong>{c.codigo}</strong> - {c.descuento}% OFF
                            </span>
                            <button
                                style={{
                                    background: "red",
                                    color: "white",
                                    border: "none",
                                    padding: "0.2rem 0.5rem",
                                    cursor: "pointer",
                                }}
                                onClick={() => eliminar(c.id)}
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </SolicitarPin>
    );
}
