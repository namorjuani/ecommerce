import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useCliente } from "../context/ClienteContext";
import "./css/Home.css";
import CarruselPorCategoria from "../Components/CarruselPorCategoria";
import CategoriasDestacadas from "../Components/CategoriasDestacadas";
import BarraBusqueda from "../Components/BarraBusqueda";
import UbicacionTienda from "../Components/UbicacionTienda";
import Footer from "../Components/Footer";
import { useAuth } from "../context/AuthContext"; // solo si lo estás usando ya

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock?: number;
  categoria: string;
  tipo: "producto" | "servicio";
  precioReserva?: number;
  precioTotal?: number;
}


export default function Home() {
  const [nombre, setNombre] = useState("Mi tienda");
  const [imagen, setImagen] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const [alturaBanner, setAlturaBanner] = useState("100px");
  const [posicionBanner, setPosicionBanner] = useState("center");
  const [tamañoBanner, setTamañoBanner] = useState("cover");

  const { cliente, iniciarSesion, cerrarSesion } = useCliente();
  const navigate = useNavigate();

  const [storeInfo, setStoreInfo] = useState<any>({});
const { usuario } = useAuth(); // si ya lo usás en otras páginas, podés omitirlo

const [googleMaps, setGoogleMaps] = useState("");
const [textoUbicacion, setTextoUbicacion] = useState("");



  useEffect(() => {
    const fetchData = async () => {
      const tiendaId = localStorage.getItem("userId") || "d5gnEacrofgn8NxTOdRgwzZRow73";
      localStorage.setItem("userId", tiendaId);

      const ref = doc(db, "tiendas", tiendaId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
  const data = snap.data();
  setStoreInfo(data); // 👈 Acá guardás todo junto
  setNombre(data.nombre || "Mi tienda");
  setImagen(data.imagen || "");
  setWhatsapp(data.whatsapp || "");
  setAlturaBanner(data.alturaBanner || "100px");
  setPosicionBanner(data.posicionBanner || "center");
  setTamañoBanner(data.tamañoBanner || "cover");
  setGoogleMaps(data.googleMaps || "");
setTextoUbicacion(data.textoUbicacion || "");
}


      const productosRef = collection(db, "tiendas", tiendaId, "productos");
      const q = query(productosRef);
      const querySnapshot = await getDocs(q);

      const productosData: Producto[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
      }));

      console.log("✅ Productos en Firestore:", querySnapshot.docs.map((d) => d.data()));
      console.log("✅ Productos mapeados:", productosData);
      setProductos(productosData);
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
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
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
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
                  <button onClick={() => navigate("/historial")}>🧾 Historial de compras</button>
                  <button onClick={() => navigate("/datos-envio")}>📦 Datos de envío</button>
                  <button onClick={cerrarSesion}>🚪 Cerrar sesión</button>
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

      {/* Banner */}
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

        <BarraBusqueda />
      {/* 🔹 Acá van las categorías destacadas */}
      <CategoriasDestacadas />
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
      <UbicacionTienda
  googleMaps={googleMaps}
  textoUbicacion={textoUbicacion}
/>



      {/* WhatsApp */}
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
      
      <Footer />
    </div>
  );
}