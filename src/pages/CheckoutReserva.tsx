// src/pages/CheckoutReserva.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom"; // ✅ usamos slug
interface ReservaInfo {
  productoId: string;
  nombre: string;
  fecha: string;
  hora: string;
  precioReserva: number;
}

export default function CheckoutReserva() {
  const [reserva, setReserva] = useState<ReservaInfo | null>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [guardado, setGuardado] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams(); // ✅ tomamos el slug desde la URL

  useEffect(() => {
    // ⚡ Cargar datos de reserva y cliente del localStorage
    const reservaData = localStorage.getItem("reserva");
    const clienteData = localStorage.getItem("cliente");
    if (reservaData && clienteData) {
      setReserva(JSON.parse(reservaData));
      setCliente(JSON.parse(clienteData));
    } else {
      Swal.fire("Error", "Faltan datos para continuar", "error");
      if (slug) {
        navigate(`/tienda/${slug}`);
      } else {
        navigate("/");
      }
    }
  }, [slug, navigate]);

  const confirmarYGuardar = async () => {
    if (!reserva || !cliente || guardado) return;
    setGuardado(true);

    // ✅ usamos el slug como tiendaId
    const tiendaId = slug;
    if (!tiendaId) {
      Swal.fire("Error", "Tienda no identificada", "error");
      setGuardado(false);
      return;
    }

    // ⚡ WhatsApp de notificación (puede venir de localStorage o fallback)
    const whatsappAdmin = localStorage.getItem("whatsappNotificacion") || "5491112345678";

    try {
      // ⚡ Guardar la reserva en Firebase
      await addDoc(collection(db, "tiendas", tiendaId, "reservas"), {
        productoId: reserva.productoId,
        productoNombre: reserva.nombre,
        fecha: reserva.fecha,
        hora: reserva.hora,
        precioReserva: reserva.precioReserva,
        clienteNombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        estado: "pendiente",
        creado: new Date(),
      });

      // ⚡ Notificar por WhatsApp
      const mensaje = `✅ Nueva reserva de ${cliente.nombre} para ${reserva.nombre} el ${reserva.fecha} a las ${reserva.hora}`;
      const link = `https://wa.me/${whatsappAdmin.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
      window.open(link, "_blank");

      console.log("✅ Reserva guardada correctamente en Firebase");

      localStorage.removeItem("reserva");

      Swal.fire("¡Reserva enviada!", "Tu solicitud fue enviada al negocio. Pronto será confirmada.", "success");

      navigate(`/tienda/${tiendaId}`); // ✅ Redirigimos respetando el slug
    } catch (error) {
      console.error("❌ Error al guardar reserva:", error);
      Swal.fire("Error", "No se pudo guardar la reserva. Intentalo más tarde.", "error");
      setGuardado(false);
    }
  };

  if (!reserva || !cliente) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h2>✅ Confirmar reserva</h2>
      <p><strong>Servicio:</strong> {reserva.nombre}</p>
      <p><strong>Fecha:</strong> {reserva.fecha}</p>
      <p><strong>Hora:</strong> {reserva.hora}</p>
      <p><strong>Precio a pagar ahora:</strong> ${reserva.precioReserva}</p>

      <button
        onClick={confirmarYGuardar}
        style={{
          marginTop: "1.5rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#00c853",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Confirmar y enviar reserva
      </button>
    </div>
  );
}
