import React from "react";

interface VistaPreviaTiendaProps {
    logo?: string;
    nombre?: string;
    descripcion?: string;
    imagen?: string;
    textoHero?: string;
    colorFondo?: string;
    colorBoton?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    googleMaps?: string;
    posicionBanner?: string;
    tamañoBanner?: string;
}

export default function VistaPreviaTienda({
    logo,
    nombre,
    descripcion,
    imagen,
    textoHero,
    colorFondo = "#ffffff",
    colorBoton = "#3483fa",
    instagram,
    facebook,
    tiktok,
    googleMaps,
    posicionBanner = "center",
    tamañoBanner = "cover",
}: VistaPreviaTiendaProps) {
    return (
        <div style={{ backgroundColor: colorFondo, color: "#000", padding: "1rem" }}>
            {/* Header con logo y nombre */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {logo && <img src={logo} alt="logo" style={{ height: 50 }} />}
                <h2>{nombre || "Nombre de la tienda"}</h2>
            </div>

            {/* Banner */}
            <div
                style={{
                    backgroundImage: `url(${imagen})`,
                    backgroundSize: tamañoBanner,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: posicionBanner,
                    height: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "white",
                    textShadow: "0 0 5px black",
                    marginTop: "1rem",
                }}
            >
                <h1>{textoHero || "Texto principal de la tienda"}</h1>
            </div>

            {/* Descripción */}
            {descripcion && (
                <p style={{ marginTop: "1rem", fontStyle: "italic" }}>{descripcion}</p>
            )}

            {/* Vista simulada de una card de producto */}
            <div
                style={{
                    marginTop: "2rem",
                    padding: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    maxWidth: "300px",
                    backgroundColor: "#fff",
                }}
            >
                <img
                    src="https://via.placeholder.com/300x200"
                    alt="Producto demo"
                    style={{ width: "100%", borderRadius: "6px" }}
                />
                <h4 style={{ margin: "0.5rem 0" }}>Nombre del producto</h4>
                <p>$9.999</p>
                <button
                    style={{
                        backgroundColor: colorBoton,
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginBottom: "0.5rem",
                        width: "100%",
                    }}
                >
                    Agregar al carrito
                </button>
                <button
                    style={{
                        backgroundColor: "#00c853", // Botón de compra rápido con otro color fijo
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "100%",
                    }}
                >
                    Comprar ahora
                </button>
            </div>

            {/* Redes sociales */}
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                {instagram && <p>📸 Instagram: {instagram}</p>}
                {facebook && <p>📘 Facebook: {facebook}</p>}
                {tiktok && <p>🎵 TikTok: {tiktok}</p>}
            </div>

            {/* Mapa y texto */}
            {googleMaps && (
                <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
                    <div style={{ flex: 1 }}>
                        <h3>¿Dónde estamos?</h3>
                        <p>Visitá nuestro local o hacé tu pedido online. Estamos en una ubicación ideal para atenderte rápidamente.</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                width: "100%",
                                height: "250px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                overflow: "hidden",
                            }}
                            dangerouslySetInnerHTML={{ __html: googleMaps }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
