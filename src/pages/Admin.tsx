// src/pages/Admin.tsx
import "./css/Admin.css";
import ImportadorCSV from "./ImportadorCSV";
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
  categoria?: string;
  variantes?: {
    nombre: string;
    stock: number;
  }[];
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
    categoria: "",
    variantes: [],
  });

  const [seccionActiva, setSeccionActiva] = useState("productos");

  const [filtroNombre, setFiltroNombre] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"" | "asc" | "desc">("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [logo, setLogo] = useState("");
  const [textoHero, setTextoHero] = useState("");
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [colorBoton, setColorBoton] = useState("#000000");
  const [whatsapp, setWhatsapp] = useState("");

  const [correoNotificacion, setCorreoNotificacion] = useState("");
  const [whatsappNotificacion, setWhatsappNotificacion] = useState("");
  const [recibirPorCorreo, setRecibirPorCorreo] = useState(false);
  const [recibirPorWhatsapp, setRecibirPorWhatsapp] = useState(false);
  const [mercadoPagoToken, setMercadoPagoToken] = useState("");
  const [publicKeyMP, setPublicKeyMP] = useState("");

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
        setMercadoPagoToken(data.mercadoPagoToken || "");
        setPublicKeyMP(data.publicKeyMP || "");
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
    await setDoc(ref, {
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
      mercadoPagoToken,
      publicKeyMP,
    }, { merge: true });
    alert("Configuración guardada");
  };

  const guardarProductoNuevo = async () => {
    if (!usuario) return;
    const ref = collection(db, "tiendas", usuario.uid, "productos");
    await addDoc(ref, nuevo as any);
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
      categoria: "",
      variantes: [],
    });
  };

  const actualizarProducto = async (producto: Producto) => {
    if (!usuario || !producto.id) return;
    const ref = doc(db, "tiendas", usuario.uid, "productos", producto.id);
    const { id, ...data } = producto;
    await updateDoc(ref, data);
  };

  const productosFiltrados = productos
    .filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    .filter(p => filtroCategoria ? p.categoria === filtroCategoria : true)
    .sort((a, b) => {
      if (ordenPrecio === "asc") return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  const categorias = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de administración</h2>
        <Link to="/"><button>Volver a la tienda</button></Link>
        <Link to="/admin/pedidos"><button>Ver pedidos</button></Link>
      </div>

      {/* 🧭 Menú de navegación */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
        {["productos", "estetica", "notificaciones", "pagos", "ayuda"].map((seccion) => (
  <button
    key={seccion}
    onClick={() => setSeccionActiva(seccion)}
    style={{
      backgroundColor: seccionActiva === seccion ? "#3483fa" : "#eee",
      color: seccionActiva === seccion ? "#fff" : "#000",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    {seccion.charAt(0).toUpperCase() + seccion.slice(1)}
  </button>
))}
      </div>

  { seccionActiva === "pagos" && (
  <>
    <h3>Configuración de pagos</h3>

    <label>Access Token de Mercado Pago (privado)</label>
    <input
      value={mercadoPagoToken}
      onChange={(e) => setMercadoPagoToken(e.target.value)}
      placeholder="ACCESS_TOKEN"
      style={{ width: "100%", marginBottom: "1rem" }}
    />

    <label>Public Key de Mercado Pago (pública)</label>
    <input
      value={publicKeyMP}
      onChange={(e) => setPublicKeyMP(e.target.value)}
      placeholder="PUBLIC_KEY"
      style={{ width: "100%", marginBottom: "1rem" }}
    />

    <button onClick={guardarConfiguracion} style={{ backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
      💾 Guardar configuración
    </button>

    <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
      Podés obtener tus claves desde:{" "}
      <a
        href="https://www.mercadopago.com.ar/developers/panel/app/3047697102060940/credentials/sandbox"
        target="_blank"
        rel="noopener noreferrer"
      >
        Mercado Pago Developers
      </a>
    </p>
  </>
)}


      {/* 🛒 Sección: Productos */}
      {seccionActiva === "productos" && (
        <>
        {/* 📁 Importador de productos por CSV */}
<ImportadorCSV limite={50} />

          <h3>Agregar producto nuevo</h3>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
  <label>Nombre
    <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
  </label>
  <label>Precio
    <input type="number" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })} />
  </label>
  <label>Imagen principal
    <input value={nuevo.imagen} onChange={(e) => setNuevo({ ...nuevo, imagen: e.target.value })} />
  </label>
  <label>Otras imágenes (separar URLs con coma)
    <input value={nuevo.imagenes?.join(",") || ""} onChange={(e) => setNuevo({ ...nuevo, imagenes: e.target.value.split(",") })} />
  </label>
  <label>Descripción larga
    <textarea value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
  </label>
  <label>Descripción corta
    <input value={nuevo.descripcionCorta} onChange={(e) => setNuevo({ ...nuevo, descripcionCorta: e.target.value })} />
  </label>
  <label>Cuotas
    <input value={nuevo.cuotas} onChange={(e) => setNuevo({ ...nuevo, cuotas: e.target.value })} />
  </label>
  <label>Envío gratis
    <input type="checkbox" checked={nuevo.envioGratis} onChange={(e) => setNuevo({ ...nuevo, envioGratis: e.target.checked })} />
  </label>
  <label>Color
    <input value={nuevo.color} onChange={(e) => setNuevo({ ...nuevo, color: e.target.value })} />
  </label>
  <label>Stock base
    <input type="number" value={nuevo.stock} onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })} />
  </label>
  <label>Categoría
    <input value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} />
  </label>
  <label>Tipo
    <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value as "producto" | "servicio" })}>
      <option value="producto">Producto</option>
      <option value="servicio">Servicio</option>
    </select>
  </label>
</div>

{/* 🆕 Variantes */}
<div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
  <h4>Variantes del producto (opcional)</h4>
  <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
    <input placeholder="Nombre variante (ej: 1.62cm)" id="variante-nombre" />
    <input placeholder="Stock" type="number" id="variante-stock" />
    <button
      type="button"
      onClick={() => {
        const nombre = (document.getElementById("variante-nombre") as HTMLInputElement).value;
        const stock = parseInt((document.getElementById("variante-stock") as HTMLInputElement).value);
        if (nombre && !isNaN(stock)) {
          setNuevo(prev => ({
            ...prev,
            variantes: [...(prev.variantes || []), { nombre, stock }]
          }));
          (document.getElementById("variante-nombre") as HTMLInputElement).value = "";
          (document.getElementById("variante-stock") as HTMLInputElement).value = "";
        }
      }}
      style={{ backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "5px", cursor: "pointer" }}
    >
      ➕ Añadir variante
    </button>
  </div>

  {nuevo.variantes?.length ? (
    <ul>
      {nuevo.variantes.map((v, index) => (
        <li key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span>{v.nombre} → Stock: {v.stock}</span>
          <button
            type="button"
            onClick={() => setNuevo(prev => ({
              ...prev,
              variantes: prev.variantes?.filter((_, i) => i !== index)
            }))}
            style={{ backgroundColor: "red", color: "white", border: "none", padding: "0.2rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  ) : <p style={{ fontSize: "0.9rem", color: "#555" }}>No hay variantes añadidas.</p>}
</div>

          <button onClick={guardarProductoNuevo} style={{ marginBottom: "2rem", backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
            ➕ Agregar producto
          </button>

          <h3>Modificar productos existentes</h3>
          {/* Tabla clara y alineada */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Nombre</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Precio</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Stock</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Categoría</th>
                <th style={{ padding: "8px", border: "1px solid #ccc" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <input value={p.nombre} onChange={(e) => setProductos((prev) => prev.map((x) => x.id === p.id ? { ...x, nombre: e.target.value } : x))} />
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <input type="number" value={p.precio} onChange={(e) => setProductos((prev) => prev.map((x) => x.id === p.id ? { ...x, precio: Number(e.target.value) } : x))} />
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <input type="number" value={p.stock} onChange={(e) => setProductos((prev) => prev.map((x) => x.id === p.id ? { ...x, stock: Number(e.target.value) } : x))} />
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <input value={p.categoria || ""} onChange={(e) => setProductos((prev) => prev.map((x) => x.id === p.id ? { ...x, categoria: e.target.value } : x))} />
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <button onClick={() => actualizarProducto(p)} style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                      💾 Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* 🎨 Sección: Estética */}
      {seccionActiva === "estetica" && (
        <>
          <h3>Configuración visual de la tienda</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>Logo (URL)
              <input value={logo} onChange={(e) => setLogo(e.target.value)} />
            </label>
            <label>Nombre de la tienda
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label>Descripción de la tienda
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </label>
            <label>Imagen principal (URL)
              <input value={imagen} onChange={(e) => setImagen(e.target.value)} />
            </label>
            <label>Texto principal (Hero)
              <input value={textoHero} onChange={(e) => setTextoHero(e.target.value)} />
            </label>
            <label>WhatsApp para contacto
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </label>
            <label>Color de fondo
              <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} />
            </label>
            <label>Color de botones
              <input type="color" value={colorBoton} onChange={(e) => setColorBoton(e.target.value)} />
            </label>
          </div>
          <button onClick={guardarConfiguracion} style={{ marginTop: "1.5rem", backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
            💾 Guardar configuración
          </button>
        </>
      )}


{ seccionActiva === "pagos" && (
    <>
      <h3>Configuración de pagos</h3>
      <p>Ingresá tu token de acceso de Mercado Pago (Access Token):</p>
      <input
        value={mercadoPagoToken}
        onChange={(e) => setMercadoPagoToken(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={guardarConfiguracion}>💾 Guardar token</button>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
        Podés obtener tu access token desde:{" "}
        <a
          href="https://www.mercadopago.com.ar/developers/panel/app/3047697102060940/credentials/sandbox"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mercado Pago Developers
        </a>
      </p>
    </>
  )}

      {/* 🔔 Sección: Notificaciones */}
      {seccionActiva === "notificaciones" && (
        <>
          <h3>Configuración de notificaciones de pedidos</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>Correo de notificación
              <input value={correoNotificacion} onChange={(e) => setCorreoNotificacion(e.target.value)} />
            </label>
            <label>WhatsApp para notificación
              <input value={whatsappNotificacion} onChange={(e) => setWhatsappNotificacion(e.target.value)} />
            </label>
            <label>
              <input type="checkbox" checked={recibirPorCorreo} onChange={(e) => setRecibirPorCorreo(e.target.checked)} />
              Recibir notificación por correo
            </label>
            <label>
              <input type="checkbox" checked={recibirPorWhatsapp} onChange={(e) => setRecibirPorWhatsapp(e.target.checked)} />
              Recibir notificación por WhatsApp
            </label>
          </div>
        </>
      )}

      {/* ❓ Sección: Ayuda */}
      {seccionActiva === "ayuda" && (
        <>
          <h3>Ayuda para el administrador</h3>
          <ul style={{ lineHeight: "1.8" }}>
            <li>📦 Para agregar productos, completá los datos y presioná "Agregar producto".</li>
            <li>✏️ Para modificar productos, cambiá los valores y hacé clic en "Guardar".</li>
            <li>🎨 En "Estética", personalizá colores, logo, imágenes y textos de tu tienda.</li>
            <li>🔔 En "Notificaciones", podés recibir alertas de pedidos al correo o WhatsApp.</li>
            <li>🛒 Los filtros de productos te permiten buscar fácilmente lo que necesitás editar.</li>
          </ul>
        </>
      )}
    </div> 
  );
}
