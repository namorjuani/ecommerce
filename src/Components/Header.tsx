import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCliente } from "../context/ClienteContext";
import BarraBusqueda from "./BarraBusqueda";
import BotonCarritoHeader from "./BotonCarritoHeader";
import CajaModalEmpleado from "./empleados/CajaModalEmpleado";
import { useAuth } from "../context/AuthContext";
import { MdInventory2, MdAssignment, MdAdminPanelSettings } from "react-icons/md";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface Props {
  logo?: string;
  nombre?: string;
  imagenBanner?: string;
  alturaBanner?: string;
  posicionBanner?: string;
  tamañoBanner?: string;
  categoria1?: string;
  categoria2?: string;
  categoriasExtras?: string[];
  setCategoriaFiltrada?: (cat: string | null) => void;
  linkInstagram?: string;
  linkFacebook?: string;
}

export default function Header({
  logo,
  nombre,
  imagenBanner,
  alturaBanner,
  posicionBanner,
  tamañoBanner,
  categoria1,
  categoria2,
  categoriasExtras = [],
  setCategoriaFiltrada = () => {},
  linkInstagram,
  linkFacebook,
}: Props) {
  const { cliente, iniciarSesion, cerrarSesion } = useCliente();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarMasCategorias, setMostrarMasCategorias] = useState(false);
  const [mostrarCaja, setMostrarCaja] = useState(false);
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();
  const userId = localStorage.getItem("tiendaSlugActual");
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchPedidos = async () => {
      const ref = collection(db, "tiendas", userId, "pedidos");
      const snap = await getDocs(ref);
      const pendientes = snap.docs.filter((doc) => doc.data()?.estado === "pendiente").length;
      setPedidosPendientes(pendientes);
    };
    fetchPedidos();
  }, [userId]);

  return (
    <div className="header-container" style={{ position: "sticky", top: 0, zIndex: 999, backgroundColor: "#fff" }}>
      <div
        style={{
          backgroundImage: `url(${imagenBanner})`,
          backgroundPosition: posicionBanner,
          backgroundRepeat: "no-repeat",
          backgroundSize: tamañoBanner,
          borderBottom: "1px solid rgba(0, 0, 0, .1)",
          height: alturaBanner,
          position: "relative",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            padding: "10px 12px",
            height: "60px",
            position: "absolute",
            bottom: "16px",
            left: "16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            gap: "10px",
          }}
        >
          <img src={logo || "/logo.png"} alt="Logo" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "contain" }} />
          <span style={{ fontWeight: 600 }}>{nombre}</span>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png"
            alt="Verificado"
            style={{ width: 18, height: 18, marginLeft: 4 }}
          />
        </div>
      </div>

      <BarraBusqueda />

      <div
        style={{
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid #eee",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ cursor: "pointer" }} onClick={() => {
            navigate(`/tienda/${userId}`);
            setCategoriaFiltrada?.(null);
          }}>
            Inicio
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => {
            navigate(`/tienda/${userId}/buscar/${encodeURIComponent(categoria1 || "")}`);
            setCategoriaFiltrada?.(categoria1 ?? null);
          }}>
            {categoria1}
          </span>

          <span style={{ cursor: "pointer" }} onClick={() => {
            navigate(`/tienda/${userId}/buscar/${encodeURIComponent(categoria2 || "")}`);
            setCategoriaFiltrada?.(categoria2 ?? null);
          }}>
            {categoria2}
          </span>

          {categoriasExtras.length > 0 && (
            <div style={{ position: "relative" }}>
              <span onClick={() => setMostrarMasCategorias(!mostrarMasCategorias)} style={{ cursor: "pointer" }}>
                Más categorías ▼
              </span>

              {mostrarMasCategorias && (
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "#fff",
                    top: "25px",
                    left: 0,
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    zIndex: 999,
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "200px",
                  }}
                >
                  {categoriasExtras.map((cat) => (
                    <div
                      key={cat}
                      style={{ cursor: "pointer", padding: "6px 8px", borderBottom: "1px solid #eee" }}
                      onClick={() => {
                        navigate(`/tienda/${userId}/buscar/${encodeURIComponent(cat)}`);
                        setMostrarMasCategorias(false);
                        setCategoriaFiltrada?.(cat);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {linkFacebook && (
            <a href={linkFacebook} target="_blank" rel="noreferrer" title="Facebook">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145802.png" alt="Facebook" style={{ width: 20 }} />
            </a>
          )}
          {linkInstagram && (
            <a href={linkInstagram} target="_blank" rel="noreferrer" title="Instagram">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={{ width: 20 }} />
            </a>
          )}

          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ url });
              else {
                navigator.clipboard.writeText(url);
                alert("Enlace copiado al portapapeles");
              }
            }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            title="Compartir"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/929/929610.png" alt="Compartir" style={{ width: 20 }} />
          </button>

          <BotonCarritoHeader />

          {(rol === "admin" || rol === "empleado") && userId && (
            <>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => navigate(`/admin/${userId}/pedidos`)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  title="Pedidos"
                >
                  <MdAssignment size={24} />
                  {pedidosPendientes > 0 && (
                    <span style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      background: "red",
                      color: "white",
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: "50%"
                    }}>
                      {pedidosPendientes}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => setMostrarCaja(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                title="Caja"
              >
                <MdInventory2 size={24} />
              </button>

              {rol === "admin" && (
                <button
                  onClick={() => navigate(`/admin/${userId}`)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  title="Modo Admin"
                >
                  <MdAdminPanelSettings size={24} color="#3483fa" />
                </button>
              )}
            </>
          )}

          {cliente ? (
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setMostrarMenu(!mostrarMenu)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {cliente.photoURL ? (
                  <img src={cliente.photoURL} alt="Perfil" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (
                  <span>{cliente.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase()}</span>
                )}
              </div>
              {mostrarMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    zIndex: 999,
                  }}
                >
                  <button onClick={() => navigate(`/tienda/${userId}/historial`)}>🧾 Historial</button>
                  <button onClick={() => navigate("/datos-envio")}>📦 Datos de envío</button>
                  <button onClick={cerrarSesion}>🚪 Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={iniciarSesion} style={{ padding: "0.4rem 0.8rem" }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      {mostrarCaja && <CajaModalEmpleado visible={mostrarCaja} onClose={() => setMostrarCaja(false)} />}
    </div>
  );
}
