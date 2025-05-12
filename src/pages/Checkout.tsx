// src/pages/Checkout.tsx
import "../pages/css/Checkout.css";
import { useCarrito } from "../context/CarritoContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useCliente } from "../context/ClienteContext";

export default function Checkout() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
    vaciarCarrito,
  } = useCarrito();

  const { cliente } = useCliente();
  const navigate = useNavigate();

  const finalizarCompra = async () => {
    const tiendaId = localStorage.getItem("userId");
    if (!tiendaId) {
      alert("No se encontró el ID de la tienda.");
      return;
    }

    // Verificamos si el cliente ya tiene datos guardados
    let datosGuardados: any = null;
    if (cliente) {
      const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        datosGuardados = snap.data();
      }
    }

    let clienteFinal;

    if (datosGuardados) {
      clienteFinal = datosGuardados;
    } else {
      const formValues = await Swal.fire({
        title: "Ingresa tus datos para el envío",
        html: `
          <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">
          <input id="swal-dni" class="swal2-input" placeholder="DNI">
          <input id="swal-direccion" class="swal2-input" placeholder="Dirección">
          <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
          <input id="swal-email" class="swal2-input" placeholder="Email">
        `,
        focusConfirm: false,
        preConfirm: () => ({
          nombre: (document.getElementById("swal-nombre") as HTMLInputElement).value,
          dni: (document.getElementById("swal-dni") as HTMLInputElement).value,
          direccion: (document.getElementById("swal-direccion") as HTMLInputElement).value,
          telefono: (document.getElementById("swal-telefono") as HTMLInputElement).value,
          email: (document.getElementById("swal-email") as HTMLInputElement).value,
        }),
      });

      if (!formValues.value || !formValues.value.nombre) {
        Swal.fire("Error", "Debes completar todos los campos", "error");
        return;
      }

      clienteFinal = formValues.value;

      if (cliente) {
        const ref = doc(db, "tiendas", tiendaId, "clientes", cliente.uid);
        await setDoc(ref, clienteFinal);
      }
    }

    Swal.fire({
        title: "Procesando pedido...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      
      setTimeout(() => {
        Swal.close();
        navigate("/forma-entrega");
      }, 1200);

    // Guardar en localStorage
    localStorage.setItem("cliente", JSON.stringify(clienteFinal));
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Actualizar stock
    for (const producto of carrito) {
      const ref = doc(db, "tiendas", tiendaId, "productos", producto.id!);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const nuevoStock = Math.max(
          0,
          (data.stock || 0) - (producto.cantidad || 1)
        );
        await updateDoc(ref, { stock: nuevoStock });
      }
    }

    // Guardar el pedido (sin forma de entrega aún)
    const pedido = {
      estado: "pendiente",
      fecha: serverTimestamp(),
      total: calcularTotal(),
      cliente: clienteFinal,
      productos: carrito.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        cantidad: prod.cantidad || 1,
        subtotal: prod.precio * (prod.cantidad || 1),
      })),
    };

    await addDoc(collection(db, "tiendas", tiendaId, "pedidos"), pedido);

    vaciarCarrito();
    Swal.close();
    navigate("/forma-entrega");
  };

  return (
    <div className="checkout-container">
      <h2>Resumen del pedido</h2>
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="checkout-listado">
            {carrito.map((producto) => (
              <li key={producto.id} className="checkout-item">
                <img src={producto.imagen} alt={producto.nombre} />
                <div>
                  <p><strong>{producto.nombre}</strong></p>
                  <p>Precio: ${producto.precio}</p>
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    min={1}
                    max={producto.stock}
                    value={producto.cantidad || 1}
                    onChange={(e) =>
                      actualizarCantidad(producto.id!, Number(e.target.value))
                    }
                  />
                  <p>Subtotal: ${producto.precio * (producto.cantidad || 1)}</p>
                  <button onClick={() => eliminarDelCarrito(producto.id!)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="checkout-total">
            <p>Total: <strong>${calcularTotal()}</strong></p>
            <button className="boton-finalizar" onClick={finalizarCompra}>
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}
