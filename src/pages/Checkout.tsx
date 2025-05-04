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
} from "firebase/firestore";
import Swal from "sweetalert2";

export default function Checkout() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
    vaciarCarrito,
  } = useCarrito();

  const finalizarCompra = async () => {
    const tiendaId = localStorage.getItem("userId");
  
    if (!tiendaId) {
      alert("Error: No se encontró el ID de la tienda.");
      return;
    }
  
    // 🔄 Pedimos los datos del cliente antes de continuar
    const { value: formValues } = await Swal.fire({
      title: "Ingresa tus datos para el envío",
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">
        <input id="swal-dni" class="swal2-input" placeholder="DNI">
        <input id="swal-direccion" class="swal2-input" placeholder="Dirección">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
        <input id="swal-email" class="swal2-input" placeholder="Email">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          nombre: (document.getElementById("swal-nombre") as HTMLInputElement).value,
          dni: (document.getElementById("swal-dni") as HTMLInputElement).value,
          direccion: (document.getElementById("swal-direccion") as HTMLInputElement).value,
          telefono: (document.getElementById("swal-telefono") as HTMLInputElement).value,
          email: (document.getElementById("swal-email") as HTMLInputElement).value,
        };
      },
    });
  
    if (!formValues || !formValues.nombre) {
      Swal.fire("Error", "Debes completar todos los campos", "error");
      return;
    }
  
    // 🔄 Actualizamos stock
    for (const producto of carrito) {
      const ref = doc(db, "tiendas", tiendaId, "productos", producto.id!);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const nuevoStock = Math.max(0, (data.stock || 0) - (producto.cantidad || 1));
        await updateDoc(ref, { stock: nuevoStock });
      }
    }
  
    // 📦 Guardamos el pedido con datos del cliente
    const pedido = {
      estado: "pendiente",
      fecha: new Date().toISOString(),
      total: calcularTotal(),
      cliente: formValues,
      productos: carrito.map((prod) => ({
        id: prod.id,
        nombre: prod.nombre,
        cantidad: prod.cantidad,
        precio: prod.precio,
        subtotal: prod.precio * (prod.cantidad || 1),
      })),
    };
  
    await addDoc(collection(db, "tiendas", tiendaId, "pedidos"), pedido);
  
    vaciarCarrito();
  
    await Swal.fire({
      icon: "success",
      title: "¡Compra exitosa!",
      text: "Tu pedido fue registrado correctamente.",
      confirmButtonText: "Volver al inicio",
      confirmButtonColor: "#28a745",
    });
  
    window.location.href = "/";
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
