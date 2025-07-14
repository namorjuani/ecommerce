import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCliente } from "../context/ClienteContext";

export default function FormaEntrega() {
  const [envio, setEnvio] = useState("");
  const [clienteInfo, setClienteInfo] = useState<any>({
    nombre: "",
    dni: "",
    direccion: "",
    telefono: "",
    email: ""
  });
  const { cliente } = useCliente();
  const { carrito, eliminarDelCarrito, vaciarCarrito, calcularTotal, actualizarCantidad } = useCarrito();
  const { esEmpleado } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (esEmpleado) setEnvio("retiro");
  }, [esEmpleado]);

  useEffect(() => {
    const tiendaId = localStorage.getItem("userId");
    if (cliente && tiendaId) {
      const fetchData = async () => {
        const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const datos = snap.data();
          setClienteInfo(datos);
          localStorage.setItem("cliente", JSON.stringify(datos));
        }
      };
      fetchData();
    }
  }, [cliente]);

  const total = calcularTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClienteInfo({ ...clienteInfo, [e.target.name]: e.target.value });
  };

  const guardarDatosEnvio = async () => {
    const tiendaId = localStorage.getItem("userId");
    if (!clienteInfo.nombre || !clienteInfo.dni || !clienteInfo.direccion || !clienteInfo.telefono || !clienteInfo.email) {
      Swal.fire("Error", "Debes completar todos los campos", "error");
      return;
    }
    if (cliente && tiendaId) {
      const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
      await setDoc(ref, clienteInfo);
      localStorage.setItem("cliente", JSON.stringify(clienteInfo));
      localStorage.setItem("clienteId", cliente.uid);
      Swal.fire("✔️ Datos guardados correctamente", "", "success");
    } else {
      localStorage.setItem("datosEnvioAnonimo", JSON.stringify(clienteInfo));
      Swal.fire("✔️ Datos guardados localmente", "", "success");
    }
  };

  const continuar = async () => {
    if (!envio) {
      Swal.fire("Aviso", "Seleccioná una forma de entrega", "info");
      return;
    }
    localStorage.setItem("formaEntrega", envio);
    navigate(`/tienda/${slug}/forma-pago`);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>Elegí tu forma de entrega</h2>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="envio"
              value="domicilio"
              checked={envio === "domicilio"}
              onChange={(e) => setEnvio(e.target.value)}
            /> Envío a domicilio
          </label>

          {envio === "domicilio" && (
            <div style={{ background: "#f1f1f1", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
              <h4>Dirección de envío:</h4>

              <input type="text" name="nombre" placeholder="Nombre completo" value={clienteInfo.nombre} onChange={handleInputChange} />
              <input type="text" name="dni" placeholder="DNI" value={clienteInfo.dni} onChange={handleInputChange} />
              <input type="text" name="direccion" placeholder="Dirección" value={clienteInfo.direccion} onChange={handleInputChange} />
              <input type="text" name="telefono" placeholder="Teléfono" value={clienteInfo.telefono} onChange={handleInputChange} />
              <input type="text" name="email" placeholder="Correo electrónico" value={clienteInfo.email} onChange={handleInputChange} />

              <button
                style={{ marginTop: "1rem", backgroundColor: "#3483fa", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "5px", cursor: "pointer" }}
                onClick={guardarDatosEnvio}
              >
                💾 Guardar dirección
              </button>
            </div>
          )}

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <input
              type="radio"
              name="envio"
              value="retiro"
              checked={envio === "retiro"}
              onChange={(e) => setEnvio(e.target.value)}
            /> Retiro en punto de entrega
          </label>

          <button
            onClick={continuar}
            style={{ marginTop: "1.5rem", padding: "0.8rem 1.5rem", backgroundColor: "#3483fa", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Continuar
          </button>

          <div style={{ marginTop: "2rem" }}>
            <h3>🛒 Productos en tu carrito</h3>
            {carrito.map((prod, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                <div>
                  <strong>{prod.nombre}</strong>
                  <div>
                    <label>
                      Cantidad:{" "}
                      <input
                        type="number"
                        value={prod.cantidad || 1}
                        min={1}
                        max={prod.stock}
                        onChange={(e) => actualizarCantidad(prod.id!, parseInt(e.target.value))}
                        style={{ width: "60px", marginLeft: "0.5rem", padding: "0.2rem", borderRadius: "4px", border: "1px solid #ccc" }}
                      />
                    </label>
                  </div>
                </div>
                <span style={{ fontWeight: "bold" }}>${prod.precio * (prod.cantidad || 1)}</span>
                <button
                  onClick={() => eliminarDelCarrito(prod.id!)}
                  style={{ marginLeft: "1rem", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", padding: "0.3rem 0.7rem", cursor: "pointer" }}
                >
                  ❌
                </button>
              </div>
            ))}

            <div style={{ marginTop: "1rem" }}>
              <button onClick={vaciarCarrito} style={{ backgroundColor: "red", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>
                Vaciar carrito
              </button>
              <button onClick={() => navigate("/")} style={{ marginLeft: "1rem", backgroundColor: "green", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>
                ➕ Seguir comprando
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", backgroundColor: "#f9f9f9" }}>
          <h3 style={{ marginBottom: "1rem" }}>Resumen de tu compra</h3>
          {carrito.map((prod, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <img src={prod.imagen} alt={prod.nombre} style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "0.5rem", borderRadius: "5px" }} />
              <span style={{ fontSize: "0.9rem" }}>{prod.nombre} x {prod.cantidad}</span>
            </div>
          ))}
          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>Total: ${total}</p>
        </div>
      </div>
    </div>
  );
}
