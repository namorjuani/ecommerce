import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import CarruselPorCategoria from "../Components/CarruselPorCategoria";
import CategoriasDestacadas from "../Components/CategoriasDestacadas";
import UbicacionTienda from "../Components/UbicacionTienda";
import Header from "../Components/Header";
import { useAuth } from "../context/AuthContext";
import { useCliente } from "../context/ClienteContext";
import "./css/Home.css";
import { useParams } from "react-router-dom";

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
  const [alturaBanner, setAlturaBanner] = useState("100px");
  const [posicionBanner, setPosicionBanner] = useState("center");
  const [tamañoBanner, setTamañoBanner] = useState("cover");
  const [linkInstagram, setLinkInstagram] = useState("");
  const [linkFacebook, setLinkFacebook] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [textoUbicacion, setTextoUbicacion] = useState("");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [categoriaFiltrada, setCategoriaFiltrada] = useState<string | null>(null);
  const [tienda, setTienda] = useState<any>(null);
  const { slug } = useParams();

  useEffect(() => {
    const cargarTienda = async () => {
      if (!slug) return;

      // Guardamos el slug como userId para otras partes de la app que usan localStorage
      localStorage.setItem("userId", slug);

      const docRef = doc(db, "tiendas", slug);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTienda(data);
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
        setLinkInstagram(data.linkInstagram || "");
        setLinkFacebook(data.linkFacebook || "");
      }

      const productosRef = collection(db, "tiendas", slug, "productos");
      const q = query(productosRef);
      const querySnapshot = await getDocs(q);
      const productosData: Producto[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
      }));

      const catGuardada = localStorage.getItem("categoriaSeleccionada");
      if (catGuardada) {
        setCategoriaFiltrada(catGuardada);
        localStorage.removeItem("categoriaSeleccionada");
      }

      setProductos(productosData);
    };

    cargarTienda();
  }, [slug]);

  const categoriasExtras = Array.from(new Set(productos.map((p) => p.categoria)))
    .filter((cat) => cat !== cat1 && cat !== cat2);

  return (
    <>
      <Header
        logo={imagen}
        nombre={nombre}
        imagenBanner={imagen}
        alturaBanner={alturaBanner}
        posicionBanner={posicionBanner}
        tamañoBanner={tamañoBanner}
        categoria1={cat1}
        categoria2={cat2}
        categoriasExtras={categoriasExtras}
        setCategoriaFiltrada={setCategoriaFiltrada}
        linkInstagram={linkInstagram}
        linkFacebook={linkFacebook}
      />

      <div
        className="home-container"
        style={{
          backgroundColor: tienda?.colorFondo || "#ffffff",
          fontFamily: tienda?.estilosTexto?.fuenteGeneral || "inherit",
        }}
      >
        <CategoriasDestacadas />

        <div className="productos">
          <h2 style={{ fontSize: tienda?.estilosTexto?.tamañoH2 || "24px" }}>
            Productos por categoría
          </h2>
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
                slug={slug!}
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
      </div>
    </>
  );
}
