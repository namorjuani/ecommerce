// src/components/HistorialCajas.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";

const cellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
};

export default function HistorialCajas() {
    const { usuario } = useAuth();
    const [cajas, setCajas] = useState<any[]>([]);

    useEffect(() => {
        const obtenerCajas = async () => {
            if (!usuario) return;
            const ref = collection(db, "tiendas", usuario.uid, "cajas");
            const snap = await getDocs(ref);
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCajas(data);
        };

        obtenerCajas();
    }, [usuario]);

    const exportarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            cajas.map((c) => ({
                Fecha: c.fecha,
                Apertura: c.inicio?.seconds
                    ? new Date(c.inicio.seconds * 1000).toLocaleTimeString()
                    : "-",
                Cierre: c.cierre?.seconds
                    ? new Date(c.cierre.seconds * 1000).toLocaleTimeString()
                    : "-",
                Total: `$${c.ventasTotales}`,
                Empleado: c.registradoPor,
                Nota: c.nota || "",
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cajas");
        XLSX.writeFile(wb, "historial_cajas.xlsx");
    };

    return (
        <div>
            <h3>📦 Historial de cajas (ventas presenciales)</h3>

            <button
                onClick={exportarExcel}
                style={{
                    marginBottom: "1rem",
                    backgroundColor: "#00c853",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                📥 Exportar historial
            </button>

            <table
                style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
            >
                <thead>
                    <tr style={{ background: "#eee" }}>
                        <th style={cellStyle}>Fecha</th>
                        <th style={cellStyle}>Inicio</th>
                        <th style={cellStyle}>Cierre</th>
                        <th style={cellStyle}>Total</th>
                        <th style={cellStyle}>Empleado</th>
                        <th style={cellStyle}>Nota</th>
                    </tr>
                </thead>
                <tbody>
                    {cajas.map((c, i) => (
                        <tr key={i}>
                            <td style={cellStyle}>{c.fecha}</td>
                            <td style={cellStyle}>
                                {c.inicio?.seconds
                                    ? new Date(c.inicio.seconds * 1000).toLocaleTimeString()
                                    : "-"}
                            </td>
                            <td style={cellStyle}>
                                {c.cierre?.seconds
                                    ? new Date(c.cierre.seconds * 1000).toLocaleTimeString()
                                    : "-"}
                            </td>
                            <td style={cellStyle}>
                                <strong>${c.ventasTotales}</strong>
                            </td>
                            <td style={cellStyle}>{c.registradoPor}</td>
                            <td style={cellStyle}>{c.nota || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
