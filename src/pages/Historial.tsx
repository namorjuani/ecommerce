import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
} from "firebase/firestore";
import { useCliente } from "../context/ClienteContext";
import { useParams } from "react-router-dom";

interface Pedido {
    id: string;
    clienteUid?: string;
    productos: {
        nombre?: string;
        cantidad: number;
        precio?: number;
    }[];
    total: number;
    estado: "pendiente" | "en_proceso" | "realizado";
    creado: Timestamp | string;
}

export default function Historial() {
    const { cliente } = useCliente();
    const { slug } = useParams<{ slug: string }>();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    useEffect(() => {
        const cargarPedidos = async () => {
            if (!cliente?.uid || !slug) return;

            const pedidosRef = collection(db, "tiendas", slug, "pedidos");
            const q = query(pedidosRef, where("clienteUid", "==", cliente.uid));
            const snapshot = await getDocs(q);

            const lista: Pedido[] = snapshot.docs.map((doc) => ({
                ...(doc.data() as Omit<Pedido, "id">),
                id: doc.id,
            }));

            setPedidos(lista);
        };

        cargarPedidos();
    }, [cliente?.uid, slug]);

    const formatearFecha = (fecha: Timestamp | string) => {
        let d: Date;
        if (typeof fecha === "string") d = new Date(fecha);
        else d = fecha.toDate();
        return d.toLocaleString();
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
            <h2>🧾 Historial de Compras</h2>
            {pedidos.length === 0 ? (
                <p>No hay pedidos realizados aún.</p>
            ) : (
                pedidos
                    .sort(
                        (a, b) =>
                            new Date(b.creado as string).getTime() -
                            new Date(a.creado as string).getTime()
                    )
                    .map((pedido) => (
                        <div
                            key={pedido.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                padding: "1rem",
                            }}
                        >
                            <p>
                                <strong>Fecha:</strong> {formatearFecha(pedido.creado)}
                            </p>
                            <p>
                                <strong>Total:</strong> ${pedido.total}
                            </p>
                            <p>
                                <strong>Estado:</strong> {pedido.estado}
                            </p>
                            <ul>
                                {pedido.productos.map((p, i) => (
                                    <li key={i}>
                                        {p.nombre || "Producto"} x {p.cantidad}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
            )}
        </div>
    );
}
