import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";
import { sendWelcomeEmail } from "../services/emailService";

export default function ContratarServicio() {
    const [email, setEmail] = useState("");
    const [nombreTienda, setNombreTienda] = useState("");
    const [verificada, setVerificada] = useState(false);
    const [esNueva, setEsNueva] = useState(false);

    const verificarOCrearTienda = async () => {
        if (!email || !nombreTienda) {
            return Swal.fire("Faltan datos", "Completá ambos campos", "warning");
        }

        const tiendaRef = doc(db, "tiendas", nombreTienda);
        const tiendaSnap = await getDoc(tiendaRef);

        if (tiendaSnap.exists()) {
            const data = tiendaSnap.data();
            if (data.adminEmail !== email) {
                return Swal.fire("Error", "Ese correo no coincide con el dueño de la tienda", "error");
            }

            if (data.estado === "activa") {
                return Swal.fire("Ya activa", "Tu tienda ya está activa, no hace falta renovarla", "info");
            }

            // Tienda suspendida, permitir renovar
            setEsNueva(false);
            setVerificada(true);
            Swal.fire("✅ Verificada", "Podés continuar al pago para reactivar tu tienda", "success");
        } else {
            // Tienda nueva
            setEsNueva(true);
            setVerificada(true);
            Swal.fire("✅ Nueva tienda", "Podés continuar al pago para activarla", "success");
        }
    };

    const redirigirAMercadoPago = async () => {
        if (!email || !nombreTienda) return;

        // En este paso simulamos la creación o reactivación antes de pago real
        const fechaHoy = new Date().toISOString();
        const diasDePrueba = 30; // ✅ cambiar si querés menos días
        const fechaVencimiento = new Date(Date.now() + diasDePrueba * 24 * 60 * 60 * 1000).toISOString();

        const tiendaRef = doc(db, "tiendas", nombreTienda);

        try {
            if (esNueva) {
                await setDoc(tiendaRef, {
                    nombre: nombreTienda,
                    adminEmail: email,
                    creadoDesdeLanding: true,
                    plan: "estandar", // Por ahora solo ese
                    estado: "activa",
                    creada: fechaHoy,
                    vence: fechaVencimiento,
                });

                await sendWelcomeEmail(nombreTienda, email, diasDePrueba);
                console.log("✅ Tienda nueva creada y correo enviado");
            } else {
                await updateDoc(tiendaRef, {
                    estado: "activa",
                    vence: fechaVencimiento,
                });

                console.log("✅ Tienda reactivada");
            }

            // 🔁 Redirigir a pago (en el futuro esto lo hacés después del pago real)
            const preferenceURL = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=TU_ID_DE_PREFERENCIA`;
            window.location.href = preferenceURL;

        } catch (error) {
            console.error("❌ Error al crear/actualizar tienda", error);
            Swal.fire("Error", "Hubo un problema al crear o reactivar la tienda", "error");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
            <h2>💳 Activar o renovar mi tienda</h2>
            <p>Ingresá el nombre de tu tienda y correo. Si es nueva, la activaremos luego del pago.</p>

            <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", marginTop: "1rem", padding: "10px" }}
            />

            <input
                type="text"
                placeholder="Nombre de la tienda"
                value={nombreTienda}
                onChange={(e) => setNombreTienda(e.target.value)}
                style={{ width: "100%", marginTop: "1rem", padding: "10px" }}
            />

            <button
                onClick={verificarOCrearTienda}
                style={{ marginTop: "1rem", width: "100%", padding: "10px", backgroundColor: "#2ecc71", color: "#fff", border: "none", borderRadius: "5px" }}
            >
                Verificar / Crear tienda
            </button>

            {verificada && (
                <button
                    onClick={redirigirAMercadoPago}
                    style={{ marginTop: "1rem", width: "100%", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}
                >
                    Pagar con Mercado Pago
                </button>
            )}
        </div>
    );
}