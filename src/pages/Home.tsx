import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useCliente } from "../context/ClienteContext";
import "./css/Home.css";
import CarruselPorCategoria from "../Components/CarruselPorCategoria";


interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock?: number;
  categoria: string;
}

export default function Home() {
  const [nombre, setNombre] = useState("Mi tienda");
  const [imagen, setImagen] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // 🎨 Configuración del banner
  const [alturaBanner, setAlturaBanner] = useState("100px");
  const [posicionBanner, setPosicionBanner] = useState("center");
  const [tamañoBanner, setTamañoBanner] = useState("cover");

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
        setAlturaBanner(data.alturaBanner || "100px");
        setPosicionBanner(data.posicionBanner || "center");
        setTamañoBanner(data.tamañoBanner || "cover");
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

      {/* Hero/banner como fondo */}
      <div
        style={{
          backgroundImage: `url(${imagen})`,
          backgroundPosition: posicionBanner,
          backgroundRepeat: "no-repeat",
          backgroundSize: tamañoBanner,
          borderBottom: "1px solid rgba(0, 0, 0, .1)",
          height: alturaBanner,
          position: "relative",
        }}
      />

      {/* Productos */}
      <div className="productos">
        <h2>Productos por categoría</h2>
        {Object.entries(
          productos.reduce((acc: { [cat: string]: Producto[] }, prod) => {
            const cat = prod.categoria || "Sin categoría";
            acc[cat] = acc[cat] || [];
            acc[cat].push(prod);
            return acc;
          }, {})
        ).map(([categoria, productosCat], i) => (
          <CarruselPorCategoria
            key={categoria}
            categoria={categoria}
            productos={productosCat}
            carruselId={`carrusel-${i}`}
          />
        ))}
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
