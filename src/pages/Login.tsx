// src/pages/Login.tsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";

const provider = new GoogleAuthProvider();

export default function Login() {
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();

  useEffect(() => {
    if (!usuario) return;

    if (rol === "admin") navigate("/admin");
    else if (rol === "empleado") navigate("/");
    else navigate("/");
  }, [usuario, rol, navigate]);

  const handleLoginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const ref = doc(db, "usuarios", user.email!);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem("userId", data.tiendaId);
        console.log("🔥 TIENDA ID:", data.tiendaId);

        if (data.rol === "empleado") {
          const tiendaId = data.tiendaId;
          const empleado = user.displayName || "Empleado";
          const fechaHoy = new Date().toISOString().split("T")[0];

          const cajasRef = collection(db, "tiendas", tiendaId, "cajas");
          const q = query(
            cajasRef,
            where("fecha", "==", fechaHoy),
            where("empleado", "==", empleado),
            where("cerrada", "==", false) // 🔧 solo cajas abiertas
          );

          const snapCaja = await getDocs(q);

          if (snapCaja.empty) {
            const { isConfirmed, value } = await Swal.fire({
              title: "¿Deseás abrir una nueva caja?",
              input: "number",
              inputLabel: "Efectivo inicial",
              inputPlaceholder: "Ej: 5000",
              showCancelButton: true,
              confirmButtonText: "Abrir caja",
              cancelButtonText: "Cancelar",
            });

            if (isConfirmed && value !== null) {
              await addDoc(cajasRef, {
                fecha: fechaHoy,
                creado: Timestamp.now(),
                empleado,
                efectivoInicial: Number(value),
                totalEfectivo: 0,
                totalMp: 0,
                totalTransferencia: 0,
                ventasTotales: 0,
                cerrada: false // ✅ importante para el filtro
              });

              await Swal.fire(
                "✅ Caja abierta",
                "La caja se abrió correctamente.",
                "success"
              );
            }
          }

          navigate("/");
        } else if (user.email === "namor.juanignacio@gmail.com") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        console.warn("❌ El usuario no tiene documento en Firestore");
        navigate("/");
      }
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
      <h2>Iniciar sesión</h2>
      <button onClick={handleLoginGoogle} className="login-btn">
        Ingresar con Google
      </button>
    </div>
  );
}
