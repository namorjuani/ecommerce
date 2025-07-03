import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminEmpleados({ slug }: { slug: string }) {
  const crearEmpleado = async () => {
    const nombre = prompt("Nombre del empleado");
    const email = prompt("Correo del empleado");
    if (!nombre || !email) return;
    await setDoc(doc(db, "usuarios", email), {
      nombre,
      email,
      rol: "empleado",
      tiendaId: slug,
    });
    alert("Empleado creado");
  };

  return (
    <div>
      <h3>Gestión de empleados</h3>
      <button onClick={crearEmpleado}>➕ Crear empleado</button>
    </div>
  );
}
