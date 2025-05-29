// ✅ PRODUCTDETAIL ACTUALIZADO CON BOTÓN PARA AGENDAR SERVICIO Y PRECIOS CORRECTOS

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCarrito } from "../context/CarritoContext";
import "./css/ProductDetail.css";

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

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) return;
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) return;
      const productoRef = doc(db, "tiendas", tiendaId, "productos", id);
      const productoSnap = await getDoc(productoRef);
      if (productoSnap.exists()) {
        const data = productoSnap.data() as Producto;
        setProducto({ ...data, id });
        setImagenPrincipal(data.imagen);
      }
    };
    cargarProducto();
  }, [id]);

  if (!producto) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Cargando producto...</p>;

  const stockFinal = varianteSeleccionada
    ? producto.variantes?.find(v => v.nombre === varianteSeleccionada)?.stock ?? 0
    : producto.stock;

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      {/* Imagen principal */}
      <div style={{ flex: "1", minWidth: "300px" }}>
        <img
          src={imagenPrincipal}
          alt="Producto"
          onError={() => setImagenPrincipal("/imagen-default.jpg")}
          style={{ width: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "10px", marginBottom: "1rem" }}
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

      {/* Info del producto */}
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h2>{producto.nombre}</h2>

        {/* Mostrar precios según tipo */}
        {producto.tipo === "producto" ? (
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "1rem 0" }}>${producto.precio}</p>
        ) : (
          <div style={{ margin: "1rem 0", lineHeight: 1.6 }}>
            <p><strong>Reserva:</strong> ${producto.precioReserva || 0}</p>
            <p><strong>Total del servicio:</strong> ${producto.precioTotal || 0}</p>
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
              style={{ display: "block", marginTop: "0.5rem", padding: "0.5rem", borderRadius: "5px" }}
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

        {/* Selector de cantidad solo si es producto */}
        {producto.tipo === "producto" && (
          <div style={{ marginTop: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>
              Cantidad:
              <input
                type="number"
                min={1}
                max={stockFinal}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                style={{ width: "80px", marginLeft: "1rem", padding: "0.3rem" }}
                disabled={stockFinal === 0}
              />
              <span style={{ marginLeft: "0.5rem", color: "#555" }}>({stockFinal} disponibles)</span>
            </label>
          </div>
        )}

        {/* Botones */}
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
          ) : (
            <>
              <button
                onClick={() => {
                  agregarAlCarrito({
                    ...producto,
                    nombre: producto.nombre + (varianteSeleccionada ? ` - ${varianteSeleccionada}` : ""),
                    stock: stockFinal,
                    cantidad,
                  });
                }}
                disabled={stockFinal === 0}
                style={{
                  backgroundColor: "#3483fa",
                  color: "white",
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  cursor: stockFinal > 0 ? "pointer" : "not-allowed",
                  opacity: stockFinal > 0 ? 1 : 0.6,
                }}
              >
                {stockFinal === 0 ? "Sin stock" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => {
                  if (stockFinal > 0) {
                    localStorage.setItem("checkoutDirecto", JSON.stringify({
                      productoId: producto.id,
                      cantidad,
                      variante: varianteSeleccionada,
                    }));
                    navigate("/forma-entrega");
                  }
                }}
                disabled={stockFinal === 0}
                style={{
                  backgroundColor: "#00c853",
                  color: "white",
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  cursor: stockFinal > 0 ? "pointer" : "not-allowed",
                  opacity: stockFinal > 0 ? 1 : 0.6,
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
  );
}