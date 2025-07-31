import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import CarruselPorCategoria from "../Components/CarruselPorCategoria";
import CategoriasDestacadas from "../Components/CategoriasDestacadas";
import UbicacionTienda from "../Components/UbicacionTienda";
import Header from "../Components/Header"; // 👉 AGREGADO
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
  const [servicios, setServicios] = useState<Producto[]>([]);
  const [tienda, setTienda] = useState<any>(null);
  const [categoriaFiltrada, setCategoriaFiltrada] = useState<string | null>(null);
  const [estado, setEstado] = useState("activa");

  useEffect(() => {
    if (!slug) return;

    const cargarTienda = async () => {
      const ref = doc(db, "tiendas", slug);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTienda(data);
        setEstado(data.estado || "activa");
        localStorage.setItem("tiendaSlugActual", slug);
      }
    };

    const cargarProductos = async () => {
      const productosRef = collection(db, "tiendas", slug, "productos");
      const productosSnap = await getDocs(productosRef);
      const productosData: Producto[] = productosSnap.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
        tipo: "producto",
      }));
      setProductos(productosData);
    };

    const cargarServicios = async () => {
      const serviciosRef = collection(db, "tiendas", slug, "servicios");
      const serviciosSnap = await getDocs(serviciosRef);
      const serviciosData: Producto[] = serviciosSnap.docs.map((doc) => ({
        ...(doc.data() as Producto),
        id: doc.id,
        tipo: "servicio",
      }));
      setServicios(serviciosData);
    };

    const catGuardada = localStorage.getItem("categoriaSeleccionada");
    if (catGuardada) {
      setCategoriaFiltrada(catGuardada);
      localStorage.removeItem("categoriaSeleccionada");
    }

    cargarTienda();
    cargarProductos();
    cargarServicios();
  }, [slug]);

  const categoriasUnificadas = [...productos, ...servicios];

  const categoriasExtras = Array.from(
    new Set(categoriasUnificadas.map((p) => p.categoria))
  ).filter(
    (cat) =>
      cat !== tienda?.categoriaDestacada1 &&
      cat !== tienda?.categoriaDestacada2
  );

  if (estado === "suspendida") {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>🚫 Página fuera de servicio</h2>
        <p>Esta tienda se encuentra temporalmente suspendida por falta de pago.</p>
        <p>Si sos el dueño, accedé al panel de administración para reactivarla.</p>
      </div>
    );
  }

  const handleCategoriaClick = (cat: string | null) => {
    setCategoriaFiltrada(cat);
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundColor: tienda?.colorFondo || "#ffffff",
        fontFamily: tienda?.estilosTexto?.fuenteGeneral || "inherit",
      }}
    >
      {/* 👉 HEADER AGREGADO AQUÍ */}
      {tienda && (
        <Header
          logo={tienda.logo || ""}
          nombre={tienda.nombre || ""}
          imagenBanner={tienda.imagen || ""}
          alturaBanner={tienda.alturaBanner || "100px"}
          posicionBanner={tienda.posicionBanner || "center"}
          tamañoBanner={tienda.tamañoBanner || "cover"}
          categoria1={tienda.categoriaDestacada1 || ""}
          categoria2={tienda.categoriaDestacada2 || ""}
          categoriasExtras={categoriasExtras}
          setCategoriaFiltrada={handleCategoriaClick}
          linkInstagram={tienda.linkInstagram || ""}
          linkFacebook={tienda.linkFacebook || ""}
        />
      )}

      {(productos.length > 0 || servicios.length > 0) && (
        <div className="productos">
          {productos.length > 0 && (
            <>
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
                    key={`prod-${categoria}`}
                    categoria={categoria}
                    productos={productosCat}
                    carruselId={`carrusel-prod-${i}`}
                    slug={slug!}
                  />
                ))}
            </>
          )}

          {servicios.length > 0 && (
            <>
              <h2 style={{ fontSize: tienda?.estilosTexto?.tamañoH2 || "24px" }}>
                Servicios por categoría
              </h2>
              {Object.entries(
                servicios.reduce((acc: { [cat: string]: Producto[] }, prod) => {
                  const cat = prod.categoria || "Sin categoría";
                  acc[cat] = acc[cat] || [];
                  acc[cat].push(prod);
                  return acc;
                }, {})
              )
                .filter(([cat]) => !categoriaFiltrada || cat === categoriaFiltrada)
                .map(([categoria, serviciosCat], i) => (
                  <CarruselPorCategoria
                    key={`serv-${categoria}`}
                    categoria={categoria}
                    productos={serviciosCat}
                    carruselId={`carrusel-serv-${i}`}
                    slug={slug!}
                  />
                ))}
            </>
          )}
        </div>
      )}

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
  );
}
