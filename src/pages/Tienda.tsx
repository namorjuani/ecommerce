import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import CarruselPorCategoria from "../Components/CarruselPorCategoria";
import CategoriasDestacadas from "../Components/CategoriasDestacadas";
import UbicacionTienda from "../Components/UbicacionTienda";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import "./css/Home.css";

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

export default function Tienda() {
  const { slug } = useParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tienda, setTienda] = useState<any>(null);
  const [categoriaFiltrada, setCategoriaFiltrada] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const cargarTienda = async () => {
      const ref = doc(db, "tiendas", slug);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTienda(snap.data());
      }
    };

    const cargarProductos = async () => {
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
    cargarProductos();
  }, [slug]);

  const categoriasExtras = Array.from(new Set(productos.map((p) => p.categoria)))
    .filter((cat) => cat !== tienda?.categoriaDestacada1 && cat !== tienda?.categoriaDestacada2);

  return (
    <>
      <Header
        logo={tienda?.logo || ""}
        nombre={tienda?.nombre || "Mi tienda"}
        imagenBanner={tienda?.imagen || ""}
        alturaBanner={tienda?.alturaBanner || "100px"}
        posicionBanner={tienda?.posicionBanner || "center"}
        tamañoBanner={tienda?.tamañoBanner || "cover"}
        categoria1={tienda?.categoriaDestacada1 || ""}
        categoria2={tienda?.categoriaDestacada2 || ""}
        categoriasExtras={categoriasExtras}
        setCategoriaFiltrada={setCategoriaFiltrada}
        linkInstagram={tienda?.linkInstagram || ""}
        linkFacebook={tienda?.linkFacebook || ""}
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

        <UbicacionTienda
          googleMaps={tienda?.googleMaps || ""}
          textoUbicacion={tienda?.textoUbicacion || ""}
        />

        {tienda?.whatsapp && (
          <a
            href={`https://wa.me/${tienda.whatsapp.replace(/\D/g, "")}`}
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
