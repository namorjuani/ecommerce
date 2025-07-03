import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useCarrito } from "../context/CarritoContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  writeBatch,
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
  const { slug } = useParams();
  const { carrito, vaciarCarrito } = useCarrito();
  const { usuario, rol } = useAuth();
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    if (rol === "empleado") navigate(`/tienda/${slug}/empleado/forma-pago`);
  }, [rol, navigate, slug]);

  useEffect(() => {
    const loadConfig = async () => {
      const ref = doc(db, "tiendas", slug!);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: any = snap.data();
        setPublicKey(data.publicKeyMP || "");
      }
    };
    if (slug) loadConfig();
  }, [slug]);

  useEffect(() => {
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
    if (rol === "empleado") return;
    const clienteId = localStorage.getItem("clienteId");
    const datosAnonimos = localStorage.getItem("datosEnvioAnonimo");
    if (!clienteId && !datosAnonimos) {
      Swal.fire(
        "Faltan datos",
        "Por favor completá tus datos de envío antes de continuar",
        "warning"
      );
      navigate(`/tienda/${slug}/forma-entrega`);
    }
  }, [rol, navigate, slug]);

  const total = carrito.reduce((sum, prod) => sum + prod.precio * (prod.cantidad ?? 1), 0);

  const descontarStock = async () => {
    const batch = writeBatch(db);
    for (const item of carrito as ProductoCarrito[]) {
      const prodRef = doc(db, "tiendas", slug!, "productos", item.id);
      const snap = await getDoc(prodRef);
      if (!snap.exists()) continue;
      const data: any = snap.data();

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

  const guardarPedido = async () => {
    const clienteData = JSON.parse(localStorage.getItem("cliente") || "{}");
    const datosAnonimos = JSON.parse(localStorage.getItem("datosEnvioAnonimo") || "{}");
    const clienteFinal = clienteData.nombre ? clienteData : datosAnonimos;

    await addDoc(collection(db, "tiendas", slug!, "pedidos"), {
      productos: carrito,
      total,
      formaPago,
      cliente: clienteFinal,
      estado: "pendiente",
      creado: Timestamp.now()
    });
  };

  const finalizar = async () => {
    if (!formaPago) {
      return Swal.fire("Aviso", "Seleccioná una forma de pago", "info");
    }

    if (formaPago === "transferencia") {
      await guardarPedido();
      await descontarStock();
      Swal.fire("Gracias", "Te enviaremos los datos bancarios por WhatsApp", "info");
      vaciarCarrito();
      localStorage.removeItem("datosEnvioAnonimo");
      navigate(`/tienda/${slug}/compra-realizada`);
      return;
    }

    if (formaPago === "mercadopago") {
      Swal.fire({
        title: "Procesando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await fetch(
          "https://us-central1-applavaderoartesanal.cloudfunctions.net/crearPreferenciaFunction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito, tiendaId: slug })
          }
        );

        if (!response.ok) throw new Error("Error en la función");
        const data = await response.json();

        if (!data.preferenceId) throw new Error("No se obtuvo preferenceId");

        await guardarPedido();
        await descontarStock();
        vaciarCarrito();
        localStorage.removeItem("datosEnvioAnonimo");

        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo procesar el pago", "error");
      } finally {
        Swal.close();
      }
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "2rem" }}>
      <h2>Elegí tu forma de pago</h2>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 2 }}>
          <label>
            <input
              type="radio"
              name="pago"
              value="mercadopago"
              checked={formaPago === "mercadopago"}
              onChange={() => setFormaPago("mercadopago")}
            /> Mercado Pago
          </label>
          <label style={{ display: "block", marginTop: "1rem" }}>
            <input
              type="radio"
              name="pago"
              value="transferencia"
              checked={formaPago === "transferencia"}
              onChange={() => setFormaPago("transferencia")}
            /> Transferencia bancaria
          </label>
          <button
            onClick={finalizar}
            style={{
              marginTop: "1.5rem",
              backgroundColor: "#3483fa",
              color: "white",
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Finalizar
          </button>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            backgroundColor: "#f9f9f9"
          }}
        >
          <h3>Resumen de tu compra</h3>
          {carrito.map((prod, i) => (
            <div key={i} style={{ display: "flex", marginBottom: "0.5rem" }}>
              <img
                src={prod.imagen || "https://via.placeholder.com/40"}
                alt={prod.nombre}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "5px",
                  marginRight: "0.5rem"
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
