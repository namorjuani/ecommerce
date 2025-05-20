import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  totalServicio?: number;
  descripcion?: string;
}

interface Reserva {
  fecha: string;
  hora: string;
}

export default function AgendarServicio() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const navigate = useNavigate();

  const horarios = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  const fechaISO = fechaSeleccionada?.toISOString().split("T")[0];

  useEffect(() => {
    const cargarDatos = async () => {
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId || !id) return;

      const prodRef = doc(db, "tiendas", tiendaId, "productos", id);
      const snap = await getDoc(prodRef);
      if (snap.exists()) setProducto({ ...(snap.data() as Producto), id });

      const reservasRef = collection(db, "tiendas", tiendaId, "reservas");
      const q = query(reservasRef, where("productoId", "==", id));
      const snapRes = await getDocs(q);
      const resData = snapRes.docs.map((d) => d.data() as Reserva);
      setReservas(resData);
    };

    cargarDatos();
  }, [id]);

  const horariosDisponibles = horarios.filter((h) => {
    return !reservas.some((r) => r.fecha === fechaISO && r.hora === h);
  });

  const confirmarReserva = async () => {
    if (!fechaISO || !horaSeleccionada || !producto) {
      Swal.fire("Error", "Seleccioná fecha y horario", "error");
      return;
    }

    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) {
      Swal.fire("Error", "Tienda no encontrada", "error");
      return;
    }

    const nuevaReserva = {
      productoId: producto.id,
      productoNombre: producto.nombre,
      fecha: fechaISO,
      hora: horaSeleccionada,
      estado: "pendiente",
      creada: Timestamp.now(),
    };

    if (producto.precio === 0) {
      try {
        await addDoc(collection(db, "tiendas", tiendaId, "reservas"), nuevaReserva);
        Swal.fire("¡Listo!", "Tu reserva fue confirmada", "success");
        navigate("/checkout-reserva");
      } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        Swal.fire("Error", "No se pudo guardar la reserva", "error");
      }
      return; // ✅ Detenemos aquí si el precio es 0
    }

    // Si el precio es mayor a 0, seguimos con MercadoPago
    localStorage.setItem("reserva", JSON.stringify(nuevaReserva));

    try {
      const res = await fetch("https://us-central1-tu-app.cloudfunctions.net/crearPreferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos: [{ nombre: producto.nombre, precio: producto.precio }],
          tiendaId,
        }),
      });

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        Swal.fire("Error", "No se pudo generar el link de pago", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire("Error", "Falló la conexión con Mercado Pago", "error");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <h2>📅 Agendar turno para: {producto?.nombre}</h2>
      <p>Seleccioná el día y horario que te convenga</p>

      <Calendar
        onChange={(date) => setFechaSeleccionada(date as Date)}
        value={fechaSeleccionada}
      />

      {fechaSeleccionada && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Horarios disponibles para el {fechaISO}</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {horariosDisponibles.length > 0 ? (
              horariosDisponibles.map((hora) => (
                <button
                  key={hora}
                  onClick={() => setHoraSeleccionada(hora)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    backgroundColor: hora === horaSeleccionada ? "#00c853" : "#eee",
                    color: hora === horaSeleccionada ? "#fff" : "#000",
                    cursor: "pointer",
                    border: "1px solid #ccc",
                  }}
                >
                  {hora}
                </button>
              ))
            ) : (
              <p>No hay horarios disponibles para este día</p>
            )}
          </div>
        </div>
      )}

      {producto && (
        <div style={{ marginTop: "2rem" }}>
          <p><strong>Precio de reserva:</strong> ${producto.precio}</p>
          {producto.totalServicio && (
            <p style={{ color: "#555", fontSize: "0.9rem" }}>
              Precio total del servicio: ${producto.totalServicio}
            </p>
          )}
        </div>
      )}

      <button
        onClick={confirmarReserva}
        style={{
          marginTop: "1.5rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#3483fa",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {producto?.precio === 0 ? "Confirmar reserva" : "Confirmar y pagar reserva"}
      </button>
    </div>
  );
}
