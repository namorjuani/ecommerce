// mismo import que ya tenías
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCarrito } from "../context/CarritoContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  writeBatch,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  tipo: "producto" | "servicio";
  cantidad?: number;
  variante?: string;
}

export default function FormaDePago() {
  const [formaPago, setFormaPago] = useState("");
  const navigate = useNavigate();
  const { carrito, vaciarCarrito } = useCarrito();
  const [publicKey, setPublicKey] = useState("");
  const { esEmpleado, usuario } = useAuth();

  useEffect(() => {
    if (esEmpleado) {
      navigate("/empleado/forma-pago");
    }
  }, [esEmpleado, navigate]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const cargarConfig = async () => {
      const ref = doc(db, "tiendas", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPublicKey(data.publicKeyMP || "");
      }
    };

    cargarConfig();

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago && publicKey) {
        new window.MercadoPago(publicKey, { locale: "es-AR" });
      }
    };
    document.body.appendChild(script);
  }, [publicKey]);

  useEffect(() => {
    if (esEmpleado) return;

    const clienteId = localStorage.getItem("clienteId");
    const datosAnonimos = localStorage.getItem("datosEnvioAnonimo");
    if (!clienteId && !datosAnonimos) {
      Swal.fire("Faltan datos", "Por favor completá tus datos de envío antes de continuar", "warning");
      navigate("/forma-entrega");
    }
  }, [esEmpleado]);

  const total = carrito.reduce((sum, prod) => sum + prod.precio * (prod.cantidad ?? 1), 0);

  const descontarStock = async () => {
    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) return;

    const batch = writeBatch(db);

    for (const item of carrito as ProductoCarrito[]) {
      const prodRef = doc(db, "tiendas", tiendaId, "productos", item.id);
      const snap = await getDoc(prodRef);
      if (!snap.exists()) continue;

      const data = snap.data();

      if (item.variante) {
        const nuevasVariantes = (data.variantes || []).map((v: any) =>
          v.nombre === item.variante
            ? { ...v, stock: Math.max(0, v.stock - (item.cantidad ?? 1)) }
            : v
        );
        batch.update(prodRef, { variantes: nuevasVariantes });
      } else {
        const nuevoStock = Math.max(0, (data.stock || 0) - (item.cantidad ?? 1));
        batch.update(prodRef, { stock: nuevoStock });
      }
    }

    await batch.commit();
  };

  const registrarVentaEnCaja = async () => {
    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) {
      console.log("⛔ No hay tiendaId");
      return;
    }

    const empleado = usuario?.email || "Empleado";
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    try {
      const cajasSnap = await getDocs(query(
        collection(db, "tiendas", tiendaId, "cajas"),
        where("empleado", "==", empleado),
        where("fecha", ">=", inicioDia),
        where("fecha", "<=", finDia),
        where("cerrada", "==", false)
      ));

      if (cajasSnap.empty) {
        console.log("⚠️ No hay caja abierta encontrada entre", inicioDia, "y", finDia);
        return;
      }

      const cajaDoc = cajasSnap.docs[0];
      const cajaId = cajaDoc.id;
      const cajaRef = doc(db, "tiendas", tiendaId, "cajas", cajaId);

      const nuevaVenta = {
        total,
        formaPago,
        creado: Timestamp.now(),
        productos: carrito,
      };

      await addDoc(collection(db, "tiendas", tiendaId, "cajas", cajaId, "ventas"), nuevaVenta);
      console.log("✅ Venta registrada en caja:", nuevaVenta);
    } catch (error) {
      console.error("⛔ Error al registrar venta en caja:", error);
    }
  };

  const finalizar = async () => {
    if (!formaPago) return alert("Selecciona una forma de pago");

    if (formaPago === "transferencia") {
      await descontarStock();
      await registrarVentaEnCaja();
      Swal.fire("Gracias", "Te enviaremos los datos bancarios por WhatsApp", "info");
      vaciarCarrito();
      localStorage.removeItem("datosEnvioAnonimo");
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
          "https://us-central1-applavaderoartesanal.cloudfunctions.net/crearPreferenciaFunction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito, tiendaId }),
          }
        );

        const data = await response.json();

        if (!data.preferenceId) throw new Error("No se obtuvo preferenceId");

        await descontarStock();
        await registrarVentaEnCaja();
        vaciarCarrito();
        localStorage.removeItem("datosEnvioAnonimo");

        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;
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
                src={prod.imagen || "https://via.placeholder.com/40"}
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
