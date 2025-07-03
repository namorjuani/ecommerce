import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  Timestamp
} from "firebase/firestore";
import Swal from "sweetalert2";
import "../pages/css/ModificarProductos.css";

interface Variante {
  nombre: string;
  stock: number;
}

interface Producto {
  id: string;
  nombre: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  precio: number;
  precioReserva?: number;
  precioTotal?: number;
  stock: number;
  categoria: string;
  tipo: "producto" | "servicio";
  envioGratis?: boolean;
  cuotas?: string;
  variantes?: Variante[];
  imagen?: string;
  codigoBarras?: string;
  fechaCreacion?: Timestamp;
  videoYoutube?: string;
}

export default function ModificarProductos({ slug }: { slug: string }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"" | "asc" | "desc">("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProductos = async () => {
      const tiendaId = slug || localStorage.getItem("userId");
      if (!tiendaId) return;
      const ref = collection(db, "tiendas", tiendaId, "productos");
      const q = query(ref);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ ...(doc.data() as Producto), id: doc.id }));
      setProductos(data);
    };
    fetchProductos();
  }, [slug]);

  useEffect(() => {
  const wrapper = document.querySelector(".tabla-wrapper");
  if (!wrapper) return;

  const handleMouseMove = (e: MouseEvent) => {
    const { left, right } = wrapper.getBoundingClientRect();
    const scrollZone = 40;
    const scrollSpeed = 4;

    if (e.clientX > right - scrollZone) {
      wrapper.scrollLeft += scrollSpeed;
    } else if (e.clientX < left + scrollZone) {
      wrapper.scrollLeft -= scrollSpeed;
    }
  };

  document.addEventListener("mousemove", handleMouseMove);
  return () => document.removeEventListener("mousemove", handleMouseMove);
}, []);

  const editarCampo = (id: string, campo: keyof Producto, valor: any) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  const actualizarProducto = async (producto: Producto) => {
    const tiendaId = slug || localStorage.getItem("userId");
    if (!tiendaId || !producto.id) return;
    const ref = doc(db, "tiendas", tiendaId, "productos", producto.id);
    const { id, ...productoSinId } = producto;
    await updateDoc(ref, productoSinId as any);
    Swal.fire("Actualizado", "El producto fue actualizado correctamente", "success");
  };

  const eliminarProducto = async (id: string) => {
    const tiendaId = slug || localStorage.getItem("userId");
    if (!tiendaId) return;
    const ref = doc(db, "tiendas", tiendaId, "productos", id);
    await deleteDoc(ref);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const agregarVariante = (productoId: string) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId
          ? { ...p, variantes: [...(p.variantes || []), { nombre: "", stock: 0 }] }
          : p
      )
    );
  };

  const guardarSeleccionados = () => {
    productos.forEach((p) => {
      if (seleccionados.has(p.id)) actualizarProducto(p);
    });
  };

  const eliminarSeleccionados = async () => {
    if (seleccionados.size === 0) return;

    const confirmacion = await Swal.fire({
      title: `¿Eliminar ${seleccionados.size} producto(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    const tiendaId = slug || localStorage.getItem("userId");
    if (!tiendaId) return;

    const promesas = Array.from(seleccionados).map(id =>
      deleteDoc(doc(db, "tiendas", tiendaId, "productos", id))
    );

    await Promise.all(promesas);
    setProductos(prev => prev.filter(p => !seleccionados.has(p.id)));
    setSeleccionados(new Set());

    Swal.fire("Eliminado", "Productos eliminados correctamente", "success");
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  };

  const productosFiltrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    .filter((p) => p.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase()))
    .sort((a, b) => {
      if (ordenPrecio === "asc") return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  return (
    <div className="modificar-productos-container">
      <h2>Modificar productos existentes</h2>

      <div className="filtros-productos">
        <input placeholder="Buscar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        <input placeholder="Filtrar por categoría" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} />
        <select value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value as any)}>
          <option value="">Ordenar por precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
      </div>

      <div className="acciones-globales">
        <button onClick={() => setSeleccionados(new Set(productos.map(p => p.id)))}>Seleccionar todos</button>
        <button onClick={guardarSeleccionados}>💾 Guardar seleccionados</button>
        <button onClick={eliminarSeleccionados}>🗑️ Borrar seleccionados</button>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Reserva</th>
              <th>Total</th>
              <th>Stock</th>
              <th>Cuotas</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Envío Gratis</th>
              <th>Desc. corta</th>
              <th>Desc. larga</th>
              <th>Imagen</th>
              <th>Video YouTube</th>
              <th>Cod. barras</th>
              <th>Variantes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id}>
                <td data-label="✔️">
                  <input type="checkbox" checked={seleccionados.has(p.id)} onChange={() => toggleSeleccion(p.id)} />
                </td>
                <td data-label="Nombre">
                  <textarea value={p.nombre} onChange={(e) => editarCampo(p.id, "nombre", e.target.value)} data-campo="nombre" />
                </td>
                <td data-label="Precio">
                  <textarea value={p.precio.toString()} onChange={(e) => editarCampo(p.id, "precio", +e.target.value)} />
                </td>
                <td data-label="Reserva">
                  <textarea value={(p.precioReserva || 0).toString()} onChange={(e) => editarCampo(p.id, "precioReserva", +e.target.value)} />
                </td>
                <td data-label="Total">
                  <textarea value={(p.precioTotal || 0).toString()} onChange={(e) => editarCampo(p.id, "precioTotal", +e.target.value)} />
                </td>
                <td data-label="Stock">
                  <textarea value={p.stock.toString()} onChange={(e) => editarCampo(p.id, "stock", +e.target.value)} />
                </td>
                <td data-label="Cuotas">
                  <textarea value={p.cuotas || ""} onChange={(e) => editarCampo(p.id, "cuotas", e.target.value)} />
                </td>
                <td data-label="Categoría">
                  <textarea value={p.categoria} onChange={(e) => editarCampo(p.id, "categoria", e.target.value)} />
                </td>
                <td data-label="Tipo">
                  <select value={p.tipo} onChange={(e) => editarCampo(p.id, "tipo", e.target.value as any)}>
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </td>
                <td data-label="Envío Gratis">
                  <input type="checkbox" checked={p.envioGratis || false} onChange={(e) => editarCampo(p.id, "envioGratis", e.target.checked)} />
                </td>
                <td data-label="Desc. corta">
                  <textarea value={p.descripcionCorta || ""} onChange={(e) => editarCampo(p.id, "descripcionCorta", e.target.value)} data-campo="descripcionCorta" />
                </td>
                <td data-label="Desc. larga">
                  <textarea value={p.descripcionLarga || ""} onChange={(e) => editarCampo(p.id, "descripcionLarga", e.target.value)} data-campo="descripcionLarga" />
                </td>
                <td data-label="Imagen">
                  <textarea value={p.imagen || ""} onChange={(e) => editarCampo(p.id, "imagen", e.target.value)} data-campo="imagen" />
                </td>
                <td data-label="Video YouTube">
                  <textarea value={p.videoYoutube || ""} onChange={(e) => editarCampo(p.id, "videoYoutube", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                </td>
                <td data-label="Cod. barras">
                  <textarea value={p.codigoBarras || ""} onChange={(e) => editarCampo(p.id, "codigoBarras", e.target.value)} />
                </td>
                <td data-label="Variantes">
                  {p.variantes?.map((v, i) => (
                    <div key={i} style={{ marginBottom: "0.3rem" }}>
                      <textarea value={v.nombre} onChange={(e) => {
                        const nuevas = [...(p.variantes || [])];
                        nuevas[i].nombre = e.target.value;
                        editarCampo(p.id, "variantes", nuevas);
                      }} placeholder="Nombre variante" />
                      <textarea value={v.stock.toString()} onChange={(e) => {
                        const nuevas = [...(p.variantes || [])];
                        nuevas[i].stock = +e.target.value;
                        editarCampo(p.id, "variantes", nuevas);
                      }} placeholder="Stock" />
                    </div>
                  ))}
                  <button onClick={() => agregarVariante(p.id)}>➕ Variante</button>
                </td>
                <td data-label="Acciones" className="botones-producto">
                  <button className="boton-guardar" onClick={() => actualizarProducto(p)}>💾</button>
                  <button className="boton-eliminar" onClick={() => eliminarProducto(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
