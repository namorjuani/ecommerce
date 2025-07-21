import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock?: number;
  categoria?: string;
  tipo: "producto" | "servicio";
  precioReserva?: number;
  precioTotal?: number;
  envioGratis?: boolean;
  variantes?: { nombre: string; stock: number }[];
}

interface Props {
  categoria: string;
  productos: Producto[];
  carruselId: string;
  slug: string;
}

export default function CarruselPorCategoria({ categoria, productos, carruselId, slug }: Props) {
  const mostrarFlecha = productos.length > 3;
  const [scrollProgreso, setScrollProgreso] = useState(0);

  const scroll = (direccion: "left" | "right") => {
    const container = document.getElementById(carruselId);
    if (container) {
      const scrollAmount = direccion === "right" ? 220 : -220;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = document.getElementById(carruselId);
    const handleScroll = () => {
      if (container) {
        const porcentaje = (container.scrollLeft / (container.scrollWidth - container.clientWidth)) * 100;
        setScrollProgreso(porcentaje);
      }
    };
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [carruselId]);

  return (
    <div style={{ background: "#fff", padding: "0 2rem", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "1280px" }}>
        <h3 style={{ marginBottom: "1rem", color: "#333" }}>{categoria}</h3>

        <div style={{ position: "relative" }}>
          <div
            id={carruselId}
            className="carrusel-scroll"
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              scrollBehavior: "smooth",
              paddingBottom: "0.5rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {productos.map((producto) => {
              const sinStock = producto.variantes?.length
                ? producto.variantes.every((v) => v.stock === 0)
                : producto.stock === 0;

              return (
                <Link
                  to={`/tienda/${slug}/${producto.tipo}/${producto.id}`}
                  key={producto.id}
                  className="product-card"
                  style={{
                    flex: "0 0 auto",
                    width: "180px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: sinStock ? "#f8f8f8" : "#fff",
                    opacity: sinStock ? 0.6 : 1,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={producto.imagen && producto.imagen.trim() !== "" ? producto.imagen : "/imagen-default.jpg"}
                    alt={producto.nombre}
                    onError={(e) => {
                      if (e.currentTarget.src !== window.location.origin + "/imagen-default.jpg") {
                        e.currentTarget.src = "/imagen-default.jpg";
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "5px",
                      marginBottom: "0.5rem",
                    }}
                  />

                  <h4 className="product-title" style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
                    {producto.nombre}
                  </h4>

                  {producto.tipo === "producto" ? (
                    <p style={{ fontWeight: "bold", fontSize: "0.9rem" }}>${producto.precio}</p>
                  ) : (
                    <div style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                      {producto.precioReserva !== undefined && (
                        <p style={{ margin: 0 }}>
                          Reserva: <strong>${producto.precioReserva}</strong>
                        </p>
                      )}
                      {producto.precioTotal !== undefined && (
                        <p style={{ margin: 0 }}>
                          Total: <strong>${producto.precioTotal}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {producto.envioGratis && (
                    <p style={{ color: "green", fontWeight: "bold", fontSize: "0.75rem" }}>Envío gratis</p>
                  )}

                  {sinStock && (
                    <p style={{ color: "red", fontWeight: "bold", fontSize: "0.8rem" }}>Sin stock</p>
                  )}
                </Link>
              );
            })}

            {mostrarFlecha && <div style={{ flex: "0 0 auto", width: "50px" }}></div>}
          </div>

          {mostrarFlecha && (
            <>
              <button
                onClick={() => scroll("left")}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "-20px",
                  transform: "translateY(-50%)",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                <span style={{ color: "#3483fa", fontSize: "1.5rem" }}>{"<"}</span>
              </button>
              <button
                onClick={() => scroll("right")}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0",
                  transform: "translateY(-50%)",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                <span style={{ color: "#3483fa", fontSize: "1.5rem" }}>{">"}</span>
              </button>
            </>
          )}

          <div
            style={{
              height: "4px",
              backgroundColor: "#eee",
              borderRadius: "2px",
              marginTop: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${scrollProgreso}%`,
                height: "100%",
                backgroundColor: "#3483fa",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      </div>

      <style>
        {`
          .carrusel-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}
