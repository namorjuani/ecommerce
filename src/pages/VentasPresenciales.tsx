import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    Timestamp,
    where,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";

export default function VentasPresenciales() {
    const { usuario, esEmpleado } = useAuth();
    const [producto, setProducto] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [precioUnitario, setPrecioUnitario] = useState(0);
    const [historial, setHistorial] = useState<any[]>([]);
    const [nota, setNota] = useState("");
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [cajaId, setCajaId] = useState("");
    const [fechaHoy] = useState(new Date().toISOString().split("T")[0]);

    const tiendaId = localStorage.getItem("userId") || usuario?.uid || "";
    const empleado = usuario?.displayName || "Empleado";

    const [notaCaja, setNotaCaja] = useState("");
    const [cargandoCierre, setCargandoCierre] = useState(false);


    useEffect(() => {
        if (esEmpleado) {
            verificarCajaHoy();
            obtenerHistorial();
        }
    }, [esEmpleado]);

    const verificarCajaHoy = async () => {
        const q = query(collection(db, "tiendas", tiendaId, "cajas"), where("fecha", "==", fechaHoy));
        const snap = await getDocs(q);
        if (!snap.empty) {
            setCajaAbierta(true);
            setCajaId(snap.docs[0].id);
            setNota(snap.docs[0].data().nota || "");
        }
    };

    const iniciarCaja = async () => {
        const docRef = await addDoc(collection(db, "tiendas", tiendaId, "cajas"), {
            fecha: fechaHoy,
            inicio: Timestamp.now(),
            nota: "",
            ventasTotales: 0,
            registradoPor: empleado,
        });
        setCajaAbierta(true);
        setCajaId(docRef.id);
        Swal.fire("✔️ Caja iniciada", "", "success");
    };

    const cerrarCaja = async () => {
    if (!cajaId) return;

    await updateDoc(doc(db, "tiendas", tiendaId, "cajas", cajaId), {
        cierre: Timestamp.now(),
        nota,
    });

    setCajaAbierta(false);
    setCajaId(""); // 🔄 Limpieza importante
    Swal.fire("📦 Caja cerrada", "Podés exportar el resumen", "info");
};

    const registrarVenta = async () => {
        if (!producto || cantidad <= 0 || precioUnitario <= 0) {
            Swal.fire("Error", "Completá todos los campos correctamente", "error");
            return;
        }

        const total = cantidad * precioUnitario;

        const venta = {
            producto,
            cantidad,
            precioUnitario,
            total,
            fecha: fechaHoy,
            empleado,
            creado: Timestamp.now(),
        };

        await addDoc(collection(db, "tiendas", tiendaId, "ventas"), venta);

        // sumamos al total de caja
        if (cajaId) {
            const cajaRef = doc(db, "tiendas", tiendaId, "cajas", cajaId);
            const cajaSnap = await getDoc(cajaRef);
            if (cajaSnap.exists()) {
                const actual = cajaSnap.data().ventasTotales || 0;
                await updateDoc(cajaRef, { ventasTotales: actual + total });
            }
        }

        setProducto("");
        setCantidad(1);
        setPrecioUnitario(0);
        obtenerHistorial();
    };

    const obtenerHistorial = async () => {
        const q = query(collection(db, "tiendas", tiendaId, "ventas"), where("fecha", "==", fechaHoy));
        const snap = await getDocs(q);
        const lista = snap.docs.map((doc) => doc.data());
        setHistorial(lista);
    };

    const exportarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(historial);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, `ventas_${fechaHoy}.xlsx`);
    };



    if (!esEmpleado) return <p style={{ textAlign: "center" }}>🔒 Acceso solo para empleados</p>;



    return (
        <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
            <h2>🧾 Punto de venta presencial</h2>

            {!cajaAbierta ? (
                <button onClick={iniciarCaja}>📦 Iniciar caja del día</button>
            ) : (
                <>
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "2fr 1fr 1fr" }}>
                        <input
                            placeholder="Producto o servicio"
                            value={producto}
                            onChange={(e) => setProducto(e.target.value)}
                        />
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(Number(e.target.value))}
                            placeholder="Cantidad"
                        />
                        <input
                            type="number"
                            value={precioUnitario}
                            onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                            placeholder="Precio unitario"
                        />
                    </div>

                    <button onClick={registrarVenta} style={{ marginTop: "1rem" }}>
                        ✅ Registrar venta
                    </button>

                    <hr style={{ margin: "2rem 0" }} />

                    <h3>📌 Nota para el cierre</h3>
                    <textarea
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        placeholder="Dejá instrucciones o notas para el próximo empleado..."
                        style={{ width: "100%", minHeight: "60px" }}
                    />

                    <button onClick={cerrarCaja} style={{ marginTop: "1rem", backgroundColor: "crimson", color: "white" }}>
                        🔒 Cerrar caja
                    </button>

                    <hr />

                    <h3>📊 Historial del día</h3>
                    <button onClick={exportarExcel}>📥 Exportar a Excel</button>




                    <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#eee" }}>
                                <th>Empleado</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((v, i) => (
                                <tr key={i}>
                                    <td>{v.empleado}</td>
                                    <td>{v.producto}</td>
                                    <td>{v.cantidad}</td>
                                    <td>${v.precioUnitario}</td>
                                    <td><strong>${v.total}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr style={{ margin: "2rem 0" }} />
                    <h3>🧾 Cierre de caja</h3>
                    <p>Este cierre guardará el total de ventas presenciales del día.</p>

                    <textarea
                        placeholder="Nota opcional (ej: turno de la tarde, cierre parcial...)"
                        style={{ width: "100%", height: "80px", marginBottom: "1rem" }}
                        value={notaCaja}
                        onChange={(e) => setNotaCaja(e.target.value)}
                    />

                    <button
                        onClick={cerrarCaja}
                        style={{
                            backgroundColor: "#d50000",
                            color: "white",
                            padding: "0.7rem 1.2rem",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        🛑 Cerrar caja de hoy
                    </button>


                </>

            )}
        </div>

    );
}