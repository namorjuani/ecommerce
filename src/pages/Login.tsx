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

  // 📝 No usamos el useEffect para redireccionar automáticamente porque el flujo está controlado en handleLoginGoogle
  useEffect(() => {
    // Si en algún momento querés redireccionar automáticamente a alguien logueado, podrías hacerlo acá.
  }, [usuario, rol]);

  const handleLoginGoogle = async () => {
    try {
      // 🔑 Login con Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔎 Buscar documento del usuario en Firestore
      const ref = doc(db, "usuarios", user.email!);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("❌ El usuario no tiene documento en Firestore");
        return navigate("/");  // O podrías redirigir a una página de registro
      }

      const data = snap.data();

      // 👨‍🔧 Si es empleado
      if (data.rol === "empleado") {
        localStorage.setItem("userId", data.tiendaId);
        const tiendaId = data.tiendaId;
        const empleado = user.displayName || "Empleado";
        const fechaHoy = new Date().toISOString().split("T")[0];

        // 🔍 Verificar si ya hay caja abierta
        const cajasRef = collection(db, "tiendas", tiendaId, "cajas");
        const q = query(
          cajasRef,
          where("fecha", "==", fechaHoy),
          where("empleado", "==", empleado),
          where("cerrada", "==", false)
        );

        const snapCaja = await getDocs(q);

        if (snapCaja.empty) {
          // 💬 Preguntar si desea abrir caja
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
              cerrada: false,
            });

            await Swal.fire(
              "✅ Caja abierta",
              "La caja se abrió correctamente.",
              "success"
            );
          }
        }

        return navigate("/");  // 🔄 Ir al home o dashboard de empleado
      }

      // 👑 Si es admin
      if (data.rol === "admin") {
        // 🔍 Buscar tiendas donde es admin
        const q = query(
          collection(db, "tiendas"),
          where("adminEmail", "==", user.email)
        );
        const tiendasSnap = await getDocs(q);
        const tiendas = tiendasSnap.docs.map(doc => ({ id: doc.id }));

        console.log("🔥 Tiendas encontradas:", tiendas);

        if (tiendas.length === 1) {
          localStorage.setItem("userId", tiendas[0].id);
          return navigate(`/admin/${tiendas[0].id}`);
        } else if (tiendas.length > 1) {
          return navigate("/seleccionar-tienda");
        } else {
          return Swal.fire("⚠️", "No sos administrador de ninguna tienda.", "info");
        }
      }

      // 🌐 Cualquier otro rol
      navigate("/");

    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
      Swal.fire("❌ Error", "No se pudo completar el inicio de sesión.", "error");
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
