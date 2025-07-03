import { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminReservas({ slug }: { slug: string }) {
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;

    const cargar = async () => {
      const ref = collection(db, "tiendas", slug, "reservas");
      const snap = await getDocs(ref);
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReservas(lista);
    };

    cargar();
  }, [slug]);

  const cambiarEstado = async (id: string, estado: string) => {
    await updateDoc(doc(db, "tiendas", slug, "reservas", id), { estado });
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado } : r))
    );
  };

  return (
    <div>
      <h2>Reservas</h2>
      {/* Renderizar reservas */}
    </div>
  );
}
