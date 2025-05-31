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
import { useAuth } from "../context/AuthContext";

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

  const { cliente } = useCliente();
  const navigate = useNavigate();

  const [storeInfo, setStoreInfo] = useState<any>({});
  const { usuario } = useAuth();

  const [googleMaps, setGoogleMaps] = useState("");
  const [textoUbicacion, setTextoUbicacion] = useState("");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");

  const [categoriaFiltrada, setCategoriaFiltrada] = useState<string | null>(null);
  const [mostrarMasCategorias, setMostrarMasCategorias] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tiendaId = localStorage.getItem("userId") || "d5gnEacrofgn8NxTOdRgwzZRow73";
      localStorage.setItem("userId", tiendaId);

      const ref = doc(db, "tiendas", tiendaId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setStoreInfo(data);
        setNombre(data.nombre || "Mi tienda");
        setImagen(data.imagen || "");
        setWhatsapp(data.whatsapp || "");
        setAlturaBanner(data.alturaBanner || "100px");
        setPosicionBanner(data.posicionBanner || "center");
        setTamañoBanner(data.tamañoBanner || "cover");
        setGoogleMaps(data.googleMaps || "");
        setTextoUbicacion(data.textoUbicacion || "");
        setCat1(data.categoriaDestacada1 || "");
        setCat2(data.categoriaDestacada2 || "");
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

  const categoriasExtras = Array.from(new Set(productos.map((p) => p.categoria)))
    .filter((cat) => cat !== cat1 && cat !== cat2);

  return (
    <div className="home-container">
      <div style={{ position: "sticky", top: 0, zIndex: 999, backgroundColor: "#fff" }}>
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
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "6px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "10px 12px",
              height: "60px",
              position: "absolute",
              bottom: "16px",
              left: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              gap: "10px",
            }}
          >
            <img
              src={storeInfo.logo || "https://via.placeholder.com/40"}
              alt="Logo"
              style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "contain" }}
            />
            <span style={{ fontWeight: 600 }}>{nombre}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
              alt="verificado"
              style={{ width: "18px", height: "18px", marginLeft: "4px" }}
            />
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            borderBottom: "1px solid #eee",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ cursor: "pointer", color: "#333" }} onClick={() => setCategoriaFiltrada(null)}>Inicio</span>
            <span style={{ cursor: "pointer", color: "#333" }} onClick={() => setCategoriaFiltrada(cat1)}>{cat1}</span>
            <span style={{ cursor: "pointer", color: "#333" }} onClick={() => setCategoriaFiltrada(cat2)}>{cat2}</span>
            <div style={{ position: "relative" }}>
              <span onClick={() => setMostrarMasCategorias(!mostrarMasCategorias)} style={{ cursor: "pointer", color: "#333" }}>
                Más categorías ▼
              </span>
              {mostrarMasCategorias && (
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "#fff",
                    top: "25px",
                    left: 0,
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    zIndex: 999,
                  }}
                >
                  {categoriasExtras.map((cat) => (
                    <div
                      key={cat}
                      style={{ cursor: "pointer", padding: "4px 0" }}
                      onClick={() => {
                        setCategoriaFiltrada(cat);
                        setMostrarMasCategorias(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" alt="fb" style={{ width: "20px" }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="ig" style={{ width: "20px" }} />
            </a>
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert("Enlace copiado al portapapeles");
                }
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" alt="Compartir" style={{ width: "20px" }} />
            </button>
          </div>
        </div>
      </div>

      <BarraBusqueda />
      <CategoriasDestacadas />

      
      <div className="productos">
        <h2>Productos por categoría</h2>
        {Object.entries(
          productos.reduce((acc: { [cat: string]: Producto[] }, prod) => {
            const cat = prod.categoria || "Sin categoría";
            acc[cat] = acc[cat] || [];
            acc[cat].push(prod);
            return acc;
          }, {})
        )
          .filter(([cat]) => !categoriaFiltrada || cat === categoriaFiltrada)
          .map(([categoria, productosCat], i) => (
            <CarruselPorCategoria
              key={categoria}
              categoria={categoria}
              productos={productosCat}
              carruselId={`carrusel-${i}`}
            />
          ))}
      </div>

      <UbicacionTienda googleMaps={googleMaps} textoUbicacion={textoUbicacion} />

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
