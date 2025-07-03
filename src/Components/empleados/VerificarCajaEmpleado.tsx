import { useEffect } from "react";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

export default function VerificarCajaEmpleado() {
    const { usuario } = useAuth();
    const { slug } = useParams();  // ✅ Obtenemos el slug de la URL
    const empleado = usuario?.displayName || "Empleado";
    const fechaHoy = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const verificarCaja = async () => {
            if (!slug) return;

            const q = query(
                collection(db, "tiendas", slug, "cajas"),  // ✅ Usamos slug como tiendaId
                where("fecha", "==", fechaHoy),
                where("empleado", "==", empleado)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                const { isConfirmed, value } = await Swal.fire({
                    title: "¿Deseás abrir una nueva caja?",
                    input: "number",
                    inputLabel: "Efectivo inicial",
                    inputPlaceholder: "Ej: 5000",
                    showCancelButton: true,
                    confirmButtonText: "Abrir caja",
                    cancelButtonText: "Cancelar",
                });

                if (isConfirmed && value !== null) {
                    await addDoc(collection(db, "tiendas", slug, "cajas"), {
                        fecha: fechaHoy,
                        creado: Timestamp.now(),
                        empleado,
                        efectivoInicial: Number(value),
                        totalEfectivo: 0,
                        totalMp: 0,
                        totalTransferencia: 0,
                        ventasTotales: 0,
                        cerrada: false,  // ✅ Mejor agregar cerrada por consistencia
                    });
                    Swal.fire("✅ Caja abierta", "La caja se abrió correctamente.", "success");
                }
            }
        };

        if (usuario) verificarCaja();
    }, [usuario, slug, empleado, fechaHoy]);

    return null;
}
