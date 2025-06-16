import { useEffect, useState } from "react";
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";

export default function ResumenCajasAdmin() {
    const { usuario } = useAuth();
    const [cajas, setCajas] = useState<any[]>([]);
    const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
    const [detalleVentas, setDetalleVentas] = useState<Record<string, any[]>>({});

    useEffect(() => {
        if (!usuario) return;

        const obtenerCajas = async () => {
            const ref = collection(db, "tiendas", usuario.uid, "cajas");
            const q = query(ref, orderBy("fecha", "desc"));
            const snap = await getDocs(q);

            const cajasConVentas = await Promise.all(
                snap.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const ventasSnap = await getDocs(
                        collection(db, "tiendas", usuario.uid, "cajas", docSnap.id, "ventas")
                    );
                    const ventas = ventasSnap.docs.map((v) => v.data());
                    return { id: docSnap.id, ...data, ventas };
                })
            );

            setCajas(cajasConVentas);
        };

        obtenerCajas();
    }, [usuario]);

    const toggleSeleccion = (id: string) => {
        setSeleccionadas((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const seleccionarTodas = () => {
        if (seleccionadas.length === cajas.length) {
            setSeleccionadas([]);
        } else {
            setSeleccionadas(cajas.map((c) => c.id));
        }
    };

    const totalEnEfectivo = cajas.reduce((suma, caja) => {
        if (!caja.retirado && Array.isArray(caja.ventas)) {
            const totalCaja = caja.ventas.reduce((acc: number, venta: any) => {
                return venta.formaPago === "efectivo" ? acc + (venta.total || 0) : acc;
            }, 0);
            return suma + totalCaja;
        }
        return suma;
    }, 0);

    const exportarSeleccionadas = () => {
        const aExportar = cajas.filter((c) => seleccionadas.includes(c.id));
        if (aExportar.length === 0) {
            alert("Seleccioná al menos una caja para exportar.");
            return;
        }

        const rows: any[] = [];

        aExportar.forEach((caja) => {
            caja.ventas?.forEach((venta: any, index: number) => {
                venta.productos?.forEach((prod: any) => {
                    rows.push({
                        Fecha: caja.fecha,
                        Empleado: caja.empleado || caja.registradoPor,
                        FormaPago: venta.formaPago,
                        Producto: prod.nombre,
                        Variante: prod.variante || "-",
                        Cantidad: prod.cantidad,
                        PrecioUnitario: prod.precio,
                        Subtotal: (prod.precio || 0) * (prod.cantidad || 0),
                        TotalVenta: venta.total,
                        CajaTotal: caja.ventasTotales,
                        Retirado: caja.retirado ? "Sí" : "No",
                    });
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detalle de Cajas");
        XLSX.writeFile(wb, "detalle_cajas.xlsx");
    };


    const borrarSeleccionadas = async () => {
        const confirm = window.confirm("¿Seguro que querés borrar las cajas seleccionadas?");
        if (!confirm) return;

        for (const id of seleccionadas) {
            if (!usuario) return;
            await deleteDoc(doc(db, "tiendas", usuario.uid, "cajas", id));
        }

        setCajas((prev) => prev.filter((c) => !seleccionadas.includes(c.id)));
        setSeleccionadas([]);
    };

    const marcarComoRetirada = async (id: string) => {
        if (!usuario) return;
        const ref = doc(db, "tiendas", usuario.uid, "cajas", id);
        await updateDoc(ref, { retirado: true });
        setCajas((prev) =>
            prev.map((c) => (c.id === id ? { ...c, retirado: true } : c))
        );
    };

    const toggleDetalle = async (id: string) => {
        if (detalleVentas[id]) {
            setDetalleVentas((prev) => {
                const nuevo = { ...prev };
                delete nuevo[id];
                return nuevo;
            });
        } else {
            const ref = collection(db, "tiendas", usuario!.uid, "cajas", id, "ventas");
            const snap = await getDocs(ref);
            const ventas = snap.docs.map((doc) => doc.data());
            setDetalleVentas((prev) => ({ ...prev, [id]: ventas }));
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2 style={{ display: "flex", justifyContent: "space-between" }}>
                Resumen de Cajas (Administrador)
                <span style={{ color: "green", fontWeight: "bold", fontSize: "1.2rem" }}>
                    💵 Total en efectivo a retirar: ${totalEnEfectivo}
                </span>
            </h2>

            <div style={{ margin: "1rem 0", display: "flex", gap: "1rem" }}>
                <button onClick={seleccionarTodas}>
                    🗂️ {seleccionadas.length === cajas.length ? "Deseleccionar todas" : "Seleccionar todas"}
                </button>
                <button onClick={exportarSeleccionadas} style={{ backgroundColor: "#00c853", color: "white" }}>
                    📥 Exportar seleccionadas
                </button>
                <button onClick={borrarSeleccionadas} style={{ backgroundColor: "#d32f2f", color: "white" }}>
                    🗑️ Borrar seleccionadas
                </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                <thead style={{ background: "#f0f0f0" }}>
                    <tr>
                        <th style={td}>✅</th>
                        <th style={td}>Fecha</th>
                        <th style={td}>Empleado</th>
                        <th style={td}>Total</th>
                        <th style={td}>Estado</th>
                        <th style={td}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cajas.map((caja) => (
                        <>
                            <tr key={caja.id} style={{ backgroundColor: caja.retirado ? "#e0e0e0" : "#fff" }}>
                                <td style={td}>
                                    <input
                                        type="checkbox"
                                        checked={seleccionadas.includes(caja.id)}
                                        onChange={() => toggleSeleccion(caja.id)}
                                    />
                                </td>
                                <td style={td}>{caja.fecha}</td>
                                <td style={td}>{caja.empleado || caja.registradoPor}</td>
                                <td style={td}>${caja.ventasTotales}</td>
                                <td style={td}>
                                    {caja.retirado ? (
                                        <span style={{ color: "gray" }}>Retirado</span>
                                    ) : (
                                        <span style={{ color: "green" }}>💵 Disponible</span>
                                    )}
                                </td>
                                <td style={td}>
                                    {!caja.retirado && (
                                        <button onClick={() => marcarComoRetirada(caja.id)} style={{ marginRight: "0.5rem" }}>
                                            Retirar
                                        </button>
                                    )}
                                    <button onClick={() => toggleDetalle(caja.id)}>
                                        {detalleVentas[caja.id] ? "Ocultar detalle" : "Ver detalle"}
                                    </button>
                                </td>
                            </tr>

                            {detalleVentas[caja.id] && (
                                <tr>
                                    <td colSpan={6} style={{ background: "#fafafa", padding: "1rem" }}>
                                        <h4>🧾 Ventas registradas:</h4>
                                        {detalleVentas[caja.id].length === 0 ? (
                                            <p>No hay ventas registradas.</p>
                                        ) : (
                                            detalleVentas[caja.id].map((venta, i) => (
                                                <div key={i} style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #ccc" }}>
                                                    <strong>💳 {venta.formaPago?.toUpperCase()}</strong> – ${venta.total}
                                                    {venta.productos ? (
                                                        <table style={{ width: "100%", marginTop: "0.5rem", borderCollapse: "collapse" }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: "#f5f5f5" }}>
                                                                    <th style={td}>Producto</th>
                                                                    <th style={td}>Variante</th>
                                                                    <th style={td}>Cantidad</th>
                                                                    <th style={td}>Precio unitario</th>
                                                                    <th style={td}>Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {venta.productos.map((prod: any, j: number) => (
                                                                    <tr key={j}>
                                                                        <td style={td}>{prod.nombre}</td>
                                                                        <td style={td}>{prod.variante || "–"}</td>
                                                                        <td style={td}>{prod.cantidad}</td>
                                                                        <td style={td}>${prod.precio || 0}</td>
                                                                        <td style={td}>${(prod.precio || 0) * (prod.cantidad || 0)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p style={{ marginTop: "0.5rem", color: "gray" }}>No hay detalle de productos.</p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const td: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "0.5rem",
    textAlign: "center",
};
