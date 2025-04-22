import "./css/Home.css";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombreTienda, setNombreTienda] = useState("Mi Tienda");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario) return;

      const tiendaRef = doc(db, "tiendas", usuario.uid);
      const tiendaSnap = await getDoc(tiendaRef);

      if (tiendaSnap.exists()) {
        const data = tiendaSnap.data();
        setNombreTienda(data.nombre || "Mi Tienda");
        setDescripcion(data.descripcion || "");
        setImagen(data.imagen || "");
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
        <header className="navbar">
          <h1>{nombreTienda}</h1>

          {usuario ? (
            <div style={{ display: "flex", gap: "1rem" }}>
              {esAdmin && <Link to="/admin" className="login-btn">Modo Admin</Link>}
              <button onClick={cerrarSesion} className="login-btn">Cerrar sesión</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Ingresar</Link>
          )}
        </header>

        <section className="hero">
          {imagen && <img src={imagen} alt="Imagen principal" />}
          <h2>{nombreTienda}</h2>
          <p>{descripcion}</p>
        </section>

        <section className="productos">
          <h3>Lo que ofrecemos</h3>
          <div className="product-list">
            {productos.map((item) => (
              <div className="product-card" key={item.id}>
                <img src={item.imagen} alt={item.nombre} />
                <h4>{item.nombre}</h4>
                <p>
                  {item.tipo === "producto"
                    ? item.stock > 0
                      ? `$${item.precio}`
                      : "Sin stock"
                    : "Consultá por WhatsApp"}
                </p>
                <button disabled={item.stock === 0}>
                  {item.tipo === "producto"
                    ? item.stock > 0
                      ? "Agregar al carrito"
                      : "Sin stock"
                    : "Contactar"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 - Ecommerce Web</p>
      </footer>
    </div>
  );
}
