import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function CompraRealizada() {
  const navigate = useNavigate();

  useEffect(() => {
    const descontarStock = async () => {
      const carritoData = localStorage.getItem("carrito");
      const userId = localStorage.getItem("userId");
      if (!carritoData || !userId) return;

      const carrito = JSON.parse(carritoData);

      for (const prod of carrito) {
        const ref = doc(db, "tiendas", userId, "productos", prod.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const datos = snap.data();
          const stockActual = datos.stock || 0;
          const nuevoStock = Math.max(0, stockActual - (prod.cantidad || 1));

          await updateDoc(ref, { stock: nuevoStock });
        }
      }

      localStorage.removeItem("carrito"); // Limpia el carrito
    };

    descontarStock();

    Swal.fire({
      icon: "success",
      title: "¡Compra realizada!",
      text: "Gracias por tu compra. Serás redirigido al inicio.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });

    const timeout = setTimeout(() => {
      navigate("/");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <p>Redirigiendo al inicio...</p>
      <button
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#3483fa",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Ir al inicio ahora
      </button>
    </div>
  );
}
