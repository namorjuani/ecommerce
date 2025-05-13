// src/pages/FormaDePago.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCarrito } from "../context/CarritoContext";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export default function FormaDePago() {
  const [formaPago, setFormaPago] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);
  const navigate = useNavigate();
  const { vaciarCarrito } = useCarrito();
  const [mp, setMp] = useState<any>(null);

  useEffect(() => {
    if (window.MercadoPago) {
      const mpInstance = new window.MercadoPago("TEST-02545aaf-26ee-412a-adf6-411b7dd63808", {
        locale: "es-AR",
      });
      setMp(mpInstance);
    }
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("carrito");
    if (data) setCarrito(JSON.parse(data));

    // SDK MercadoPago
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const total = carrito.reduce((sum, prod) => sum + prod.precio * (prod.cantidad || 1), 0);

  const finalizar = async () => {
    if (!formaPago) return alert("Selecciona una forma de pago");

    if (formaPago === "transferencia") {
      Swal.fire("Gracias", "Te enviaremos los datos bancarios por WhatsApp", "info");
      vaciarCarrito();
      navigate("/compra-realizada");
      return;
    }

    if (formaPago === "mercadopago") {
      Swal.fire({
        title: "Procesando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) {
        Swal.fire("Error", "No se encontró el ID de la tienda", "error");
        return;
      }

      try {
        const response = await fetch(
          "https://us-central1-applavaderoartesanal.cloudfunctions.net/crearPreferencia", // ⚠️ Reemplazá con tu URL real
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito, tiendaId }),
          }
        );

        const data = await response.json();

        if (!data.preferenceId) throw new Error("No se obtuvo preferenceId");

        // Redirección simple al init_point de Mercado Pago
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;

        localStorage.removeItem("carrito");
        vaciarCarrito();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo procesar el pago", "error");
      } finally {
        Swal.close();
      }
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Elegí tu forma de pago</h2>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 2 }}>
          <label>
            <input
              type="radio"
              name="pago"
              value="mercadopago"
              checked={formaPago === "mercadopago"}
              onChange={(e) => setFormaPago(e.target.value)}
            /> Mercado Pago
          </label>
          <label style={{ marginTop: "1rem" }}>
            <input
              type="radio"
              name="pago"
              value="transferencia"
              checked={formaPago === "transferencia"}
              onChange={(e) => setFormaPago(e.target.value)}
            /> Transferencia bancaria
          </label>
          <button
            onClick={finalizar}
            style={{
              marginTop: "1.5rem",
              padding: "0.8rem 1.5rem",
              backgroundColor: "#3483fa",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Finalizar
          </button>
        </div>

        <div style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#f9f9f9",
        }}>
          <h3>Resumen de tu compra</h3>
          {carrito.map((prod, i) => (
            <div key={i} style={{ display: "flex", marginBottom: "0.5rem" }}>
              <img
                src={prod.imagen}
                alt={prod.nombre}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  marginRight: "0.5rem",
                }}
              />
              <span>{prod.nombre}</span>
            </div>
          ))}
          <p style={{ fontWeight: "bold" }}>Total: ${total}</p>
        </div>
      </div>
    </div>
  );
}
