// src/components/CarruselPorCategoria.tsx
import { Link } from "react-router-dom";

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
}

interface Props {
    categoria: string;
    productos: Producto[];
    carruselId: string;
}

export default function CarruselPorCategoria({ categoria, productos, carruselId }: Props) {
    const mostrarFlecha = productos.length > 3;

    const scroll = (direccion: "left" | "right") => {
        const container = document.getElementById(carruselId);
        if (container) {
            const scrollAmount = direccion === "right" ? 220 : -220;
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div style={{ marginBottom: "3rem", position: "relative" }}>
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>{categoria}</h3>

            <div
                id={carruselId}
                style={{
                    display: "flex",
                    gap: "1rem",
                    overflowX: "hidden",
                    scrollBehavior: "smooth",
                }}
            >
                {productos.map((producto) => (
                    <Link
                        to={`/producto/${producto.id}`}
                        key={producto.id}
                        className="product-card"
                        style={{
                            minWidth: "200px",
                            flex: "0 0 auto",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "1rem",
                            backgroundColor: producto.stock === 0 ? "#f8f8f8" : "#fff",
                            opacity: producto.stock === 0 ? 0.5 : 1,
                            pointerEvents: producto.stock === 0 ? "none" : "auto",
                        }}
                    >
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            onError={(e) => (e.currentTarget.src = "/imagen-default.jpg")}
                            style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }}
                        />
                        <h4>{producto.nombre}</h4>

                        {producto.tipo === "producto" ? (
                            <p style={{ fontWeight: "bold" }}>${producto.precio}</p>
                        ) : (
                            <div style={{ fontSize: "0.95rem", lineHeight: "1.4" }}>
                                {producto.precioReserva !== undefined && (
                                    <p style={{ margin: 0 }}>Reserva: <strong>${producto.precioReserva}</strong></p>
                                )}
                                {producto.precioTotal !== undefined && (
                                    <p style={{ margin: 0 }}>Total: <strong>${producto.precioTotal}</strong></p>
                                )}
                            </div>
                        )}

                        {producto.envioGratis && (
                            <p style={{ color: "green", fontWeight: "bold", fontSize: "0.85rem" }}>
                                Envío gratis
                            </p>
                        )}

                        {producto.stock === 0 && (
                            <p style={{ color: "red", fontWeight: "bold" }}>Sin stock</p>
                        )}
                    </Link>
                ))}
            </div>

            {mostrarFlecha && (
                <>
                    <button
                        onClick={() => scroll("left")}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
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
                        }}
                    >
                        <span style={{ color: "#3483fa", fontSize: "1.5rem" }}>{"<"}</span>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: 0,
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
                        }}
                    >
                        <span style={{ color: "#3483fa", fontSize: "1.5rem" }}>{">"}</span>
                    </button>
                </>
            )}
        </div>
    );
}
