// src/pages/Admin.tsx
import "./css/Admin.css";
import ImportadorCSV from "./ImportadorCSV";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
import { deleteDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import VistaPreviaTienda from "../Components/VistaPreviaTienda";
import UbicacionTienda from "../Components/UbicacionTienda";
import EsteticaCategorias from "../Components/EsteticaCategorias";
import ResumenCajasAdmin from "../Components/empleados/ResumenCajasAdmin";
import ModificarProductos from "./ModificarProductos";




interface Reserva {
  id?: string;
  clienteNombre: string;
  productoNombre: string;
  fecha: string; // "YYYY-MM-DD"
  hora: string;  // "10:00", "11:00", etc.
  estado: "pendiente" | "aceptado" | "rechazado";
}

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
  precioReserva?: number;
  precioTotal?: number;
  codigoBarras?: string;
}
[];


export default function Admin() {



  const [productos, setProductos] = useState<any[]>([]);
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();
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
    precioReserva: 0,
    precioTotal: 0,

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
  const [reservas, setReservas] = useState<any[]>([]);
  const [aceptarReservasAuto, setAceptarReservasAuto] = useState(false);
  const [whatsappReservas, setWhatsappReservas] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [instagram, setInstagram] = useState("");
  const [textoUbicacion, setTextoUbicacion] = useState("");

  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [posicionBanner, setPosicionBanner] = useState("center");
  const [tamañoBanner, setTamañoBanner] = useState("cover");

  const [linkInstagram, setLinkInstagram] = useState("");
  const [linkFacebook, setLinkFacebook] = useState("");

  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState("");
  const [aliasMp, setAliasMp] = useState("");
  const [cbu, setCbu] = useState("");
  const [aliasBancario, setAliasBancario] = useState("");


  const cellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
  };

  const btnStyle = (color: "green" | "red") => ({
    backgroundColor: color === "green" ? "#4CAF50" : "red",
    color: "white",
    border: "none",
    padding: "10px 14px",
    fontSize: "1.1rem",
    borderRadius: "6px",
    marginRight: "6px",
    cursor: "pointer",
  });


  const editarCampo = (id: string, campo: string, valor: any) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  const tiendaId = localStorage.getItem("userId") || "";


  useEffect(() => {
    if (rol && rol !== "admin") {
      navigate("/"); // redirige si no es admin
    }
  }, [rol, navigate]);

  useEffect(() => {
    
    if (!usuario) return;

    const cargarDatos = async () => {
      const configRef = doc(db, "tiendas", usuario.uid);
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        const data = configSnap.data();

        setMercadoPagoToken(data.mercadoPagoToken || "");
        setMercadoPagoPublicKey(data.mercadoPagoPublicKey || "");
        setAliasMp(data.aliasMp || "");
        setCbu(data.cbu || "");
        setAliasBancario(data.aliasBancario || "");

        setWhatsappReservas(data.whatsappReservas || "");
        setAceptarReservasAuto(data.aceptarReservasAuto || false);
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

        setLinkInstagram(data.linkInstagram || "");
        setLinkFacebook(data.linkFacebook || "");
        setGoogleMaps(data.googleMaps || "");
        setInstagram(data.instagram || "");
        setFacebook(data.facebook || "");
        setTiktok(data.tiktok || "");
        setPosicionBanner(data.posicionBanner || "center");
        setTamañoBanner(data.tamañoBanner || "cover");
        setTextoUbicacion(data.textoUbicacion || "");
      }
    };

    cargarDatos();
  }, [usuario]);




  const cargarReservas = async () => {
    if (!usuario) return;
    const reservasRef = collection(db, "tiendas", usuario.uid, "reservas");
    const reservasSnap = await getDocs(reservasRef);
    const reservasData = reservasSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReservas(reservasData as any); // podés tipar mejor si tenés la interfaz
  };

  cargarReservas();

  const cambiarEstadoReserva = async (id: string, nuevoEstado: "aceptado" | "rechazado") => {
    if (!usuario || !id) return;
    const ref = doc(db, "tiendas", usuario.uid, "reservas", id);
    await updateDoc(ref, { estado: nuevoEstado });
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
  };



  const guardarConfiguracion = async () => {
    if (!usuario) return;
    const ref = doc(db, "tiendas", usuario.uid);
    await setDoc(
      ref,
      {
        logo,
        nombre,
        descripcion,
        imagenPrincipal: imagen,
        textoHero,
        whatsapp,
        colorFondo,
        colorBoton,
        googleMaps,
        instagram,
        facebook,
        tiktok,
        posicionBanner,
        tamañoBanner,
        textoUbicacion,
        linkInstagram,
        linkFacebook,
        mercadoPagoToken,
        mercadoPagoPublicKey,
        aliasMp,
        cbu,
        aliasBancario,

      },
      { merge: true }
    );
    alert("✅ Configuración guardada correctamente.");
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
      codigoBarras: nuevo.codigoBarras || "",
      variantes: [],
    });
  };

  const actualizarProducto = async (producto: Producto) => {
    if (!usuario || !producto.id) return;
    const ref = doc(db, "tiendas", usuario.uid, "productos", producto.id);
    const { id, ...data } = producto;
    await updateDoc(ref, data);
    Swal.fire({
      icon: "success",
      title: "Producto actualizado",
      text: "Los cambios se guardaron correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  };


  const deleteProduct = async (productId: string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed && usuario) {
      const ref = doc(db, "tiendas", usuario.uid, "productos", productId);
      await deleteDoc(ref);
      setProductos((prev) => prev.filter((p) => p.id !== productId));
      Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
    }
  };



  const productosFiltrados = productos
    .filter((p) =>
      p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
    )
    .filter((p) =>
      filtroCategoria
        ? (p.categoria || "").toLowerCase().includes(filtroCategoria.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (ordenPrecio === "asc") return a.precio - b.precio;
      if (ordenPrecio === "desc") return b.precio - a.precio;
      return 0;
    });

  const categorias = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

  if (!usuario || rol !== "admin") {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando...</p>;
  }
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de administración</h2>
        <Link to="/"><button>Volver a la tienda</button></Link>
        <Link to="/admin/pedidos"><button>Ver pedidos</button></Link>
      </div>

      {/* 🧭 Menú de navegación */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
        {["productos", "reservas", "empleados", "cajas", "estetica", "notificaciones", "pagos", "ayuda"].map((seccion) => (
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

      {seccionActiva === "pagos" && (
        <>
          <h3>⚙️ Configuración de pagos</h3>

          <label style={{ fontWeight: "bold" }}>🔑 Access Token de Mercado Pago:</label>
          <input
            value={mercadoPagoToken}
            onChange={(e) => setMercadoPagoToken(e.target.value)}
            placeholder="access_token_xxx"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <label style={{ fontWeight: "bold" }}>🔓 Public Key de Mercado Pago:</label>
          <input
            value={mercadoPagoPublicKey}
            onChange={(e) => setMercadoPagoPublicKey(e.target.value)}
            placeholder="public_key_xxx"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <label style={{ fontWeight: "bold" }}>📲 Alias de Mercado Pago (para cobrar):</label>
          <input
            value={aliasMp}
            onChange={(e) => setAliasMp(e.target.value)}
            placeholder="tu.alias.mercadopago"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <label style={{ fontWeight: "bold" }}>🏦 CBU para transferencia bancaria:</label>
          <input
            value={cbu}
            onChange={(e) => setCbu(e.target.value)}
            placeholder="0000003100000001234567"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <label style={{ fontWeight: "bold" }}>🏦 Alias bancario:</label>
          <input
            value={aliasBancario}
            onChange={(e) => setAliasBancario(e.target.value)}
            placeholder="mi.alias.banco"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <button
            onClick={guardarConfiguracion}
            style={{
              marginTop: "1rem",
              backgroundColor: "#4caf50",
              color: "white",
              padding: "0.7rem 1.2rem",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            💾 Guardar configuración
          </button>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
            Podés obtener tus credenciales desde{" "}
            <a
              href="https://www.mercadopago.com.ar/developers/panel"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mercado Pago Developers
            </a>
          </p>
        </>
      )}


      {seccionActiva === "empleados" && (
        <>
          <h3>👨‍💼 Gestión de empleados</h3>
          <p>Creá empleados que puedan usar el punto de venta presencial</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "600px", marginBottom: "1rem" }}>
            <input id="empleado-nombre" placeholder="Nombre del empleado" />
            <input id="empleado-correo" placeholder="Correo del empleado" />
          </div>

          <button
            onClick={async () => {
              const nombre = (document.getElementById("empleado-nombre") as HTMLInputElement).value;
              const correo = (document.getElementById("empleado-correo") as HTMLInputElement).value;

              if (!nombre || !correo) {
                alert("Completá ambos campos");
                return;
              }

              const ref = doc(db, "usuarios", correo); // usamos el correo como ID
              await setDoc(ref, {
                rol: "empleado",
                nombre,
                email: correo,
                tiendaId: usuario?.uid || "",

              });

              alert("Empleado creado correctamente (debe iniciar sesión con Google)");
            }}
            style={{ backgroundColor: "#3483fa", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "6px", cursor: "pointer" }}
          >
            ➕ Crear empleado
          </button>

          <p style={{ marginTop: "1rem", color: "#666" }}>
            El empleado debe iniciar sesión con Google desde <strong>/login</strong>. Será redirigido automáticamente a su panel.
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
            <label>Código de barras (opcional):</label>
            <input
              type="text"
              value={nuevo.codigoBarras || ""}
              onChange={(e) =>
                setNuevo((prev) => ({
                  ...prev,
                  codigoBarras: e.target.value,
                }))
              }
              placeholder="Ej. 7791234567890"
              style={{ width: "100%", marginBottom: "1rem", padding: "0.4rem" }}
            />
            <label>Nombre
              <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
            </label>
            {nuevo.tipo === "producto" && (
              <label>Precio
                <input
                  type="number"
                  value={nuevo.precio}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, precio: Number(e.target.value) })
                  }

                />
              </label>

            )}

            {nuevo.tipo === "servicio" && (
              <>
                <label>Precio de reserva
                  <input
                    type="number"
                    value={nuevo.precioReserva || 0}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, precioReserva: Number(e.target.value) })
                    }
                  />
                </label>
                <label>Precio total del servicio
                  <input
                    type="number"
                    value={nuevo.precioTotal || 0}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, precioTotal: Number(e.target.value) })
                    }
                  />
                </label>
              </>
            )}



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

<ModificarProductos />

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
            <label style={{ display: "block", marginTop: "1rem" }}>
              Color de fondo:
              <input
                type="color"
                value={colorFondo}
                onChange={(e) => setColorFondo(e.target.value)}
                style={{ marginLeft: "1rem", border: "none", background: "none" }}
              />
            </label>
            <label>Color de botones
              <input type="color" value={colorBoton} onChange={(e) => setColorBoton(e.target.value)} />
            </label>

            <label>Link de Instagram:</label>
            <input
              type="text"
              value={linkInstagram}
              onChange={(e) => setLinkInstagram(e.target.value)}
              placeholder="https://instagram.com/tu_tienda"
            />

            <label>Link de Facebook:</label>
            <input
              type="text"
              value={linkFacebook}
              onChange={(e) => setLinkFacebook(e.target.value)}
              placeholder="https://facebook.com/tu_tienda"
            />

            <EsteticaCategorias />
            <label>
              Mapa (iframe de Google Maps)
              <textarea
                value={googleMaps}
                onChange={(e) => setGoogleMaps(e.target.value)}
                placeholder="<iframe src='https://www.google.com/maps/embed?...'></iframe>"
                style={{ width: "100%", height: "120px", marginBottom: "0.5rem" }}
              />
              <small style={{ color: "#555" }}>
                📍 Para mostrar el mapa de tu tienda, ingresá a{" "}
                <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>, buscá tu local, tocá en <strong>Compartir</strong> → <strong>Incorporar un mapa</strong> y copiá el código que empieza con <code>&lt;iframe...</code>. Pegalo acá tal cual.
              </small>
              <label>
                Texto informativo junto al mapa
                <textarea
                  value={textoUbicacion}
                  onChange={(e) => setTextoUbicacion(e.target.value)}
                  placeholder="Nos encontramos en el centro de la ciudad. Vení a visitarnos o hacé tu pedido desde casa."
                  style={{ width: "100%", height: "100px", marginBottom: "0.5rem" }}
                />
              </label>

            </label>
            <label>Posición del banner (e.g. 'center', 'top')
              <input value={posicionBanner} onChange={(e) => setPosicionBanner(e.target.value)} />
            </label>
            <label>Tamaño del banner (e.g. 'cover', 'contain')
              <input value={tamañoBanner} onChange={(e) => setTamañoBanner(e.target.value)} />
            </label>
          </div>

          <button
            onClick={guardarConfiguracion}
            style={{
              marginTop: "1.5rem",
              backgroundColor: "#3483fa",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            💾 Guardar configuración
          </button>

          {/* Vista previa en vivo */}
          <VistaPreviaTienda
            logo={logo}
            nombre={nombre}
            descripcion={descripcion}
            imagen={imagen}
            textoHero={textoHero}
            colorFondo={colorFondo}
            colorBoton={colorBoton}
            instagram={instagram}
            facebook={facebook}
            tiktok={tiktok}
            googleMaps={googleMaps}
            posicionBanner={posicionBanner}
            tamañoBanner={tamañoBanner}
          />

        </>
      )}



      {/* 🔔 Sección: Notificaciones */}

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

      {/*      {seccionActiva === "pagos" && (
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
      )} */}
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

      {seccionActiva === "reservas" && (
        <>
          <>
            <h3>📅 Reservas de servicios</h3>
            <p>Acá podés ver, aceptar o rechazar las reservas realizadas por los clientes.</p>

            {/* 📱 Configuración de WhatsApp y autoaceptación */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label>
                Número de WhatsApp para recibir reservas:
                <input
                  type="text"
                  value={whatsappReservas}
                  onChange={(e) => setWhatsappReservas(e.target.value)}
                  placeholder="Ej: 5491123456789"
                  style={{ width: "100%", marginBottom: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>

              <button
                onClick={async () => {
                  if (!usuario) return;
                  const ref = doc(db, "tiendas", usuario.uid);
                  await updateDoc(ref, { whatsappReservas });
                  console.log("✅ Número de WhatsApp guardado:", whatsappReservas);
                  alert("Número de WhatsApp guardado");
                }}
                style={{
                  marginBottom: "1rem",
                  backgroundColor: "#3483fa",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                💾 Guardar número
              </button>


              <div style={{ marginTop: "0.5rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={aceptarReservasAuto}
                    onChange={(e) => setAceptarReservasAuto(e.target.checked)}
                  />
                  Aceptar automáticamente las reservas
                </label>
              </div>

              <button
                onClick={guardarConfiguracion}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#3483fa",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                💾 Guardar número
              </button>
            </div>

            {/* ✅ Lista de reservas */}
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th style={cellStyle}>Cliente</th>
                    <th style={cellStyle}>Servicio</th>
                    <th style={cellStyle}>Fecha</th>
                    <th style={cellStyle}>Hora</th>
                    <th style={cellStyle}>Estado</th>
                    <th style={cellStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((reserva, index) => (
                    <tr key={index}>
                      <td style={cellStyle}>{reserva.clienteNombre}</td>
                      <td style={cellStyle}>{reserva.productoNombre}</td>
                      <td style={cellStyle}>{reserva.fecha}</td>
                      <td style={cellStyle}>{reserva.hora}</td>
                      <td style={cellStyle}>{reserva.estado}</td>
                      <td style={cellStyle}>
                        <button
                          style={btnStyle("green")}
                          onClick={() => {
                            cambiarEstadoReserva(reserva.id, "aceptado");

                            const aceptarAuto = aceptarReservasAuto;
                            if (!aceptarAuto && reserva.telefono) {
                              const mensaje = `Hola ${reserva.clienteNombre}, tu turno para ${reserva.productoNombre} fue confirmado para el ${reserva.fecha} a las ${reserva.hora}. ¡Gracias por reservar!`;

                              // ✅ Limpiar y formatear número
                              let numero = whatsappReservas.replace(/\D/g, ""); // solo números

                              if (!numero.startsWith("549")) {
                                if (numero.startsWith("54")) {
                                  numero = "549" + numero.slice(2); // ya tiene 54 pero falta 9
                                } else if (numero.startsWith("9")) {
                                  numero = "54" + numero; // ya tiene 9 pero falta 54
                                } else {
                                  numero = "549" + numero; // no tiene ni 54 ni 9
                                }
                              }

                              const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
                              console.log("📲 Link generado:", url);
                              window.open(url, "_blank");
                            }
                          }}
                        >
                          Aceptar
                        </button>
                        <button
                          style={btnStyle("red")}
                          onClick={() => cambiarEstadoReserva(reserva.id, "rechazado")}
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </>

        </>
      )}
      {seccionActiva === "cajas" && <ResumenCajasAdmin />}

    </div>
  );
}