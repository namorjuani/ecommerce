// src/components/BotonCancelarCuenta.tsx

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const BotonCancelarCuenta = () => {
    const navigate = useNavigate();

    const handleCancelarCuenta = async () => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Si cancelás tu membresía, tu tienda se suspenderá y se eliminará en 15 días si no renovás.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No, mantener mi tienda",
        });

        if (!result.isConfirmed) return;

        const slug = localStorage.getItem("userId");
        if (!slug) return;

        try {
            const tiendaRef = doc(db, "tiendas", slug);
            await updateDoc(tiendaRef, {
                estado: "suspendida",
                fechaCancelacion: Date.now(),
                borradoEn: Date.now() + 15 * 24 * 60 * 60 * 1000,
            });

            await Swal.fire({
                icon: "success",
                title: "Tienda suspendida",
                text: "Tu tienda fue suspendida. Si no renovás en 15 días, será eliminada definitivamente.",
            });

            localStorage.clear();
            navigate("/");
        } catch (error) {
            console.error("Error al suspender tienda:", error);
            Swal.fire("Error", "Hubo un problema al cancelar la tienda", "error");
        }
    };

    return (
        <button
            onClick={handleCancelarCuenta}
            style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "1rem",
            }}
        >
            🗑️ Cancelar membresía / Eliminar cuenta
        </button>
    );
};

export default BotonCancelarCuenta;
