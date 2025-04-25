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
  const [textoHero, setTextoHero] = useState("¡Bienvenido a nuestra tienda!");
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [colorBoton, setColorBoton] = useState("#000000");
  const [whatsapp, setWhatsapp] = useState("");

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

      const configRef = doc(db, "tiendas", usuario.uid, "configuracion", "estilos");
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setColorFondo(data.colorFondo || "#ffffff");
        setColorBoton(data.colorBoton || "#000000");
        setTextoHero(data.textoHero || "¡Bienvenido a nuestra tienda!");
        setWhatsapp(data.whatsapp || "");
      }
    };

    cargarDatos();
  }, [usuario]);

  return (
    <div className="home-container" style={{ backgroundColor: colorFondo }}>
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
          <h2>{textoHero}</h2>
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
                <button
                  style={{ backgroundColor: colorBoton, color: "white" }}
                  disabled={item.stock === 0 && item.tipo === "producto"}
                >
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

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#25D366",
            color: "white",
            padding: "12px 16px",
            borderRadius: "50%",
            fontSize: "20px",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          💬
        </a>
      )}
    </div>
  );
}
