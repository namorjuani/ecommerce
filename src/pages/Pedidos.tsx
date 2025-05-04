import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./css/Pedidos.css";

interface Pedido {
    id: string;
    cliente: {
        nombre: string;
        dni: string;
        direccion: string;
        telefono: string;
        email: string;
    };
    productos: {
        id: string;
        nombre: string;
        cantidad: number;
        subtotal: number;
    }[];
    total: number;
    estado: "pendiente" | "en_proceso" | "realizado";
    fecha: string;
}

export default function Pedidos() {
    const { usuario } = useAuth();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    useEffect(() => {
        if (!usuario) return;

        const cargarPedidos = async () => {
            const ref = collection(db, "tiendas", usuario.uid, "pedidos");
            const snapshot = await getDocs(ref);
            const lista: Pedido[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Pedido),
            }));
            setPedidos(lista);
        };

        cargarPedidos();
    }, [usuario]);

    const cambiarEstado = async (
        pedidoId: string,
        nuevoEstado: Pedido["estado"]
    ) => {
        if (!usuario) return;
        const ref = doc(db, "tiendas", usuario.uid, "pedidos", pedidoId);
        await updateDoc(ref, { estado: nuevoEstado });
        setPedidos((prev) =>
            prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
        );
    };

    const secciones: Pedido["estado"][] = [
        "pendiente",
        "en_proceso",
        "realizado",
    ];

    return (
        <div className="pedidos-container">
            <h2>Pedidos</h2>

            {secciones.map((estado) => (
                <div key={estado} className="estado-section">
                    <h3>{estado.toUpperCase()}</h3>
                    {pedidos.filter((p) => p.estado === estado).length === 0 ? (
                        <p>No hay pedidos en este estado.</p>
                    ) : (
                        pedidos
                            .filter((p) => p.estado === estado)
                            .map((pedido) => (
                                <div key={pedido.id} className="pedido-card">
                                    <p>
                                        <strong>Cliente:</strong> {pedido.cliente.nombre}
                                    </p>
                                    <p>
                                        <strong>DNI:</strong> {pedido.cliente.dni}
                                    </p>
                                    <p>
                                        <strong>Dirección:</strong> {pedido.cliente.direccion}
                                    </p>
                                    <p>
                                        <strong>Teléfono:</strong> {pedido.cliente.telefono}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {pedido.cliente.email}
                                    </p>
                                    <p>
                                        <strong>Fecha:</strong> {pedido.fecha}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ${pedido.total}
                                    </p>

                                    <ul>
                                        {pedido.productos?.map((producto, i) =>
                                            producto && producto.nombre ? (
                                                <li key={i}>
                                                    {producto.nombre} x {producto.cantidad}
                                                </li>
                                            ) : (
                                                <li key={i} style={{ color: "red" }}>
                                                    Producto inválido
                                                </li>
                                            )
                                        )}
                                    </ul>


                                    {estado !== "realizado" && (
                                        <div className="estado-buttons">
                                            {estado === "pendiente" && (
                                                <button
                                                    onClick={() => cambiarEstado(pedido.id, "en_proceso")}
                                                >
                                                    Marcar como En Proceso
                                                </button>
                                            )}
                                            <button
                                                onClick={() => cambiarEstado(pedido.id, "realizado")}
                                            >
                                                Marcar como Realizado
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            ))}
        </div>
    );
}
