// src/pages/FormaEntrega.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCliente } from "../context/ClienteContext";
import { useCarrito } from "../context/CarritoContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function FormaEntrega() {
  const [envio, setEnvio] = useState("");
  const [clienteInfo, setClienteInfo] = useState<any>(null);
  const { cliente } = useCliente();
  const {
    carrito,
    eliminarDelCarrito,
    vaciarCarrito,
    calcularTotal,
    actualizarCantidad,
  } = useCarrito();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tiendaId = localStorage.getItem("userId");
      if (tiendaId && cliente) {
        const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const datos = snap.data();
          setClienteInfo(datos);
          localStorage.setItem("cliente", JSON.stringify(datos));
        }
      }
    };

    fetchData();
  }, [cliente]);

  const total = calcularTotal();

  const continuar = async () => {
    if (!envio) {
      alert("Selecciona una forma de entrega");
      return;
    }

    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId || !cliente) return;

    const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("No se encontraron los datos del cliente.");
      return;
    }

    const clienteActualizado = snap.data();
    localStorage.setItem("cliente", JSON.stringify(clienteActualizado));
    localStorage.setItem("formaEntrega", envio);

    navigate("/forma-pago");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>
        Elegí tu forma de entrega
      </h2>

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

          {envio === "domicilio" && (
            <div
              style={{
                background: "#f1f1f1",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <h4>Dirección registrada:</h4>
              <p>{clienteInfo?.direccion || "No hay dirección guardada."}</p>
              <p style={{ fontSize: "0.9rem", color: "#888" }}>
                Podés modificarla desde la sección "Datos de envío".
              </p>
            </div>
          )}

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

          {/* 🧹 Gestión del carrito desde forma de entrega */}
          <div style={{ marginTop: "2rem" }}>
            <h3>🛒 Productos en tu carrito</h3>
            {carrito.map((prod, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem",
                }}
              >
                <div>
                  <strong>{prod.nombre}</strong>
                  <div>
                    <label>
                      Cantidad:{" "}
                      <input
                        type="number"
                        value={prod.cantidad || 1}
                        min={1}
                        max={prod.stock}
                        onChange={(e) =>
                          actualizarCantidad(prod.id!, parseInt(e.target.value))
                        }
                        style={{
                          width: "60px",
                          marginLeft: "0.5rem",
                          padding: "0.2rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </label>
                  </div>
                </div>
                <span style={{ fontWeight: "bold" }}>
                  ${prod.precio * (prod.cantidad || 1)}
                </span>
                <button
                  onClick={() => eliminarDelCarrito(prod.id!)}
                  style={{
                    marginLeft: "1rem",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.3rem 0.7rem",
                    cursor: "pointer",
                  }}
                >
                  ❌
                </button>
              </div>
            ))}

            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={vaciarCarrito}
                style={{
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Vaciar carrito
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  marginLeft: "1rem",
                  backgroundColor: "#3483fa",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ➕ Seguir comprando
              </button>
            </div>
          </div>
        </div>

        {/* 🧾 Resumen de compra */}
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
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}
            >
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
              <span style={{ fontSize: "0.9rem" }}>
                {prod.nombre} x {prod.cantidad}
              </span>
            </div>
          ))}
          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total: ${total}</p>
        </div>
      </div>
    </div>
  );
}
