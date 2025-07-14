import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../Components/Header";
import { useTienda } from "../context/TiendaContext";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  totalServicio?: number;
  descripcion?: string;
}

export default function AgendarServicio() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const tienda = useTienda();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [numeroWhatsapp, setNumeroWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !id) return;

    const cargarDatos = async () => {
      try {
        const prodRef = doc(db, "tiendas", slug, "productos", id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          setProducto({ ...(prodSnap.data() as Producto), id });
        }

        const tiendaRef = doc(db, "tiendas", slug);
        const tiendaSnap = await getDoc(tiendaRef);
        if (tiendaSnap.exists()) {
          const data = tiendaSnap.data();
          const wpp = data.whatsappReservas || data.whatsapp || null;
          setNumeroWhatsapp(wpp);
          
          if (wpp && prodSnap.exists()) {
            const mensaje = `Hola, quiero reservar un turno para el servicio: ${prodSnap.data().nombre}`;
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

  if (!producto || !tienda) {
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
        <h2>{producto.nombre}</h2>
        {producto.descripcion && <p>{producto.descripcion}</p>}

        <p style={{ marginTop: "1rem" }}>
          <strong>Precio de reserva:</strong> ${producto.precio}
        </p>
        {producto.totalServicio && (
          <p style={{ color: "#555" }}>
            Precio total del servicio: ${producto.totalServicio}
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
