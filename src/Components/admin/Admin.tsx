import "./Admin.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import AdminEnvios from "./AdminEnvios";


// Componentes por sección
import ProductosAdmin from "../admin/AdminProductos";
import ReservasAdmin from "../admin/AdminReservas";
import EmpleadosAdmin from "../admin/AdminEmpleados";
import ResumenCajasAdmin from "../../Components/empleados/ResumenCajasAdmin";
import NotificacionesAdmin from "../admin/AdminNotificaciones";
import PagosAdmin from "../admin/AdminPagos";
import EsteticaGeneral from "./Estetica/EsteticaGeneral";
import AyudaAdmin from "../admin/AdminAyuda";


export default function Admin() {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [seccionActiva, setSeccionActiva] = useState("productos");
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (rol && rol !== "admin") navigate("/");

    if (usuario && slug) {
      const cargarConfig = async () => {
        const ref = doc(db, "tiendas", slug);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setConfig({ ...snap.data() });
        }
      };
      cargarConfig();
    }
  }, [usuario, rol, slug, navigate]);

  const guardarConfiguracion = async () => {
    if (!slug) return;
    const ref = doc(db, "tiendas", slug);
    await setDoc(ref, config, { merge: true });
    Swal.fire("✅ Guardado", "La configuración se guardó correctamente", "success");
  };

  if (!usuario || rol !== "admin") {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando...</p>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Panel de administración</h2>
        <Link to={`/tienda/${slug}`}>
          <button>Volver a la tienda</button>
        </Link>
        <Link to="/admin/pedidos">
          <button>Ver pedidos</button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
        {["productos", "reservas", "empleados", "cajas", "estetica", "notificaciones", "pagos", "envios", "ayuda"].map((sec) => (
  <button
    key={sec}
    onClick={() => setSeccionActiva(sec)}
    style={{
      backgroundColor: seccionActiva === sec ? "#3483fa" : "#eee",
      color: seccionActiva === sec ? "#fff" : "#000",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    {sec.charAt(0).toUpperCase() + sec.slice(1)}
  </button>
))}

      </div>

      {seccionActiva === "productos" && <ProductosAdmin slug={slug!} />}
      {seccionActiva === "reservas" && <ReservasAdmin slug={slug!} />}
      {seccionActiva === "empleados" && <EmpleadosAdmin slug={slug!} />}
      {seccionActiva === "envios" && <AdminEnvios slug={slug!} />}
      {seccionActiva === "cajas" && <ResumenCajasAdmin slug={slug!} />}
      {seccionActiva === "estetica" && (
        <EsteticaGeneral
          config={config}
          setConfig={setConfig}
          guardarConfiguracion={guardarConfiguracion}
        />
      )}
      {seccionActiva === "notificaciones" && (
        <NotificacionesAdmin
          config={config}
          setConfig={setConfig}
          guardarConfiguracion={guardarConfiguracion}
        />
      )}
      {seccionActiva === "pagos" && (
        <PagosAdmin
          config={config}
          setConfig={setConfig}
          guardarConfiguracion={guardarConfiguracion}
        />
      )}
      {seccionActiva === "ayuda" && <AyudaAdmin />}

    </div>
  );
}
