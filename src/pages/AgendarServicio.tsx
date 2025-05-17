// src/pages/AgendarServicio.tsx
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
import Calendar from "react-calendar"; // Asegurate de instalar con: npm i react-calendar
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";

interface Producto {
  id?: string;
  nombre: string;
  precio: number; // este es el precio de reserva
  totalServicio?: number; // precio total (editable por admin)
  descripcion?: string;
}

interface Reserva {
  fecha: string; // formato YYYY-MM-DD
  hora: string; // "10:00", "11:00", etc.
}

export default function AgendarServicio() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const navigate = useNavigate();

  const horarios = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  useEffect(() => {
    const cargarDatos = async () => {
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId || !id) return;

      const prodRef = doc(db, "tiendas", tiendaId, "productos", id);
      const snap = await getDoc(prodRef);
      if (snap.exists()) setProducto({ ...(snap.data() as Producto), id });

      // Traer reservas existentes
      const reservasRef = collection(db, "tiendas", tiendaId, "reservas");
      const q = query(reservasRef, where("productoId", "==", id));
      const snapRes = await getDocs(q);
      const resData = snapRes.docs.map((d) => d.data() as Reserva);
      setReservas(resData);
    };

    cargarDatos();
  }, [id]);

  const fechaISO = fechaSeleccionada?.toISOString().split("T")[0];

  const horariosDisponibles = horarios.filter((h) => {
    return !reservas.some((r) => r.fecha === fechaISO && r.hora === h);
  });

  const confirmarReserva = async () => {
    if (!fechaISO || !horaSeleccionada || !producto) {
      Swal.fire("Error", "Seleccioná fecha y horario", "error");
      return;
    }

    // Guardar datos en localStorage para usarlos en el checkout
    localStorage.setItem(
      "reserva",
      JSON.stringify({
        productoId: producto.id,
        fecha: fechaISO,
        hora: horaSeleccionada,
        nombre: producto.nombre,
        precioReserva: producto.precio,
      })
    );

    navigate("/checkout-reserva"); // pantalla que vamos a crear luego
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

      {/* Mostrar precios */}
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
        Confirmar y pagar reserva
      </button>
    </div>
  );
}
