import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "./css/Pedidos.css";

interface Pedido {
  id: string;
  cliente: {
    nombre?: string;
    dni?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  productos: {
    id: string;
    nombre?: string;
    cantidad: number;
    subtotal?: number;
  }[];
  total: number;
  estado: "pendiente" | "en_proceso" | "realizado";
  creado: Timestamp | string;
}

export default function Pedidos() {
  const { slug } = useParams<{ slug?: string }>();
  const urlSlug = slug || localStorage.getItem("userId") || "";
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "pendiente" | "en_proceso">("todos");
  const [ordenFecha, setOrdenFecha] = useState<"recientes" | "antiguos">("recientes");
  const [verHistorial, setVerHistorial] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    if (!urlSlug) return;

    const cargarPedidos = async () => {
      const ref = collection(db, "tiendas", urlSlug, "pedidos");
      const snapshot = await getDocs(ref);
      const lista: Pedido[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Pedido, "id">),
        id: docSnap.id,
      }));
      setPedidos(lista);
    };

    cargarPedidos();
  }, [urlSlug]);

  const cambiarEstado = async (pedidoId: string, nuevoEstado: Pedido["estado"]) => {
    if (!urlSlug) return;
    const ref = doc(db, "tiendas", urlSlug, "pedidos", pedidoId);
    await updateDoc(ref, { estado: nuevoEstado });
    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)));
  };

  const formatearFecha = (fecha: Timestamp | string): string => {
    let d: Date;
    if (typeof fecha === "string") {
      d = new Date(fecha);
    } else if ("toDate" in fecha) {
      d = fecha.toDate();
    } else {
      return "";
    }

    const dia = d.getDate().toString().padStart(2, "0");
    const mes = (d.getMonth() + 1).toString().padStart(2, "0");
    const anio = d.getFullYear();
    const hora = d.getHours().toString().padStart(2, "0");
    const minutos = d.getMinutes().toString().padStart(2, "0");

    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
  };

  const pedidosFiltrados = pedidos
    .filter((p) => {
      if (verHistorial) {
        if (p.estado !== "realizado") return false;
        if (fechaDesde && fechaHasta) {
          const fDesde = new Date(fechaDesde).getTime();
          const fHasta = new Date(fechaHasta).getTime() + 24 * 60 * 60 * 1000;
          const fechaPedido = p.creado instanceof Timestamp ? p.creado.toDate().getTime() : new Date(p.creado).getTime();
          return fechaPedido >= fDesde && fechaPedido <= fHasta;
        }
        return true;
      }
      if (filtroEstado === "todos") return p.estado !== "realizado";
      return p.estado === filtroEstado;
    })
    .sort((a, b) => {
      const fechaA = a.creado instanceof Timestamp ? a.creado.toDate().getTime() : new Date(a.creado).getTime();
      const fechaB = b.creado instanceof Timestamp ? b.creado.toDate().getTime() : new Date(b.creado).getTime();
      return ordenFecha === "recientes" ? fechaB - fechaA : fechaA - fechaB;
    });

  return (
    <div className="pedidos-container">
      <h2>Pedidos {verHistorial && "(Historial Realizados)"}</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {!verHistorial && (
          <>
            <button onClick={() => setFiltroEstado("todos")}>Todos</button>
            <button onClick={() => setFiltroEstado("pendiente")}>Pendientes</button>
            <button onClick={() => setFiltroEstado("en_proceso")}>En proceso</button>
          </>
        )}
        <button onClick={() => setOrdenFecha((o) => (o === "recientes" ? "antiguos" : "recientes"))}>
          Orden: {ordenFecha === "recientes" ? "Más recientes primero" : "Más antiguos primero"}
        </button>
        <button onClick={() => setVerHistorial(!verHistorial)}>
          {verHistorial ? "Volver a pedidos" : "📜 Ver historial realizados"}
        </button>
      </div>

      {verHistorial && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
          <label>
            Desde:{" "}
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{ padding: "0.3rem" }}
            />
          </label>
          <label>
            Hasta:{" "}
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{ padding: "0.3rem" }}
            />
          </label>
        </div>
      )}

      {pedidosFiltrados.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        pedidosFiltrados.map((pedido) => (
          <div key={pedido.id} className="pedido-card">
            <div className="pedido-info">
              <p><strong>Cliente:</strong> {pedido.cliente?.nombre || "Anónimo"}</p>
              <p><strong>DNI:</strong> {pedido.cliente?.dni || "Sin DNI"}</p>
              <p><strong>Dirección:</strong> {pedido.cliente?.direccion || "Sin dirección"}</p>
              <p>
                <strong>Teléfono:</strong> {pedido.cliente?.telefono || "Sin teléfono"}{" "}
                {pedido.cliente?.telefono && (
                  <a
                    href={`https://wa.me/${pedido.cliente.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "0.5rem" }}
                  >
                    📲
                  </a>
                )}
              </p>
              <p><strong>Email:</strong> {pedido.cliente?.email || "Sin email"}</p>
              <p><strong>Fecha:</strong> {formatearFecha(pedido.creado)}</p>
              <p><strong>Total:</strong> ${pedido.total}</p>
            </div>

            <ul className="pedido-productos">
              {pedido.productos?.map((producto, i) => (
                <li key={i}>
                  {producto?.nombre || "Producto inválido"} x {producto.cantidad}
                </li>
              ))}
            </ul>

            {!verHistorial && pedido.estado !== "realizado" && (
              <div className="estado-buttons">
                {pedido.estado === "pendiente" && (
                  <button onClick={() => cambiarEstado(pedido.id, "en_proceso")}>Marcar como En Proceso</button>
                )}
                <button onClick={() => cambiarEstado(pedido.id, "realizado")}>Marcar como Realizado</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
