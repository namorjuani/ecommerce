import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
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

  const handleLoginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 👉 Buscamos en todas las tiendas si es empleado
      const tiendasSnap = await getDocs(collection(db, "tiendas"));
      let empleadoEncontrado = false;

      for (const tienda of tiendasSnap.docs) {
        const ref = doc(db, "tiendas", tienda.id, "usuarios", user.email!);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          if (data.rol === "empleado") {
            localStorage.setItem("userId", tienda.id);

            const empleado = user.displayName || "Empleado";
            const fechaHoy = new Date().toISOString().split("T")[0];
            const cajasRef = collection(db, "tiendas", tienda.id, "cajas");
            const q = query(
              cajasRef,
              where("fecha", "==", fechaHoy),
              where("empleado", "==", empleado),
              where("cerrada", "==", false)
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
                  cerrada: false,
                });
                await Swal.fire("✅ Caja abierta", "La caja se abrió correctamente.", "success");
              }
            }

            empleadoEncontrado = true;
            return navigate("/");
          }
        }
      }

      if (!empleadoEncontrado) {
        // 🔍 Si no es empleado, revisar si es admin
        const q = query(collection(db, "tiendas"), where("adminEmail", "==", user.email));
        const tiendasSnap = await getDocs(q);
        const tiendas = tiendasSnap.docs.map((doc) => ({ id: doc.id }));

        if (tiendas.length === 1) {
          localStorage.setItem("userId", tiendas[0].id);
          return navigate(`/admin/${tiendas[0].id}`);
        } else if (tiendas.length > 1) {
          return navigate("/seleccionar-tienda");
        } else {
          return Swal.fire("⚠️", "No sos administrador de ninguna tienda.", "info");
        }
      }

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
