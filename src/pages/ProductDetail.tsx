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
}

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [imagenPrincipal, setImagenPrincipal] = useState("");
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<string | null>(null);
  const { agregarAlCarrito } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const navigate = useNavigate();
  const tienda = useTienda();
  const [categoriasExtras, setCategoriasExtras] = useState<string[]>([]);

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) return;
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) return;

      // Cargar producto
      const productoRef = doc(db, "tiendas", tiendaId, "productos", id);
      const productoSnap = await getDoc(productoRef);
      if (productoSnap.exists()) {
        const data = productoSnap.data() as Producto;
        setProducto({ ...data, id });
        setImagenPrincipal(data.imagen);
      }

      // Cargar categorías extras
      const productosRef = collection(db, "tiendas", tiendaId, "productos");
      const productosSnap = await getDocs(productosRef);
      const categoriasSet = new Set<string>();

      productosSnap.forEach((doc) => {
        const data = doc.data();
        if (data.categoria) {
          categoriasSet.add(data.categoria);
        }
      });

      const extras = Array.from(categoriasSet).filter(
        (cat) =>
          cat !== tienda?.categoriaDestacada1 && cat !== tienda?.categoriaDestacada2
      );
      setCategoriasExtras(extras);
    };

    cargarProducto();
  }, [id, tienda]);

  if (!producto || !tienda)
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando producto...</p>;

  const stockFinal = varianteSeleccionada
    ? producto.variantes?.find((v) => v.nombre === varianteSeleccionada)?.stock ?? 0
    : producto.stock;

  const hayStock = stockFinal > 0;

  const setCategoriaFiltrada = (cat: string | null) => {
    if (cat) {
      localStorage.setItem("categoriaSeleccionada", cat);
    }
    navigate("/");
  };

  return (
    <>
      <Header
        logo={tienda.logo}
        nombre={tienda.nombre}
        imagenBanner={tienda.imagen}
        alturaBanner={tienda.alturaBanner || "100px"}
        posicionBanner={tienda.posicionBanner || "center"}
        tamañoBanner={tienda.tamañoBanner || "cover"}
        categoria1={tienda.categoriaDestacada1}
        categoria2={tienda.categoriaDestacada2}
        categoriasExtras={categoriasExtras}
        setCategoriaFiltrada={setCategoriaFiltrada}
        linkInstagram={tienda.linkInstagram}
        linkFacebook={tienda.linkFacebook}
      />

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
                onClick={() => navigate(`/agendar-servicio/${producto.id}`)}
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
                    localStorage.setItem(
                      "checkoutDirecto",
                      JSON.stringify({
                        productoId: producto.id,
                        cantidad,
                        variante: varianteSeleccionada,
                      })
                    );
                    navigate("/forma-entrega");
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
