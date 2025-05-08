// src/pages/FormaDePago.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useCarrito } from "../context/CarritoContext";
import { useCliente } from "../context/ClienteContext";

export default function FormaDePago() {
  const [formaPago, setFormaPago] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);
  const navigate = useNavigate();

  const { vaciarCarrito } = useCarrito();
  const { cliente } = useCliente();

  useEffect(() => {
    const data = localStorage.getItem("carrito");
    if (data) setCarrito(JSON.parse(data));
  }, []);

  const total = carrito.reduce((sum, prod) => sum + prod.precio * (prod.cantidad || 1), 0);

  const finalizar = async () => {
    if (!formaPago) return alert("Selecciona una forma de pago");

    const tiendaId = localStorage.getItem("userId");
    const clienteData = JSON.parse(localStorage.getItem("cliente") || "{}");
    const formaEntrega = localStorage.getItem("formaEntrega");

    if (!tiendaId || !clienteData || !formaEntrega || carrito.length === 0) {
      alert("Faltan datos del pedido.");
      return;
    }

    // 🔄 Actualizar stock en Firebase
    for (const producto of carrito) {
      const ref = doc(db, "tiendas", tiendaId, "productos", producto.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const nuevoStock = Math.max(0, (data.stock || 0) - (producto.cantidad || 1));
        await updateDoc(ref, { stock: nuevoStock });
      }
    }

    // 📦 Guardar el pedido en Firestore
    const pedido = {
      estado: "pendiente",
      fecha: serverTimestamp(),
      total,
      formaPago,
      formaEntrega,
      cliente: clienteData,
      productos: carrito.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        cantidad: prod.cantidad || 1,
        precio: prod.precio,
        subtotal: prod.precio * (prod.cantidad || 1),
      })),
    };

    await addDoc(collection(db, "tiendas", tiendaId, "pedidos"), pedido);

    // 🧹 Limpiar carrito
    vaciarCarrito();
    localStorage.removeItem("carrito");
    localStorage.removeItem("formaEntrega");

    navigate("/compra-realizada");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Elegí tu forma de pago</h2>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Opciones de pago */}
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="pago"
              value="mercadopago"
              checked={formaPago === "mercadopago"}
              onChange={(e) => setFormaPago(e.target.value)}
            />{" "}
            Mercado Pago
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="pago"
              value="transferencia"
              checked={formaPago === "transferencia"}
              onChange={(e) => setFormaPago(e.target.value)}
            />{" "}
            Transferencia bancaria
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

        {/* Resumen del carrito */}
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
