import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useCarrito } from "../context/CarritoContext";
import Header from "../Components/Header";
import "./css/ProductDetail.css";
import { useTienda } from "../context/TiendaContext";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  imagenes?: string[];
  descripcion?: string;
  cuotas?: string;
  envioGratis?: boolean;
  color?: string;
  stock: number;
  tipo: "producto" | "servicio";
  variantes?: {
    nombre: string;
    stock: number;
  }[];
  precioReserva?: number;
  precioTotal?: number;
  videoYoutube?: string;
}

export default function ProductDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const tienda = useTienda();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [imagenPrincipal, setImagenPrincipal] = useState("");
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [categoriasExtras, setCategoriasExtras] = useState<string[]>([]);

  useEffect(() => {
    const cargarProductoYCategorias = async () => {
      if (!slug || !id) return;

      try {
        let productoSnap = await getDoc(doc(db, "tiendas", slug, "productos", id));
        let tipo: "producto" | "servicio" = "producto";

        if (!productoSnap.exists()) {
          productoSnap = await getDoc(doc(db, "tiendas", slug, "servicios", id));
          tipo = "servicio";
        }

        if (productoSnap.exists()) {
          const data = productoSnap.data() as Producto;
          setProducto({ ...data, id, tipo });
          setImagenPrincipal(data.imagen);
        } else {
          console.warn("Producto o servicio no encontrado");
        }

        const productosRef = collection(db, "tiendas", slug, "productos");
        const productosSnap = await getDocs(productosRef);
        const categoriasSet = new Set<string>();
        productosSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.categoria) categoriasSet.add(data.categoria);
        });

        setCategoriasExtras(Array.from(categoriasSet));
      } catch (err) {
        console.error("Error cargando producto o categorías:", err);
      }
    };

    cargarProductoYCategorias();
  }, [slug, id]);

  if (!producto) {
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando producto...</p>;
  }

  const stockFinal = varianteSeleccionada
    ? producto.variantes?.find((v) => v.nombre === varianteSeleccionada)?.stock ?? 0
    : producto.stock;

  const hayStock = stockFinal > 0;

  const setCategoriaFiltrada = (cat: string | null) => {
    if (cat) {
      localStorage.setItem("categoriaSeleccionada", cat);
    }
    navigate(`/tienda/${slug}`);
  };

  function obtenerIdYoutube(url: string): string {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }

  return (
    <>
      {tienda && (
        <Header
          logo={tienda.logo}
          nombre={tienda.nombre}
          imagenBanner={tienda.imagen}
          alturaBanner={tienda.alturaBanner || "100px"}
          posicionBanner={tienda.posicionBanner || "center"}
          tamañoBanner={tienda.tamañoBanner || "cover"}
          categoria1={tienda.categoriaDestacada1}
          categoria2={tienda.categoriaDestacada2}
          categoriasExtras={categoriasExtras.filter(
            (cat) =>
              cat !== tienda.categoriaDestacada1 && cat !== tienda.categoriaDestacada2
          )}
          setCategoriaFiltrada={setCategoriaFiltrada}
          linkInstagram={tienda.linkInstagram}
          linkFacebook={tienda.linkFacebook}
        />
      )}

      <div
        style={{
          maxWidth: "1000px",
          margin: "2rem auto",
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1", minWidth: "300px" }}>
          <img
            src={imagenPrincipal}
            alt="Producto"
            onError={() => setImagenPrincipal("/imagen-default.jpg")}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "contain",
              borderRadius: "10px",
              marginBottom: "1rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {producto.imagenes?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Miniatura ${index}`}
                onClick={() => setImagenPrincipal(img)}
                onError={(e) => (e.currentTarget.style.display = "none")}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: img === imagenPrincipal ? "2px solid #000" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            ))}
          </div>
          {producto.videoYoutube && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>🎥 Video del producto</h4>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: "10px",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${obtenerIdYoutube(
                    producto.videoYoutube
                  )}`}
                  title="Video del producto"
                  frameBorder="0"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: "1", minWidth: "300px" }}>
          <h2>{producto.nombre}</h2>

          {producto.tipo === "producto" ? (
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>
              ${producto.precio}
            </p>
          ) : (
            <div style={{ margin: "1rem 0", lineHeight: 1.6 }}>
              <p>
                <strong>Reserva:</strong> ${producto.precioReserva || 0}
              </p>
              <p>
                <strong>Total del servicio:</strong> ${producto.precioTotal || 0}
              </p>
            </div>
          )}

          {producto.cuotas && <p>Cuotas: {producto.cuotas}</p>}
          {producto.envioGratis && <p style={{ color: "green" }}>¡Envío gratis!</p>}
          {producto.color && <p>Color: {producto.color}</p>}

          {producto.variantes && producto.variantes.length > 0 && (
            <div style={{ margin: "1rem 0" }}>
              <label style={{ fontWeight: "bold" }}>Seleccionar variante:</label>
              <select
                value={varianteSeleccionada ?? ""}
                onChange={(e) => setVarianteSeleccionada(e.target.value)}
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  borderRadius: "5px",
                }}
              >
                <option value="">(Seleccionar)</option>
                {producto.variantes.map((v, i) => (
                  <option key={i} value={v.nombre}>
                    {v.nombre} ({v.stock} disponibles)
                  </option>
                ))}
              </select>
            </div>
          )}

          {producto.tipo === "producto" && (
            <div style={{ marginTop: "1rem" }}>
              <label style={{ fontWeight: "bold" }}>
                Cantidad:
                <input
                  type="number"
                  min={1}
                  max={stockFinal}
                  value={cantidad}
                  disabled={!hayStock}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  style={{ width: "80px", marginLeft: "1rem", padding: "0.3rem" }}
                />
                <span style={{ marginLeft: "0.5rem", color: "#555" }}>
                  ({stockFinal} disponibles)
                </span>
              </label>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            {producto.tipo === "servicio" ? (
              <button
                onClick={() => navigate(`/tienda/${slug}/agendar-servicio/${producto.id}`)}
                style={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                📅 Agendar turno
              </button>
            ) : !hayStock ? (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Producto sin stock disponible
              </p>
            ) : (
              <>
                <button
                  onClick={() => {
                    agregarAlCarrito({
                      ...producto,
                      nombre:
                        producto.nombre +
                        (varianteSeleccionada ? ` - ${varianteSeleccionada}` : ""),
                      stock: stockFinal,
                      cantidad,
                      variante: varianteSeleccionada || undefined,
                    });
                  }}
                  style={{
                    backgroundColor: "#3483fa",
                    color: "white",
                    border: "none",
                    padding: "0.8rem 1.5rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Agregar al carrito
                </button>

                <button
                  onClick={() => {
                    agregarAlCarrito({
                      ...producto,
                      nombre:
                        producto.nombre +
                        (varianteSeleccionada ? ` - ${varianteSeleccionada}` : ""),
                      stock: stockFinal,
                      cantidad,
                      variante: varianteSeleccionada || undefined,
                    });
                    navigate(`/tienda/${slug}/forma-entrega`);
                  }}
                  style={{
                    backgroundColor: "#00c853",
                    color: "white",
                    border: "none",
                    padding: "0.8rem 1.5rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Comprar ahora
                </button>
              </>
            )}
          </div>

          <p style={{ marginTop: "2rem", lineHeight: 1.5 }}>{producto.descripcion}</p>
        </div>
      </div>
    </>
  );
}
