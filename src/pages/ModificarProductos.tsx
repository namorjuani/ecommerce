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
}

export default function ModificarProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"" | "asc" | "desc">("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const fetchProductos = async () => {
      const tiendaId = localStorage.getItem("userId");
      if (!tiendaId) return;
      const ref = collection(db, "tiendas", tiendaId, "productos");
      const q = query(ref);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ ...(doc.data() as Producto), id: doc.id }));
      setProductos(data);
    };
    fetchProductos();
  }, []);

  const editarCampo = (id: string, campo: keyof Producto, valor: any) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  const editarConModal = async (productoId: string, campo: keyof Producto, valorActual: string) => {
    const { value } = await Swal.fire({
      title: `Editar ${campo}`,
      input: "textarea",
      inputValue: valorActual,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        rows: "10",
        style: "width:100%; resize:vertical;"
      }
    });

    if (value !== undefined) {
      editarCampo(productoId, campo, value);
    }
  };

  const actualizarProducto = async (producto: Producto) => {
    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId || !producto.id) return;
    const ref = doc(db, "tiendas", tiendaId, "productos", producto.id);
    const { id, ...productoSinId } = producto;
    await updateDoc(ref, productoSinId as any);
    Swal.fire("Actualizado", "El producto fue actualizado correctamente", "success");
  };

  const eliminarProducto = async (id: string) => {
    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) return;
    const ref = doc(db, "tiendas", tiendaId, "productos", id);
    await deleteDoc(ref);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const eliminarSeleccionados = async () => {
    if (seleccionados.size === 0) return;

    const productosAEliminar = productos.filter(p => seleccionados.has(p.id));
    const nombres = productosAEliminar.map(p => p.nombre).join(", ");

    const confirmacion = await Swal.fire({
      title: `¿Eliminar ${productosAEliminar.length} producto(s)?`,
      text: `Se eliminarán: ${nombres}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) return;

    const promesas = productosAEliminar.map(p =>
      deleteDoc(doc(db, "tiendas", tiendaId, "productos", p.id))
    );

    await Promise.all(promesas);
    setProductos(prev => prev.filter(p => !seleccionados.has(p.id)));
    setSeleccionados(new Set());

    Swal.fire("Eliminado", `${productosAEliminar.length} producto(s) eliminados.`, "success");
  };

  const guardarSeleccionados = () => {
    productos.forEach((p) => {
      if (seleccionados.has(p.id)) actualizarProducto(p);
    });
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  };

  const seleccionarTodos = () => {
    setSeleccionados(new Set(productos.map(p => p.id)));
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
        <button onClick={seleccionarTodos}>Seleccionar todos</button>
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
              <th>Cod. barras</th>
              <th>Variantes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  {productosFiltrados.map((p) => (
    <tr key={p.id}>
      <td data-label="Seleccionar">
        <input
          className="casilla-seleccion"
          type="checkbox"
          checked={seleccionados.has(p.id)}
          onChange={() => toggleSeleccion(p.id)}
        />
      </td>
      <td data-label="Nombre">
        <textarea
          data-campo="nombre"
          value={p.nombre}
          readOnly
          onClick={async () => {
            const { value: nuevo } = await Swal.fire({
              title: "Editar nombre",
              input: "textarea",
              inputValue: p.nombre,
              showCancelButton: true,
              confirmButtonText: "Guardar",
              cancelButtonText: "Cancelar"
            });
            if (nuevo !== undefined) editarCampo(p.id, "nombre", nuevo);
          }}
        />
      </td>
      <td data-label="Precio">
        <textarea
          value={p.precio.toString()}
          onChange={(e) => editarCampo(p.id, "precio", +e.target.value)}
        />
      </td>
      <td data-label="Reserva">
        <textarea
          value={(p.precioReserva || 0).toString()}
          onChange={(e) => editarCampo(p.id, "precioReserva", +e.target.value)}
        />
      </td>
      <td data-label="Total">
        <textarea
          value={(p.precioTotal || 0).toString()}
          onChange={(e) => editarCampo(p.id, "precioTotal", +e.target.value)}
        />
      </td>
      <td data-label="Stock">
        <textarea
          value={p.stock.toString()}
          onChange={(e) => editarCampo(p.id, "stock", +e.target.value)}
        />
      </td>
      <td data-label="Cuotas">
        <textarea
          value={p.cuotas || ""}
          onChange={(e) => editarCampo(p.id, "cuotas", e.target.value)}
        />
      </td>
      <td data-label="Categoría">
        <textarea
          value={p.categoria}
          onChange={(e) => editarCampo(p.id, "categoria", e.target.value)}
        />
      </td>
      <td data-label="Tipo">
        <select
          value={p.tipo}
          onChange={(e) => editarCampo(p.id, "tipo", e.target.value as any)}
        >
          <option value="producto">Producto</option>
          <option value="servicio">Servicio</option>
        </select>
      </td>
      <td data-label="Envío Gratis">
        <input
          type="checkbox"
          checked={p.envioGratis || false}
          onChange={(e) => editarCampo(p.id, "envioGratis", e.target.checked)}
        />
      </td>
      <td data-label="Desc. corta">
        <textarea
          data-campo="descripcionCorta"
          value={p.descripcionCorta || ""}
          readOnly
          onClick={async () => {
            const { value: nuevo } = await Swal.fire({
              title: "Editar descripción corta",
              input: "textarea",
              inputValue: p.descripcionCorta || "",
              showCancelButton: true,
              confirmButtonText: "Guardar"
            });
            if (nuevo !== undefined) editarCampo(p.id, "descripcionCorta", nuevo);
          }}
        />
      </td>
      <td data-label="Desc. larga">
        <textarea
          data-campo="descripcionLarga"
          value={p.descripcionLarga || ""}
          readOnly
          onClick={async () => {
            const { value: nuevo } = await Swal.fire({
              title: "Editar descripción larga",
              input: "textarea",
              inputValue: p.descripcionLarga || "",
              showCancelButton: true,
              confirmButtonText: "Guardar"
            });
            if (nuevo !== undefined) editarCampo(p.id, "descripcionLarga", nuevo);
          }}
        />
      </td>
      <td data-label="Imagen">
        <textarea
          data-campo="imagen"
          value={p.imagen || ""}
          readOnly
          onClick={async () => {
            const { value: nuevo } = await Swal.fire({
              title: "Editar URL de imagen",
              input: "textarea",
              inputValue: p.imagen || "",
              showCancelButton: true,
              confirmButtonText: "Guardar"
            });
            if (nuevo !== undefined) editarCampo(p.id, "imagen", nuevo);
          }}
        />
      </td>
      <td data-label="Cod. barras">
        <textarea
          value={p.codigoBarras || ""}
          onChange={(e) => editarCampo(p.id, "codigoBarras", e.target.value)}
        />
      </td>
      <td data-label="Variantes">
        {p.variantes?.map((v, i) => (
          <div key={i}>
            <textarea
              value={v.nombre}
              onChange={(e) => {
                const nuevas = [...(p.variantes || [])];
                nuevas[i].nombre = e.target.value;
                editarCampo(p.id, "variantes", nuevas);
              }}
              placeholder="Nombre variante"
            />
            <textarea
              value={v.stock.toString()}
              onChange={(e) => {
                const nuevas = [...(p.variantes || [])];
                nuevas[i].stock = +e.target.value;
                editarCampo(p.id, "variantes", nuevas);
              }}
              placeholder="Stock"
            />
          </div>
        ))}
      </td>
      <td className="botones-producto" data-label="Acciones">
        <button
          className="boton-guardar"
          onClick={() => actualizarProducto(p)}
        >
          💾
        </button>
        <button
          className="boton-eliminar"
          onClick={() => eliminarProducto(p.id)}
        >
          🗑️
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}
