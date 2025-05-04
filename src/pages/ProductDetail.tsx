import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useCarrito } from "../context/CarritoContext";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  imagenes?: string[];
  descripcion?: string;
  cuotas?: string;
  envioGratis?: boolean;
  color?: string;
  stock: number;
  tipo: "producto" | "servicio";
}

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [imagenPrincipal, setImagenPrincipal] = useState("");
  const { agregarAlCarrito, toggleCarrito } = useCarrito();

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) return;

      const dominioActual = window.location.hostname;
      const dominioBuscar = dominioActual.includes("localhost")
        ? "cliente1.mitiendapersonalizada.com"
        : dominioActual;

      const tiendasQuery = query(collection(db, "tiendas"), where("dominio", "==", dominioBuscar));
      const tiendasSnap = await getDocs(tiendasQuery);

      if (!tiendasSnap.empty) {
        const tiendaDoc = tiendasSnap.docs[0];
        const tiendaId = tiendaDoc.id;

        const productoRef = doc(db, "tiendas", tiendaId, "productos", id);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
          const data = productoSnap.data() as Producto;
          setProducto({ ...data, id });
          setImagenPrincipal(data.imagen);
        } else {
          console.error("Producto no encontrado");
        }
      } else {
        console.error("No se encontró la tienda para este dominio.");
      }
    };

    cargarProducto();
  }, [id]);

  if (!producto) {
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando producto...</p>;
  }

  return (
    <div style={{ display: "flex", padding: "2rem", gap: "2rem", flexWrap: "wrap" }}>
      {/* Imágenes del producto */}
      <div style={{ flex: "1", minWidth: "300px" }}>
        <img
          src={imagenPrincipal}
          alt="Producto"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "1rem" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {producto.imagenes?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Miniatura ${index}`}
              onClick={() => setImagenPrincipal(img)}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                cursor: "pointer",
                border: img === imagenPrincipal ? "2px solid #000" : "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Info del producto */}
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h2>{producto.nombre}</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>${producto.precio}</p>

        {producto.cuotas && (
          <p style={{ color: "#333", margin: "0.5rem 0" }}>Cuotas: {producto.cuotas}</p>
        )}

        {producto.envioGratis && (
          <p style={{ color: "green", fontWeight: "bold", margin: "0.5rem 0" }}>
            ¡Envío gratis!
          </p>
        )}

        {producto.color && (
          <p style={{ margin: "0.5rem 0" }}>Color: {producto.color}</p>
        )}

        <p style={{ margin: "0.5rem 0" }}>Stock disponible: {producto.stock}</p>

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button
            style={{
              backgroundColor: "#3483fa",
              color: "white",
              border: "none",
              padding: "0.8rem 1.5rem",
              fontSize: "1rem",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => {
              agregarAlCarrito(producto);
              toggleCarrito();
            }}
          >
            Agregar al carrito
          </button>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <p>{producto.descripcion}</p>
        </div>
      </div>
    </div>
  );
}
