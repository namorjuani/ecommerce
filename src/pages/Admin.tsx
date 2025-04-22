import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
  tipo: "producto" | "servicio";
}

export default function Admin() {
  const { usuario } = useAuth();

  const [nombre, setNombre] = useState("Mi Tienda");
  const [descripcion, setDescripcion] = useState("Bienvenidos a mi tienda");
  const [imagen, setImagen] = useState("https://via.placeholder.com/600x300");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    nombre: "",
    precio: 0,
    imagen: "",
    stock: 1,
    tipo: "producto",
  });

  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  useEffect(() => {
    if (!usuario) return;

    const cargarProductos = async () => {
      const ref = collection(db, "tiendas", usuario.uid, "productos");
      const snapshot = await getDocs(ref);
      const lista: Producto[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Producto),
      }));
      setProductos(lista);
    };

    cargarProductos();
  }, [usuario]);

  const guardarProducto = async () => {
    if (!usuario) return;
    const ref = collection(db, "tiendas", usuario.uid, "productos");
    await addDoc(ref, nuevoProducto);
    setNuevoProducto({ nombre: "", precio: 0, imagen: "", stock: 1, tipo: "producto" });

    const snapshot = await getDocs(ref);
    const lista: Producto[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Producto),
    }));
    setProductos(lista);
  };

  const eliminarProducto = async (id: string) => {
    if (!usuario) return;
    const ref = doc(db, "tiendas", usuario.uid, "productos", id);
    await deleteDoc(ref);
    setProductos(productos.filter((p) => p.id !== id));
  };

  const actualizarProducto = async () => {
    if (!usuario || !productoEditando?.id) return;
    const ref = doc(db, "tiendas", usuario.uid, "productos", productoEditando.id);
    await updateDoc(ref, {
      nombre: productoEditando.nombre,
      precio: productoEditando.precio,
      imagen: productoEditando.imagen,
      stock: productoEditando.stock,
      tipo: productoEditando.tipo,
    });

    const nuevos = productos.map((p) =>
      p.id === productoEditando.id ? productoEditando : p
    );
    setProductos(nuevos);
    setProductoEditando(null);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Panel de edición</h2>
        <Link to="/">
          <button>Volver a la tienda</button>
        </Link>
      </div>

      {/* Datos generales de la tienda */}
      <label>Nombre de la tienda:</label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <label>Descripción principal:</label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={{ width: "100%", height: "100px", marginBottom: "1rem" }}
      />

      <label>URL de la imagen principal:</label>
      <input
        type="text"
        value={imagen}
        onChange={(e) => setImagen(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <div style={{ marginTop: "2rem" }}>
        <h3>Vista previa:</h3>
        <h1>{nombre}</h1>
        <p>{descripcion}</p>
        <img
          src={imagen}
          alt="Imagen destacada"
          style={{ width: "100%", borderRadius: "10px" }}
        />
      </div>

      {/* Agregar nuevo producto */}
      <hr style={{ margin: "2rem 0" }} />
      <h3>Nuevo producto</h3>
      <input
        placeholder="Nombre"
        value={nuevoProducto.nombre}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        type="number"
        placeholder="Precio"
        value={nuevoProducto.precio}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        placeholder="Imagen (URL)"
        value={nuevoProducto.imagen}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        type="number"
        placeholder="Stock"
        value={nuevoProducto.stock}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: Number(e.target.value) })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <select
        value={nuevoProducto.tipo}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, tipo: e.target.value as "producto" | "servicio" })}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="producto">Producto</option>
        <option value="servicio">Servicio</option>
      </select>
      <button onClick={guardarProducto}>Guardar producto</button>

      {/* Lista de productos */}
      <h3 style={{ marginTop: "2rem" }}>Tus productos:</h3>
      {productos.map((p) =>
        productoEditando?.id === p.id ? (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <input
              value={productoEditando.nombre}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, nombre: e.target.value })
              }
              placeholder="Nombre"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              type="number"
              value={productoEditando.precio}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, precio: Number(e.target.value) })
              }
              placeholder="Precio"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              value={productoEditando.imagen}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, imagen: e.target.value })
              }
              placeholder="Imagen"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              type="number"
              value={productoEditando.stock}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, stock: Number(e.target.value) })
              }
              placeholder="Stock"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <select
              value={productoEditando.tipo}
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, tipo: e.target.value as "producto" | "servicio" })
              }
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
            <button onClick={actualizarProducto}>Guardar</button>
            <button onClick={() => setProductoEditando(null)} style={{ marginLeft: "1rem" }}>
              Cancelar
            </button>
          </div>
        ) : (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h4>{p.nombre}</h4>
            <img src={p.imagen} alt={p.nombre} style={{ width: "100%", borderRadius: "10px" }} />
            <p>Precio: ${p.precio}</p>
            <p>Stock: {p.stock}</p>
            <p>Tipo: {p.tipo}</p>
            <button
              onClick={() => setProductoEditando(p)}
              style={{
                backgroundColor: "orange",
                color: "white",
                border: "none",
                padding: "0.3rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "0.5rem",
              }}
            >
              Editar
            </button>
            <button
              onClick={() => eliminarProducto(p.id!)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "0.3rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        )
      )}
    </div>
  );
}
