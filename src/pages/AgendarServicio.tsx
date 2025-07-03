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
  const [numeroWhatsapp, setNumeroWhatsapp] = useState("");

  useEffect(() => {
    if (!slug || !id) return;

    const cargarDatos = async () => {
      try {
        // Producto
        const prodRef = doc(db, "tiendas", slug, "productos", id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          setProducto({ ...(prodSnap.data() as Producto), id });
        }

        // Tienda (para WhatsApp reservas)
        const tiendaRef = doc(db, "tiendas", slug);
        const tiendaSnap = await getDoc(tiendaRef);
        if (tiendaSnap.exists()) {
          const data = tiendaSnap.data();
          setNumeroWhatsapp(data.whatsappReservas || data.whatsapp || "");
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

  const mensaje = `Hola, quiero reservar un turno para el servicio: ${producto.nombre}`;
  const urlWhatsapp = `https://wa.me/${numeroWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;

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

        <a
          href={urlWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "2rem",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#25D366",
            color: "#fff",
            fontSize: "1.1rem",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          📲 Reservar por WhatsApp
        </a>
        <button
          onClick={() => navigate(`/tienda/${slug}`)}
          style={{
            display: "inline-block",
            marginTop: "1rem",
            marginLeft: "1rem",
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
