// src/pages/Home.tsx
import "./css/Home.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext"; // 👈 importante

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  tipo: "producto" | "servicio";
}

export default function Home() {
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const { agregarAlCarrito, carrito } = useCarrito(); // ✅ usamos carrito
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombreTienda, setNombreTienda] = useState("Mi Tienda");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [logo, setLogo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario) return;

      localStorage.setItem("userId", usuario.uid);

      const tiendaRef = doc(db, "tiendas", usuario.uid);
      const tiendaSnap = await getDoc(tiendaRef);

      if (tiendaSnap.exists()) {
        const data = tiendaSnap.data();
        setNombreTienda(data.nombre || "Mi Tienda");
        setDescripcion(data.descripcion || "");
        setImagen(data.imagen || "");
        setLogo(data.logo || "");
      }

      const productosRef = collection(db, "tiendas", usuario.uid, "productos");
      const snapshot = await getDocs(productosRef);
      const lista: Producto[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Producto),
      }));
      setProductos(lista);
    };

    cargarDatos();
  }, [usuario]);

  return (
    <div className="home-container">
      <main className="page-wrapper">

        <section className="hero">
          {imagen && imagen.trim() !== "" && <img src={imagen} alt="Imagen principal" />}
          <h2>{nombreTienda}</h2>
          <p>{descripcion}</p>
        </section>

        <section className="productos">
          <h3>Lo que ofrecemos</h3>
          <div className="product-list">
          {productos.map((item) => {
  const sinStock = item.stock === 0;

  return (
    <div
      className="product-card"
      key={item.id}
      onClick={() => !sinStock && navigate(`/producto/${item.id}`)}
      style={{
        cursor: sinStock ? "not-allowed" : "pointer",
        opacity: sinStock ? 0.5 : 1,
        pointerEvents: sinStock ? "none" : "auto",
      }}
    >
      <img src={item.imagen} alt={item.nombre} />
      <h4>{item.nombre}</h4>
      <p>
        {item.tipo === "producto"
          ? sinStock
            ? "Sin stock"
            : `$${item.precio}`
          : "Consultá por WhatsApp"}
      </p>
      {item.envioGratis && (
        <p style={{ color: "green", fontWeight: "bold" }}>¡Envío gratis!</p>
      )}
      {item.descripcionCorta && (
        <p style={{ fontSize: "0.85rem", color: "#666" }}>{item.descripcionCorta}</p>
      )}
      <button
        disabled={sinStock}
        onClick={(e) => {
          e.stopPropagation();
          agregarAlCarrito(item);
        }}
      >
        {item.tipo === "producto"
          ? sinStock
            ? "Sin stock"
            : "Agregar al carrito"
          : "Contactar"}
      </button>
    </div>
  );
})}
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 - Ecommerce Web</p>
      </footer>
    </div>
  );
}
