import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  addDoc
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

interface Venta {
  total: number;
  formaPago: string;
  creado: any;
  productos?: Producto[];
}

interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
  variante?: string;
}

export default function CajaModalEmpleado({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { usuario } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [verDetalles, setVerDetalles] = useState<number | null>(null);
  const [cajaId, setCajaId] = useState<string | null>(null);
  const [efectivoInicial, setEfectivoInicial] = useState(0);
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [mostrarBotonAbrir, setMostrarBotonAbrir] = useState(false);

  const tiendaId = localStorage.getItem("userId") || "";
  const fechaHoy = new Date().toISOString().split("T")[0];
  const empleado = usuario?.displayName || "Empleado";

  useEffect(() => {
    const fetchCaja = async () => {
      console.log("Usuario detectado:", usuario?.email);
      console.log("🔍 Buscando caja...");
      setLoading(true);

      const cajasRef = collection(db, "tiendas", tiendaId, "cajas");
      const q = query(
        cajasRef,
        where("fecha", "==", fechaHoy),
        where("empleado", "==", empleado),
        where("cerrada", "==", false)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const cajaDoc = snap.docs[0];
        const data = cajaDoc.data();
        console.log("📦 Caja abierta encontrada:", data);

        setCajaId(cajaDoc.id);
        setEfectivoInicial(data.efectivoInicial || 0);
        setCajaCerrada(false);
        setMostrarBotonAbrir(false);

        const ventasSnap = await getDocs(
          collection(db, "tiendas", tiendaId, "cajas", cajaDoc.id, "ventas")
        );
        const ventasData = ventasSnap.docs.map((d) => d.data() as Venta);
        setVentas(ventasData);
        console.log("🧾 Ventas cargadas:", ventasData);
      } else {
        console.log("📭 No hay caja abierta. Permitido abrir una nueva.");
        setMostrarBotonAbrir(true);
      }

      setLoading(false);
    };

    if (visible) fetchCaja();
  }, [visible, tiendaId, empleado, fechaHoy, usuario]);

  const efectivo = ventas.filter(v => v.formaPago === "efectivo").reduce((s, v) => s + v.total, 0);
  const mp = ventas.filter(v => v.formaPago === "mercadopago").reduce((s, v) => s + v.total, 0);
  const transferencia = ventas.filter(v => v.formaPago === "transferencia").reduce((s, v) => s + v.total, 0);
  const total = efectivo + mp + transferencia;
  const totalGeneral = efectivoInicial + total;

  const cerrarCaja = async () => {
    if (!cajaId) return;
    const ref = doc(db, "tiendas", tiendaId, "cajas", cajaId);
    await updateDoc(ref, {
      cerrada: true,
      momentoCierre: Timestamp.now(),
      totalEfectivo: efectivo,
      totalMP: mp,
      totalTransferencia: transferencia,
      totalGeneral,
      ventasTotales: ventas.length // ✅ opcional, útil para estadísticas
    });

    await Swal.fire("Caja cerrada", "La caja se cerró exitosamente", "success");

    setCajaId(null);
    setCajaCerrada(true);
    setVentas([]);
    setMostrarBotonAbrir(true);
  };

  const abrirCaja = async () => {
    const { isConfirmed, value } = await Swal.fire({
      title: "Abrir caja",
      input: "number",
      inputLabel: "Monto inicial (opcional)",
      inputPlaceholder: "Ej: 5000",
      showCancelButton: true,
      confirmButtonText: "Abrir",
      cancelButtonText: "Cancelar",
    });

    if (isConfirmed && tiendaId) {
      const nuevoMonto = Number(value);
      if (isNaN(nuevoMonto) || nuevoMonto < 0) {
        return Swal.fire("Monto inválido", "El monto no puede ser negativo", "error");
      }

      const nuevaCaja = await addDoc(collection(db, "tiendas", tiendaId, "cajas"), {
        fecha: fechaHoy,
        creado: Timestamp.now(),
        empleado,
        efectivoInicial: nuevoMonto,
        totalEfectivo: 0,
        totalMp: 0,
        totalTransferencia: 0,
        ventasTotales: 0,
        cerrada: false
      });

      await Swal.fire("Caja abierta", "Se registró la caja correctamente", "success");

      setCajaId(nuevaCaja.id);
      setCajaCerrada(false);
      setEfectivoInicial(nuevoMonto);
      setMostrarBotonAbrir(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "10px", maxWidth: "700px", width: "100%" }}>
        <button onClick={onClose} style={{ float: "right", background: "transparent", border: "none", fontSize: "20px" }}>✖️</button>
        <h2>💵 Caja del día</h2>

        {loading ? (
          <p>Cargando datos...</p>
        ) : cajaId ? (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {ventas.map((v, i) => (
                <li key={i} style={{ marginBottom: "1rem" }}>
                  <div onClick={() => setVerDetalles(verDetalles === i ? null : i)} style={{ cursor: "pointer" }}>
                    🧾 ${v.total} - {v.formaPago} - {new Date(v.creado?.seconds * 1000).toLocaleTimeString()}
                  </div>
                  {verDetalles === i && v.productos && (
                    <div style={{ paddingLeft: "1rem", marginTop: "0.5rem" }}>
                      {v.productos.map((prod, j) => (
                        <div key={j}>
                          • {prod.nombre} x{prod.cantidad} - ${prod.precio} {prod.variante && `(Variante: ${prod.variante})`}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <hr style={{ margin: "1rem 0" }} />
            <p><strong>Inicio de caja:</strong> ${efectivoInicial}</p>
            <p><strong>Total en efectivo:</strong> ${efectivo}</p>
            <p><strong>Total en MP:</strong> ${mp}</p>
            <p><strong>Total en transferencia:</strong> ${transferencia}</p>
            <p><strong>Total general:</strong> ${totalGeneral}</p>

            {!cajaCerrada && (
              <button onClick={cerrarCaja} style={{ marginTop: "1rem", padding: "0.8rem 1.5rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                🔒 Cerrar caja
              </button>
            )}
          </>
        ) : (
          <>
            <p>📭 No hay una caja activa</p>
            {mostrarBotonAbrir && (
              <button onClick={abrirCaja} style={{ marginTop: "1rem", padding: "0.8rem 1.5rem", backgroundColor: "green", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                ➕ Abrir caja
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
