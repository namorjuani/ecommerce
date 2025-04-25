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
  getDoc,
  setDoc
} from "firebase/firestore";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  imagenes?: string[];
  descripcion?: string;
  cuotas?: string;
  envioGratis?: boolean;
  color?: string;
  stock: number;
  tipo: "producto" | "servicio";
}

export default function Admin() {
  const { usuario } = useAuth();

  const [nombre, setNombre] = useState("Mi Tienda");
  const [descripcion, setDescripcion] = useState("Bienvenidos a mi tienda");
  const [imagen, setImagen] = useState("https://via.placeholder.com/600x300");
  const [textoHero, setTextoHero] = useState("¡Bienvenido a nuestra tienda!");
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [colorBoton, setColorBoton] = useState("#000000");
  const [whatsapp, setWhatsapp] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    nombre: "",
    precio: 0,
    imagen: "",
    imagenes: [],
    descripcion: "",
    cuotas: "",
    envioGratis: false,
    color: "",
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

      const configRef = doc(db, "tiendas", usuario.uid, "configuracion", "estilos");
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setTextoHero(data.textoHero || "¡Bienvenido a nuestra tienda!");
        setColorFondo(data.colorFondo || "#ffffff");
        setColorBoton(data.colorBoton || "#000000");
        setWhatsapp(data.whatsapp || "");
      }
    };

    cargarProductos();
  }, [usuario]);

  const guardarConfiguracion = async () => {
    if (!usuario) return;
    const ref = doc(db, "tiendas", usuario.uid, "configuracion", "estilos");
    await setDoc(ref, {
      textoHero,
      colorFondo,
      colorBoton,
      whatsapp,
    });
    alert("Configuración visual guardada");
  };

  const guardarProducto = async () => {
    if (!usuario) return;
    const ref = collection(db, "tiendas", usuario.uid, "productos");
    await addDoc(ref, nuevoProducto);
    setNuevoProducto({
      nombre: "",
      precio: "",
      imagen: "",
      imagenes: [],
      descripcion: "",
      cuotas: "",
      envioGratis: false,
      color: "",
      stock: 1,
      tipo: "producto",
    });

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
    await updateDoc(ref, productoEditando);
    const nuevos = productos.map((p) => (p.id === productoEditando.id ? productoEditando : p));
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

      <h3>Configuración visual</h3>
      <label>Título principal:</label>
      <input
        type="text"
        value={textoHero}
        onChange={(e) => setTextoHero(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <label>WhatsApp:</label>
      <input
        type="text"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <label>Color de fondo:</label>
      <input
        type="color"
        value={colorFondo}
        onChange={(e) => setColorFondo(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <label>Color de botones:</label>
      <input
        type="color"
        value={colorBoton}
        onChange={(e) => setColorBoton(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={guardarConfiguracion} style={{ marginBottom: "2rem" }}>Guardar configuración</button>

      <h3>Nuevo producto</h3>
      <input
        placeholder="Nombre"
        value={nuevoProducto.nombre}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <textarea
        placeholder="Descripción"
        value={nuevoProducto.descripcion}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem", height: "60px" }}
      />
      <input
        type="text"
        placeholder="Imagen principal (URL)"
        value={nuevoProducto.imagen}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Otras imágenes (separadas por coma)"
        value={nuevoProducto.imagenes?.join(",") || ""}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagenes: e.target.value.split(",") })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Cuotas"
        value={nuevoProducto.cuotas || ""}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, cuotas: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Color"
        value={nuevoProducto.color || ""}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, color: e.target.value })}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        <input
          type="checkbox"
          checked={nuevoProducto.envioGratis || false}
          onChange={(e) => setNuevoProducto({ ...nuevoProducto, envioGratis: e.target.checked })}
        /> ¿Envío gratis?
      </label>
      <input
        type="number"
        placeholder="Precio"
        value={nuevoProducto.precio}
        onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
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

      <h3 style={{ marginTop: "2rem" }}>Tus productos:</h3>
      {productos.map((p) =>
        productoEditando?.id === p.id ? (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <input
              value={productoEditando.nombre}
              onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              placeholder="Nombre"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <textarea
              value={productoEditando.descripcion}
              onChange={(e) => setProductoEditando({ ...productoEditando, descripcion: e.target.value })}
              placeholder="Descripción"
              style={{ width: "100%", marginBottom: "0.5rem", height: "60px" }}
            />
            <input
              value={productoEditando.imagen}
              onChange={(e) => setProductoEditando({ ...productoEditando, imagen: e.target.value })}
              placeholder="Imagen"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              value={productoEditando.imagenes?.join(",") || ""}
              onChange={(e) => setProductoEditando({ ...productoEditando, imagenes: e.target.value.split(",") })}
              placeholder="Otras imágenes"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              value={productoEditando.cuotas || ""}
              onChange={(e) => setProductoEditando({ ...productoEditando, cuotas: e.target.value })}
              placeholder="Cuotas"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              value={productoEditando.color || ""}
              onChange={(e) => setProductoEditando({ ...productoEditando, color: e.target.value })}
              placeholder="Color"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              <input
                type="checkbox"
                checked={productoEditando.envioGratis || false}
                onChange={(e) => setProductoEditando({ ...productoEditando, envioGratis: e.target.checked })}
              /> ¿Envío gratis?
            </label>
            <input
              type="number"
              value={productoEditando.precio}
              onChange={(e) => setProductoEditando({ ...productoEditando, precio: Number(e.target.value) })}
              placeholder="Precio"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              type="number"
              value={productoEditando.stock}
              onChange={(e) => setProductoEditando({ ...productoEditando, stock: Number(e.target.value) })}
              placeholder="Stock"
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <select
              value={productoEditando.tipo}
              onChange={(e) => setProductoEditando({ ...productoEditando, tipo: e.target.value as "producto" | "servicio" })}
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
            <button onClick={actualizarProducto}>Guardar</button>
            <button onClick={() => setProductoEditando(null)} style={{ marginLeft: "1rem" }}>Cancelar</button>
          </div>
        ) : (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h4>{p.nombre}</h4>
            <img src={p.imagen} alt={p.nombre} style={{ width: "100%", borderRadius: "10px" }} />
            <p>Precio: ${p.precio}</p>
            <p>Stock: {p.stock}</p>
            <p>Tipo: {p.tipo}</p>
            <button onClick={() => setProductoEditando(p)} style={{ marginRight: "0.5rem" }}>Editar</button>
            <button onClick={() => eliminarProducto(p.id!)} style={{ backgroundColor: "red", color: "white" }}>Eliminar</button>
          </div>
        )
      )}
    </div>
  );
}
