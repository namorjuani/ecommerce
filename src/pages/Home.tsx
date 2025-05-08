import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useCliente } from "../context/ClienteContext";
import "./css/Home.css";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number; // ✅ agregá esto
}


export default function Home() {
  const [nombre, setNombre] = useState("Mi tienda");
  const [imagen, setImagen] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const { cliente, iniciarSesion, cerrarSesion } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) return;

      const ref = doc(db, "tiendas", tiendaId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNombre(data.nombre || "Mi tienda");
        setImagen(data.imagen || "");
        setWhatsapp(data.whatsapp || "");
      }

      const productosRef = collection(db, "tiendas", tiendaId, "productos");
      const q = query(productosRef);
      const querySnapshot = await getDocs(q);
      const productosData: Producto[] = querySnapshot.docs.map((doc) => ({

        ...(doc.data() as Producto),
        id: doc.id,
      }));
      setProductos(productosData);
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <div style={{ fontWeight: "bold" }}>{nombre}</div>
        <div>
          {cliente ? (
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setMostrarMenu(!mostrarMenu)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {cliente.photoURL ? (
                  <img
                    src={cliente.photoURL}
                    alt="Perfil"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <span>
                    {cliente.displayName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>

              {mostrarMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    zIndex: 999,
                  }}
                >
                  <button
                    style={{
                      display: "block",
                      padding: "0.7rem 1rem",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/historial")}
                  >
                    🧾 Historial de compras
                  </button>
                  <button
                    style={{
                      display: "block",
                      padding: "0.7rem 1rem",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/datos-envio")}
                  >
                    📦 Datos de envío
                  </button>
                  <button
                    style={{
                      display: "block",
                      padding: "0.7rem 1rem",
                      width: "100%",
                      textAlign: "left",
                      borderTop: "1px solid #eee",
                      background: "none",
                      cursor: "pointer",
                    }}
                    onClick={cerrarSesion}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={iniciarSesion} style={{ padding: "0.4rem 0.8rem" }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="hero">
        {imagen && (
          <img
            src={imagen}
            alt="Imagen principal"
            onError={(e) => (e.currentTarget.src = "/imagen-default.jpg")}
          />
        )}
      </div>

      {/* Productos */}
      <div className="productos">
        <h2>Productos</h2>
        <div className="product-list">
          {productos.length === 0 ? (
            <p>No hay productos cargados</p>
          ) : (
            productos.map((producto) => (
              <Link
                to={`/producto/${producto.id}`}
                key={producto.id}
                className="product-card"
                style={{
                  opacity: producto.stock === 0 ? 0.5 : 1,
                  pointerEvents: producto.stock === 0 ? "none" : "auto",
                }}
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={(e) => (e.currentTarget.src = "/imagen-default.jpg")}
                />
                <h3>{producto.nombre}</h3>
                <p>${producto.precio}</p>
                {producto.stock === 0 && (
                  <p style={{ color: "red", fontWeight: "bold" }}>Sin stock</p>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-flotante"
        >
          💬
        </a>
      )}
    </div>
  );
}
