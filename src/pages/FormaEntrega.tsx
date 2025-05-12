// src/pages/FormaEntrega.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCliente } from "../context/ClienteContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
  const [clienteInfo, setClienteInfo] = useState<any>(null);
  const { cliente } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = localStorage.getItem("carrito");
      if (data) setCarrito(JSON.parse(data));

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

  const total = carrito.reduce((sum, prod) => sum + prod.precio, 0);

  const continuar = async () => {
  if (!envio) {
    alert("Selecciona una forma de entrega");
    return;
  }

  const tiendaId = localStorage.getItem("userId");
  if (!tiendaId || !cliente) return;

  // volver a obtener el cliente actualizado desde Firestore
  const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("No se encontraron los datos del cliente.");
    return;
  }

  const clienteActualizado = snap.data();

  // guardamos el cliente actualizado en localStorage
  localStorage.setItem("cliente", JSON.stringify(clienteActualizado));
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

          {envio === "domicilio" && (
  <div style={{ background: "#f1f1f1", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
    <h4>Dirección registrada:</h4>
    <p>{clienteInfo?.direccion || "No hay dirección guardada."}</p>
    <p style={{ fontSize: "0.9rem", color: "#888" }}>Podés modificarla desde la sección "Datos de envío".</p>
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
