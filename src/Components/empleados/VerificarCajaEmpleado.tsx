import { useEffect } from "react";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function VerificarCajaEmpleado() {
    const { usuario } = useAuth();
    const tiendaId = localStorage.getItem("userId") || "";
    const empleado = usuario?.displayName || "Empleado";
    const fechaHoy = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const verificarCaja = async () => {
            const q = query(
                collection(db, "tiendas", tiendaId, "cajas"),
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
                    await addDoc(collection(db, "tiendas", tiendaId, "cajas"), {
                        fecha: fechaHoy,
                        creado: Timestamp.now(),
                        empleado,
                        efectivoInicial: Number(value),
                        totalEfectivo: 0,
                        totalMp: 0,
                        totalTransferencia: 0,
                        ventasTotales: 0,
                    });
                    Swal.fire("✅ Caja abierta", "La caja se abrió correctamente.", "success");
                }
            }
        };

        if (usuario) verificarCaja();
    }, [usuario]);

    return null;
}
