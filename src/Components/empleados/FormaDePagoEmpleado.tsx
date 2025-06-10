import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  writeBatch,
  addDoc,
  Timestamp,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Swal from "sweetalert2";

export default function FormaDePagoEmpleado() {
  const [formaPago, setFormaPago] = useState("");
  const [montoRecibido, setMontoRecibido] = useState("");
  const navigate = useNavigate();
  const { carrito, vaciarCarrito, calcularTotal } = useCarrito();
  const { usuario } = useAuth();

  const total = calcularTotal();
  const vuelto = parseFloat(montoRecibido || "0") - total;
  const tiendaId = localStorage.getItem("userId") || "";
  const empleado = usuario?.displayName || "Empleado";

  const finalizarVenta = async () => {
    if (!formaPago) {
      Swal.fire("Selecciona una forma de pago");
      return;
    }

    const batch = writeBatch(db);

    for (const item of carrito) {
      const prodRef = doc(db, "tiendas", tiendaId, "productos", item.id!);
      const snap = await getDoc(prodRef);
      if (!snap.exists()) continue;
      const data = snap.data();

      const cantidadVendida = item.cantidad || 1;
      if (item.variante) {
        const nuevasVariantes = (data.variantes || []).map((v: any) =>
          v.nombre === item.variante
            ? { ...v, stock: Math.max(0, v.stock - cantidadVendida) }
            : v
        );
        batch.update(prodRef, { variantes: nuevasVariantes });
      } else {
        const nuevoStock = Math.max(0, (data.stock || 0) - cantidadVendida);
        batch.update(prodRef, { stock: nuevoStock });
      }
    }

    const ventaLimpia = {
      productos: carrito.map((p) => ({
        id: p.id || "",
        nombre: p.nombre || "Sin nombre",
        cantidad: p.cantidad || 1,
        precio: p.precio || 0,
        imagen: p.imagen || "",
        variante: p.variante || null,
      })),
      total: total || 0,
      formaPago,
      vuelto: formaPago === "efectivo" ? vuelto : null,
      montoRecibido: formaPago === "efectivo" ? parseFloat(montoRecibido) : null,
      empleado: empleado || "Empleado sin nombre",
      fecha: new Date().toISOString(),
      creado: Timestamp.now(),
    };

    await addDoc(collection(db, "tiendas", tiendaId, "ventas"), ventaLimpia);

    const fechaHoy = new Date().toISOString().split("T")[0];
    const q = query(
      collection(db, "tiendas", tiendaId, "cajas"),
      where("fecha", "==", fechaHoy),
      where("empleado", "==", empleado),
      where("cerrada", "==", false)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const cajaDoc = snap.docs[0];
      const cajaRef = doc(db, "tiendas", tiendaId, "cajas", cajaDoc.id);

      await addDoc(collection(cajaRef, "ventas"), {
  total: total,
  formaPago,
  creado: Timestamp.now(),
  productos: carrito.map((p) => ({
    id: p.id || "",
    nombre: p.nombre || "Sin nombre",
    cantidad: p.cantidad || 1,
    precio: p.precio || 0,
    imagen: p.imagen || "",
    variante: p.variante || null,
  })),
});

      const cajaData = cajaDoc.data();
      const actual = cajaData.ventasTotales || 0;
      const totalMp = cajaData.totalMp || 0;
      const totalEf = cajaData.totalEfectivo || 0;
      const totalTr = cajaData.totalTransferencia || 0;

      const nuevosTotales: any = {
        ventasTotales: actual + total,
      };

      if (formaPago === "mercadopago") nuevosTotales.totalMp = totalMp + total;
      if (formaPago === "efectivo") nuevosTotales.totalEfectivo = totalEf + total;
      if (formaPago === "transferencia") nuevosTotales.totalTransferencia = totalTr + total;

      await updateDoc(cajaRef, nuevosTotales);
    }

    await batch.commit();
    vaciarCarrito();

    Swal.fire({
      icon: "success",
      title: "✅ Venta realizada con éxito",
      text: "La venta fue registrada correctamente y el stock fue actualizado.",
      confirmButtonText: "Volver al inicio",
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h2>💳 Forma de pago</h2>

      <label style={{ display: "block", margin: "1rem 0" }}>
        <input
          type="radio"
          name="pago"
          value="efectivo"
          checked={formaPago === "efectivo"}
          onChange={() => setFormaPago("efectivo")}
        /> Efectivo
      </label>

      {formaPago === "efectivo" && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Monto recibido del cliente:</label>
          <input
            type="number"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
          {vuelto >= 0 && (
            <p style={{ marginTop: "0.5rem" }}>
              Vuelto a entregar: <strong>${vuelto.toFixed(2)}</strong>
            </p>
          )}
        </div>
      )}

      <label style={{ display: "block", margin: "1rem 0" }}>
        <input
          type="radio"
          name="pago"
          value="mercadopago"
          checked={formaPago === "mercadopago"}
          onChange={() => setFormaPago("mercadopago")}
        /> Mercado Pago
      </label>

      {formaPago === "mercadopago" && (
        <div style={{ background: "#f1f1f1", padding: "1rem", borderRadius: "6px" }}>
          <p>Alias o QR para cobrar (configurado por el admin):</p>
          <p><strong>alias.mp/tu_tienda</strong></p>
        </div>
      )}

      <label style={{ display: "block", margin: "1rem 0" }}>
        <input
          type="radio"
          name="pago"
          value="transferencia"
          checked={formaPago === "transferencia"}
          onChange={() => setFormaPago("transferencia")}
        /> Transferencia bancaria
      </label>

      {formaPago === "transferencia" && (
        <div style={{ background: "#f1f1f1", padding: "1rem", borderRadius: "6px" }}>
          <p>CBU o alias configurado por el admin:</p>
          <p><strong>CBU: 0000003100000001234567</strong></p>
        </div>
      )}

      <button
        onClick={finalizarVenta}
        style={{
          marginTop: "2rem",
          backgroundColor: "#3483fa",
          color: "white",
          border: "none",
          padding: "0.8rem 1.5rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ✅ Confirmar venta
      </button>

      <div
        style={{
          marginTop: "2rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>🧾 Resumen de tu compra</h3>
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
            <div>
              <strong>{prod.nombre}</strong>
              <div>Cantidad: {prod.cantidad}</div>
              <div>Precio: ${prod.precio}</div>
            </div>
          </div>
        ))}
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total: ${total}</p>
      </div>
    </div>
  );
}
