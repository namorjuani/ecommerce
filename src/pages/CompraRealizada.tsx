import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ usamos useParams
import Swal from "sweetalert2";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function CompraRealizada() {
  const navigate = useNavigate();
  const { slug } = useParams(); // ✅ obtenemos slug de la URL

  useEffect(() => {
    const descontarStock = async () => {
      const carritoData = localStorage.getItem("carrito");
      if (!carritoData || !slug) return;

      const carrito = JSON.parse(carritoData);

      // 🔄 Recorremos el carrito y actualizamos el stock en Firestore
      for (const prod of carrito) {
        const ref = doc(db, "tiendas", slug, "productos", prod.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const datos = snap.data();
          const stockActual = datos.stock || 0;
          const nuevoStock = Math.max(0, stockActual - (prod.cantidad || 1));

          await updateDoc(ref, { stock: nuevoStock });
        }
      }

      localStorage.removeItem("carrito"); // ⚡ Limpiamos el carrito después de la compra
    };

    descontarStock();

    // 🎉 Mostramos un mensaje de éxito y redirigimos
    Swal.fire({
      icon: "success",
      title: "¡Compra realizada!",
      text: "Gracias por tu compra. Serás redirigido al inicio.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });

    const timeout = setTimeout(() => {
      if (slug) {
        navigate(`/tienda/${slug}`); // ✅ Respetamos el slug en la redirección
      } else {
        navigate("/");
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [navigate, slug]);

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
        onClick={() => {
          if (slug) {
            navigate(`/tienda/${slug}`);
          } else {
            navigate("/");
          }
        }}
      >
        Ir al inicio ahora
      </button>
    </div>
  );
}
