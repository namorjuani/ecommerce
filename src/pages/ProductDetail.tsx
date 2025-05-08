import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useCarrito } from "../context/CarritoContext";
import "./css/ProductDetail.css";


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
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) return;

      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) return;

      const productoRef = doc(db, "tiendas", tiendaId, "productos", id);
      const productoSnap = await getDoc(productoRef);

      if (productoSnap.exists()) {
        const data = productoSnap.data() as Producto;
        setProducto({ ...data, id });
        setImagenPrincipal(data.imagen);
      }
    };

    cargarProducto();
  }, [id]);

  if (!producto) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando producto...</p>;

  return (
    <div style={{ display: "flex", padding: "2rem", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ flex: "1", minWidth: "300px" }}>
        <img
          src={imagenPrincipal}
          alt="Producto"
          onError={() => setImagenPrincipal("/imagen-default.jpg")}
          style={{ width: "100%", borderRadius: "10px", marginBottom: "1rem" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {producto.imagenes?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Miniatura ${index}`}
              onClick={() => setImagenPrincipal(img)}
              onError={(e) => (e.currentTarget.style.display = "none")}
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

      <div style={{ flex: "1", minWidth: "300px" }}>
        <h2>{producto.nombre}</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>${producto.precio}</p>
        {producto.cuotas && <p>Cuotas: {producto.cuotas}</p>}
        {producto.envioGratis && <p style={{ color: "green" }}>¡Envío gratis!</p>}
        {producto.color && <p>Color: {producto.color}</p>}
        <p>Stock disponible: {producto.stock}</p>

        <button
          onClick={() => agregarAlCarrito(producto)}
          style={{
            backgroundColor: "#3483fa",
            color: "white",
            border: "none",
            padding: "0.8rem 1.5rem",
            fontSize: "1rem",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Agregar al carrito
        </button>

        <p style={{ marginTop: "2rem" }}>{producto.descripcion}</p>
      </div>
    </div>
  );
}
