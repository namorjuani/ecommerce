// src/pages/Checkout.tsx
import "../pages/css/Checkout.css";
import { useCarrito } from "../context/CarritoContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
  } = useCarrito();

  const navigate = useNavigate();

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
      return;
    }

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
