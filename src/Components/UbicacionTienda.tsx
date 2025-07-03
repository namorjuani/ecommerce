import React from "react";

interface Props {
  googleMaps?: string;
  textoUbicacion?: string;
}

export default function UbicacionTienda({ googleMaps, textoUbicacion }: Props) {
  if (!googleMaps) return null;

  return (
    <section style={{ backgroundColor: "#f1f1f1", padding: "2rem 1rem", marginTop: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <h2 style={{ marginBottom: "1rem", color: "#333" }}>¿Dónde estamos?</h2>
          <p style={{ lineHeight: "1.6", color: "#555" }}>
            {textoUbicacion || "Nos encontramos en una ubicación ideal para recibirte. ¡Te esperamos!"}
          </p>
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div
            style={{
              width: "100%",
              height: "280px",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)"
            }}
            dangerouslySetInnerHTML={{ __html: googleMaps }}
          />
        </div>
      </div>
    </section>
  );
}
