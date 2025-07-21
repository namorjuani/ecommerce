import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../Components/Header";
import { useTienda } from "../context/TiendaContext";

interface Servicio {
  id?: string;
  nombre: string;
  precioReserva?: number;
  precioTotal?: number;
  descripcion?: string;
}

export default function AgendarServicio() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const tienda = useTienda();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [numeroWhatsapp, setNumeroWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !id) return;

    const cargarDatos = async () => {
      try {
        const servicioRef = doc(db, "tiendas", slug, "servicios", id);
        const servicioSnap = await getDoc(servicioRef);

        if (servicioSnap.exists()) {
          setServicio({ ...(servicioSnap.data() as Servicio), id });
        }

        const tiendaRef = doc(db, "tiendas", slug);
        const tiendaSnap = await getDoc(tiendaRef);
        if (tiendaSnap.exists()) {
          const data = tiendaSnap.data();
          const wpp = data.whatsappReservas || data.whatsapp || null;
          setNumeroWhatsapp(wpp);

          if (wpp && servicioSnap.exists()) {
            const mensaje = `Hola, quiero reservar un turno para el servicio: ${servicioSnap.data().nombre}`;
            const url = `https://wa.me/${wpp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, "_blank");
          }
        }
      } catch (err) {
        console.error("Error cargando datos del servicio:", err);
      }
    };

    cargarDatos();
  }, [slug, id]);

  if (!servicio || !tienda) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando servicio...</p>;
  }

  return (
    <>
      <Header
        logo={tienda.logo}
        nombre={tienda.nombre}
        imagenBanner={tienda.imagen}
        alturaBanner={tienda.alturaBanner || "100px"}
        posicionBanner={tienda.posicionBanner || "center"}
        tamañoBanner={tienda.tamañoBanner || "cover"}
        categoria1={tienda.categoriaDestacada1}
        categoria2={tienda.categoriaDestacada2}
        categoriasExtras={[]}
        setCategoriaFiltrada={() => {}}
        linkInstagram={tienda.linkInstagram}
        linkFacebook={tienda.linkFacebook}
      />

      <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
        <h2>{servicio.nombre}</h2>
        {servicio.descripcion && <p>{servicio.descripcion}</p>}

        <p style={{ marginTop: "1rem" }}>
          <strong>Precio de reserva:</strong> ${servicio.precioReserva || 0}
        </p>
        {servicio.precioTotal && (
          <p style={{ color: "#555" }}>
            Precio total del servicio: ${servicio.precioTotal}
          </p>
        )}

        {numeroWhatsapp ? (
          <p style={{ marginTop: "1rem", color: "#28a745", fontWeight: "bold" }}>
            Redirigiendo a WhatsApp...
          </p>
        ) : (
          <p style={{ marginTop: "1rem", color: "red", fontWeight: "bold" }}>
            ⚠️ No se configuró un número de WhatsApp para reservas. Contactá al administrador.
          </p>
        )}

        <button
          onClick={() => navigate(`/tienda/${slug}`)}
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#3483fa",
            color: "#fff",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Volver a la tienda
        </button>
      </div>
    </>
  );
}
