import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    Timestamp,
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
        const fetchItems = async () => {
            const tiendaId = slug || localStorage.getItem("userId");
            if (!tiendaId) return;

            const colecciones = ["productos", "servicios"];

            let items: Producto[] = [];

            for (const coleccion of colecciones) {
                const ref = collection(db, "tiendas", tiendaId, coleccion);
                const q = query(ref);
                const snapshot = await getDocs(q);

                const data = snapshot.docs.map((doc) => {
                    const item = doc.data();
                    return {
                        ...item,
                        tipo: coleccion === "productos" ? "producto" : "servicio",
                        id: doc.id,
                    } as Producto;
                });

                items = [...items, ...data];
            }

            setProductos(items);
        };

        fetchItems();
    }, [slug]);

    const editarCampo = (id: string, campo: keyof Producto, valor: any) => {
        setProductos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
        );
    };

    const actualizarProducto = async (producto: Producto) => {
        const tiendaId = slug || localStorage.getItem("userId");
        if (!tiendaId || !producto.id) return;

        const coleccionOriginal = producto.tipo === "producto" ? "servicios" : "productos";
        const coleccionNueva = producto.tipo === "producto" ? "productos" : "servicios";

        // Borro de la colección anterior (por si cambió de tipo)
        try {
            await deleteDoc(doc(db, "tiendas", tiendaId, coleccionOriginal, producto.id));
        } catch (e) {
            console.log("No existía en la colección anterior, no hay problema.");
        }

        // Guardo en la nueva colección con el mismo ID
        await setDoc(
            doc(db, "tiendas", tiendaId, coleccionNueva, producto.id),
            { ...producto }
        );

        Swal.fire("Actualizado", "El item fue actualizado correctamente", "success");

        setProductos((prev) =>
            prev.map((p) => (p.id === producto.id ? { ...producto } : p))
        );
    };

    const eliminarProducto = async (producto: Producto) => {
        const tiendaId = slug || localStorage.getItem("userId");
        if (!tiendaId) return;
        const ref = doc(
            db,
            "tiendas",
            tiendaId,
            producto.tipo === "producto" ? "productos" : "servicios",
            producto.id
        );
        await deleteDoc(ref);
        setProductos((prev) => prev.filter((p) => p.id !== producto.id));
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
            title: `¿Eliminar ${seleccionados.size} item(s)?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;

        const tiendaId = slug || localStorage.getItem("userId");
        if (!tiendaId) return;

        const promesas = Array.from(seleccionados).map((id) => {
            const producto = productos.find((p) => p.id === id);
            if (!producto) return;
            return deleteDoc(
                doc(
                    db,
                    "tiendas",
                    tiendaId,
                    producto.tipo === "producto" ? "productos" : "servicios",
                    id
                )
            );
        });

        await Promise.all(promesas);
        setProductos((prev) => prev.filter((p) => !seleccionados.has(p.id)));
        setSeleccionados(new Set());

        Swal.fire("Eliminado", "Items eliminados correctamente", "success");
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
            <h2>Modificar productos y servicios existentes</h2>

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
                <button onClick={() => setSeleccionados(new Set(productos.map((p) => p.id)))}>Seleccionar todos</button>
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
                                <td><input type="checkbox" checked={seleccionados.has(p.id)} onChange={() => toggleSeleccion(p.id)} /></td>
                                <td><textarea value={p.nombre} onChange={(e) => editarCampo(p.id, "nombre", e.target.value)} /></td>
                                <td><textarea value={p.precio.toString()} onChange={(e) => editarCampo(p.id, "precio", +e.target.value)} /></td>
                                <td><textarea value={(p.precioReserva || 0).toString()} onChange={(e) => editarCampo(p.id, "precioReserva", +e.target.value)} /></td>
                                <td><textarea value={(p.precioTotal || 0).toString()} onChange={(e) => editarCampo(p.id, "precioTotal", +e.target.value)} /></td>
                                <td><textarea value={p.stock.toString()} onChange={(e) => editarCampo(p.id, "stock", +e.target.value)} /></td>
                                <td><textarea value={p.cuotas || ""} onChange={(e) => editarCampo(p.id, "cuotas", e.target.value)} /></td>
                                <td><textarea value={p.categoria} onChange={(e) => editarCampo(p.id, "categoria", e.target.value)} /></td>
                                <td>
                                    <select value={p.tipo} onChange={(e) => editarCampo(p.id, "tipo", e.target.value as "producto" | "servicio")}>
                                        <option value="producto">Producto</option>
                                        <option value="servicio">Servicio</option>
                                    </select>
                                </td>
                                <td><input type="checkbox" checked={p.envioGratis || false} onChange={(e) => editarCampo(p.id, "envioGratis", e.target.checked)} /></td>
                                <td><textarea value={p.descripcionCorta || ""} onChange={(e) => editarCampo(p.id, "descripcionCorta", e.target.value)} /></td>
                                <td><textarea value={p.descripcionLarga || ""} onChange={(e) => editarCampo(p.id, "descripcionLarga", e.target.value)} /></td>
                                <td><textarea value={p.imagen || ""} onChange={(e) => editarCampo(p.id, "imagen", e.target.value)} /></td>
                                <td><textarea value={p.videoYoutube || ""} onChange={(e) => editarCampo(p.id, "videoYoutube", e.target.value)} /></td>
                                <td><textarea value={p.codigoBarras || ""} onChange={(e) => editarCampo(p.id, "codigoBarras", e.target.value)} /></td>
                                <td>
                                    {p.variantes?.map((v, i) => (
                                        <div key={i}>
                                            <textarea value={v.nombre} onChange={(e) => {
                                                const nuevas = [...(p.variantes || [])];
                                                nuevas[i].nombre = e.target.value;
                                                editarCampo(p.id, "variantes", nuevas);
                                            }} />
                                            <textarea value={v.stock.toString()} onChange={(e) => {
                                                const nuevas = [...(p.variantes || [])];
                                                nuevas[i].stock = +e.target.value;
                                                editarCampo(p.id, "variantes", nuevas);
                                            }} />
                                        </div>
                                    ))}
                                    <button onClick={() => agregarVariante(p.id)}>➕ Variante</button>
                                </td>
                                <td>
                                    <button className="boton-guardar" onClick={() => actualizarProducto(p)}>💾</button>
                                    <button className="boton-eliminar" onClick={() => eliminarProducto(p)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
