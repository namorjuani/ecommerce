import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
}

export default function FormaEntrega() {
  const [carrito, setCarrito] = useState<Producto[]>([]);
  const [envio, setEnvio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("carrito");
    if (data) {
      setCarrito(JSON.parse(data));
    }
  }, []);

  const total = carrito.reduce((sum, prod) => sum + prod.precio, 0);

  const continuar = () => {
    if (!envio) {
      alert("Selecciona una forma de entrega");
      return;
    }

    localStorage.setItem("formaEntrega", envio);
    navigate("/forma-pago");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>Elegí tu forma de entrega</h2>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="envio"
              value="domicilio"
              checked={envio === "domicilio"}
              onChange={(e) => setEnvio(e.target.value)}
            />{" "}
            Envío a domicilio
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="envio"
              value="retiro"
              checked={envio === "retiro"}
              onChange={(e) => setEnvio(e.target.value)}
            />{" "}
            Retiro en punto de entrega
          </label>

          <button
            onClick={continuar}
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
            Continuar
          </button>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Resumen de tu compra</h3>
          {carrito.map((prod, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <img
                src={prod.imagen}
                alt={prod.nombre}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  marginRight: "0.5rem",
                  borderRadius: "5px",
                }}
              />
              <span style={{ fontSize: "0.9rem" }}>{prod.nombre}</span>
            </div>
          ))}
          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total: ${total}</p>
        </div>
      </div>
    </div>
  );
}
