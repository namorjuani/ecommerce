import React from "react";
import "../Components/css/Footer.css";
import { FaInstagram, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        <FaEnvelope style={{ marginRight: "0.5rem", color: "#D44638" }} />
        <a href="mailto:soporteecommerceweb@gmail.com" style={{ color: "#ddd" }}>
          soporteecommerceweb@gmail.com
        </a>
      </p>
      <p>
        <FaInstagram style={{ marginRight: "0.5rem", color: "#E1306C" }} />
        <a
          href="https://instagram.com/mitienda"
          style={{ color: "#ddd" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          @mitienda
        </a>
      </p>
      <p>
        🌐{" "}
        <a href="/" className="footer-link" style={{ color: "#1da1f2" }}>
          Ir a "planes"
        </a>
      </p>
    </footer>
  );
}
