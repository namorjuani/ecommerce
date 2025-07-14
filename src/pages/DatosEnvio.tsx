import { useEffect, useState } from "react";
import { useCliente } from "../context/ClienteContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function DatosEnvio() {
  const { cliente } = useCliente();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      if (!slug || !cliente) return;
      const ref = doc(db, "tiendas", slug, "clientes", cliente.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const datosFirestore = snap.data();
        setDatos(datosFirestore);
        localStorage.setItem("cliente", JSON.stringify(datosFirestore)); // ✅ Guarda actualizado
      }
    };
    fetchDatos();
  }, [cliente, slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    if (!slug || !cliente) return;
    const ref = doc(db, "tiendas", slug, "clientes", cliente.uid);
    await setDoc(ref, datos);
    localStorage.setItem("cliente", JSON.stringify(datos)); // ✅ Guarda actualizado
    setEditando(false);
    navigate(`/tienda/${slug}`); // ✅ Vuelve al inicio tras guardar
  };

  if (!datos) return <p style={{ textAlign: "center", marginTop: "2rem" }}>No hay datos cargados.</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2>Datos de envío</h2>

      <label>Nombre:</label>
      <input type="text" name="nombre" value={datos.nombre || ""} onChange={handleChange} disabled={!editando} />

      <label>DNI:</label>
      <input type="text" name="dni" value={datos.dni || ""} onChange={handleChange} disabled={!editando} />

      <label>Dirección:</label>
      <input type="text" name="direccion" value={datos.direccion || ""} onChange={handleChange} disabled={!editando} />

      <label>Teléfono:</label>
      <input type="text" name="telefono" value={datos.telefono || ""} onChange={handleChange} disabled={!editando} />

      <label>Email:</label>
      <input type="text" name="email" value={datos.email || ""} onChange={handleChange} disabled={!editando} />

      <div style={{ marginTop: "1rem" }}>
        {editando ? (
          <button onClick={guardarCambios}>Guardar cambios</button>
        ) : (
          <button onClick={() => setEditando(true)}>Editar</button>
        )}
      </div>
    </div>
  );
}
