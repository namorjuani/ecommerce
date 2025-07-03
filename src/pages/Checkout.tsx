import "../pages/css/Checkout.css";
import { useCarrito } from "../context/CarritoContext";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom"; // ✅ Agregamos useParams para tomar el slug

export default function Checkout() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
  } = useCarrito();

  const navigate = useNavigate();
  const { slug } = useParams(); // ✅ Tomamos el slug de la URL

  const finalizarCompra = () => {
    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
      return;
    }

    // ✅ Ahora navegamos respetando el slug de la tienda
    if (slug) {
      navigate(`/tienda/${slug}/forma-entrega`);
    } else {
      Swal.fire("Error", "No se encontró la tienda", "error");
    }
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

                  {/* Selector de cantidad */}
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

                  {/* Botón para eliminar del carrito */}
                  <button onClick={() => eliminarDelCarrito(producto.id!)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Resumen y botón para finalizar */}
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
