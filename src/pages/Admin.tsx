import "./css/Admin.css";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";

interface Producto {
  id?: string;
  nombre: string;
  precio: number;
  imagen: string;
  imagenes?: string[];
  descripcion?: string;
  descripcionCorta?: string;
  cuotas?: string;
  envioGratis?: boolean;
  color?: string;
  stock: number;
  tipo: "producto" | "servicio";
}

export default function Admin() {
  const { usuario } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevo, setNuevo] = useState<Producto>({
    nombre: "",
    precio: 0,
    imagen: "",
    imagenes: [],
    descripcion: "",
    descripcionCorta: "",
    cuotas: "",
    envioGratis: false,
    color: "",
    stock: 0,
    tipo: "producto",
  });

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [logo, setLogo] = useState("");
  const [textoHero, setTextoHero] = useState("");
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [colorBoton, setColorBoton] = useState("#000000");
  const [whatsapp, setWhatsapp] = useState("");

  // 📬 Notificaciones
  const [correoNotificacion, setCorreoNotificacion] = useState("");
  const [whatsappNotificacion, setWhatsappNotificacion] = useState("");
  const [recibirPorCorreo, setRecibirPorCorreo] = useState(false);
  const [recibirPorWhatsapp, setRecibirPorWhatsapp] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      const configRef = doc(db, "tiendas", usuario.uid);
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setImagen(data.imagen || "");
        setLogo(data.logo || "");
        setTextoHero(data.textoHero || "");
        setColorFondo(data.colorFondo || "#ffffff");
        setColorBoton(data.colorBoton || "#000000");
        setWhatsapp(data.whatsapp || "");
        setCorreoNotificacion(data.correoNotificacion || "");
        setWhatsappNotificacion(data.whatsappNotificacion || "");
        setRecibirPorCorreo(data.recibirPorCorreo || false);
        setRecibirPorWhatsapp(data.recibirPorWhatsapp || false);
      }

      const productosRef = collection(db, "tiendas", usuario.uid, "productos");
      const snapshot = await getDocs(productosRef);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Producto[];
      setProductos(lista);
    };

    cargarDatos();
  }, [usuario]);

  const guardarConfiguracion = async () => {
    if (!usuario) return;
    const ref = doc(db, "tiendas", usuario.uid);
    await setDoc(
      ref,
      {
        nombre,
        descripcion,
        imagen,
        logo,
        textoHero,
        colorFondo,
        colorBoton,
        whatsapp,
        correoNotificacion,
        whatsappNotificacion,
        recibirPorCorreo,
        recibirPorWhatsapp,
      },
      { merge: true }
    );
    alert("Configuración guardada");
  };

  const guardarProductoNuevo = async () => {
    if (!usuario) return;
    const ref = collection(db, "tiendas", usuario.uid, "productos");
  
    const productoLimpio = {
      nombre: nuevo.nombre,
      precio: nuevo.precio,
      imagen: nuevo.imagen,
      imagenes: nuevo.imagenes || [],
      descripcion: nuevo.descripcion || "",
      descripcionCorta: nuevo.descripcionCorta || "",
      cuotas: nuevo.cuotas || "",
      envioGratis: nuevo.envioGratis,
      color: nuevo.color || "",
      stock: nuevo.stock,
      tipo: nuevo.tipo,
    };
  
    await addDoc(ref, productoLimpio as any);

    alert("Producto agregado");
  
    setNuevo({
      nombre: "",
      precio: 0,
      imagen: "",
      imagenes: [],
      descripcion: "",
      descripcionCorta: "",
      cuotas: "",
      envioGratis: false,
      color: "",
      stock: 0,
      tipo: "producto",
    });
  };
  
  

  const actualizarProducto = async (producto: Producto) => {
    if (!usuario || !producto.id) return;
    const ref = doc(db, "tiendas", usuario.uid, "productos", producto.id);
    const { id, ...productoSinId } = producto;
await updateDoc(ref, productoSinId);

  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de administración</h2>
        <Link to="/"><button>Volver a la tienda</button></Link>
        <Link to="/admin/pedidos"><button>Ver pedidos</button></Link>
      </div>

      <h3>Configuración visual de la tienda</h3>
      <input placeholder="Logo (URL)" value={logo} onChange={(e) => setLogo(e.target.value)} />
      <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <input placeholder="Imagen principal" value={imagen} onChange={(e) => setImagen(e.target.value)} />
      <input placeholder="Texto principal (Hero)" value={textoHero} onChange={(e) => setTextoHero(e.target.value)} />
      <input placeholder="WhatsApp para contacto flotante" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      <label>Color de fondo: <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} /></label>
      <label>Color de botones: <input type="color" value={colorBoton} onChange={(e) => setColorBoton(e.target.value)} /></label>

      <h3>Notificaciones de pedidos</h3>
      <input placeholder="Correo para notificación de pedidos" value={correoNotificacion} onChange={(e) => setCorreoNotificacion(e.target.value)} />
      <input placeholder="WhatsApp para notificación de pedidos" value={whatsappNotificacion} onChange={(e) => setWhatsappNotificacion(e.target.value)} />
      <label>
        <input type="checkbox" checked={recibirPorCorreo} onChange={(e) => setRecibirPorCorreo(e.target.checked)} />
        Recibir pedidos por correo
      </label>
      <label>
        <input type="checkbox" checked={recibirPorWhatsapp} onChange={(e) => setRecibirPorWhatsapp(e.target.checked)} />
        Recibir pedidos por WhatsApp
      </label>

      <button onClick={guardarConfiguracion}>Guardar configuración</button>

      <h3>Agregar producto</h3>
      <input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
      <input placeholder="Precio" type="number" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })} />
      <input placeholder="Imagen" value={nuevo.imagen} onChange={(e) => setNuevo({ ...nuevo, imagen: e.target.value })} />
      <input placeholder="Imágenes (separadas por coma)" onChange={(e) => setNuevo({ ...nuevo, imagenes: e.target.value.split(",") })} />
      <textarea placeholder="Descripción larga" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
      <input placeholder="Descripción corta" value={nuevo.descripcionCorta} onChange={(e) => setNuevo({ ...nuevo, descripcionCorta: e.target.value })} />
      <input placeholder="Cuotas" value={nuevo.cuotas} onChange={(e) => setNuevo({ ...nuevo, cuotas: e.target.value })} />
      <label>
        Envío gratis:
        <input type="checkbox" checked={nuevo.envioGratis} onChange={(e) => setNuevo({ ...nuevo, envioGratis: e.target.checked })} />
      </label>
      <input placeholder="Color" value={nuevo.color} onChange={(e) => setNuevo({ ...nuevo, color: e.target.value })} />
      <input placeholder="Stock" type="number" value={nuevo.stock} onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })} />
      <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value as "producto" | "servicio" })}>
        <option value="producto">Producto</option>
        <option value="servicio">Servicio</option>
      </select>
      <button onClick={guardarProductoNuevo}>Agregar producto</button>

      <h3>Modificar productos</h3>
      {productos.map((producto) => (
        <div key={producto.id} className="producto-card">
          <p><strong>{producto.nombre}</strong></p>
          <input value={producto.nombre} onChange={(e) => setProductos((prev) => prev.map((p) => p.id === producto.id ? { ...p, nombre: e.target.value } : p))} />
          <input type="number" value={producto.precio} onChange={(e) => setProductos((prev) => prev.map((p) => p.id === producto.id ? { ...p, precio: Number(e.target.value) } : p))} />
          <input type="number" value={producto.stock} onChange={(e) => setProductos((prev) => prev.map((p) => p.id === producto.id ? { ...p, stock: Number(e.target.value) } : p))} />
          <button onClick={() => actualizarProducto(producto)}>Guardar cambios</button>
        </div>
      ))}
    </div>
  );
}
