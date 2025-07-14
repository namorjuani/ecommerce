import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";

interface Empleado {
  nombre: string;
  email: string;
  rol: string;
}

export default function AdminEmpleados({ slug }: { slug: string }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const cargarEmpleados = async () => {
    const ref = collection(db, "tiendas", slug, "usuarios");
    const snap = await getDocs(ref);
    const lista: Empleado[] = snap.docs
      .map((d) => d.data() as Empleado)
      .filter((emp) => emp.rol === "empleado");
    setEmpleados(lista);
  };

  useEffect(() => {
    cargarEmpleados();
  }, [slug]);

  const crearEmpleado = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Nuevo empleado",
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo" />
        <input id="swal-email" class="swal2-input" placeholder="Correo electrónico" />
      `,
      focusConfirm: false,
      confirmButtonText: "Guardar",
      preConfirm: () => {
        return {
          nombre: (document.getElementById("swal-nombre") as HTMLInputElement)?.value,
          email: (document.getElementById("swal-email") as HTMLInputElement)?.value,
        };
      },
    });

    if (!formValues?.nombre || !formValues?.email) {
      Swal.fire("Campos incompletos", "Debes completar todos los campos.", "error");
      return;
    }

    await setDoc(doc(db, "tiendas", slug, "usuarios", formValues.email), {
      nombre: formValues.nombre,
      email: formValues.email,
      rol: "empleado",
    });

    Swal.fire("Empleado creado", "", "success");
    cargarEmpleados();
  };

  const eliminarEmpleado = async (email: string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este empleado será eliminado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      await deleteDoc(doc(db, "tiendas", slug, "usuarios", email));
      Swal.fire("Empleado eliminado", "", "success");
      cargarEmpleados();
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h3>👨‍🔧 Gestión de empleados</h3>
      <button
        onClick={crearEmpleado}
        style={{
          backgroundColor: "#3483fa",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        ➕ Crear empleado
      </button>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {empleados.map((emp) => (
          <li
            key={emp.email}
            style={{
              border: "1px solid #ddd",
              padding: "0.7rem",
              borderRadius: "6px",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0 }}>
                <strong>{emp.nombre}</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{emp.email}</p>
            </div>
            <button
              onClick={() => eliminarEmpleado(emp.email)}
              style={{
                backgroundColor: "crimson",
                color: "white",
                padding: "0.3rem 0.7rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {empleados.length === 0 && <p>No hay empleados registrados aún.</p>}
    </div>
  );
}
