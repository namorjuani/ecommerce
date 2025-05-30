import React from "react";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#333",
      color: "white",
      padding: "2rem",
      marginTop: "2rem",
      fontSize: "0.9rem",
      textAlign: "center",
    }}>
      <p>© 2025 MiTienda Web. Todos los derechos reservados.</p>
      <p>📧 Contacto: contacto@mitienda.com</p>
      <p>📸 Instagram: <a href="https://instagram.com/mitienda" style={{ color: "#ddd" }} target="_blank" rel="noopener noreferrer">@mitienda</a></p>
    </footer>
  );
}
