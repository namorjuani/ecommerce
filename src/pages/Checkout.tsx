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
        const resumen = carrito.map((prod) => ({
            id: prod.id,
            nombre: prod.nombre,
            cantidad: prod.cantidad,
            subtotal: prod.precio * (prod.cantidad || 1),
        }));

        const total = calcularTotal();

        const tiendaId = localStorage.getItem("userId");
        if (!tiendaId) {
            alert("Error: no se encontró el ID de la tienda");
            return;
        }

        try {
            // Guardar pedido en Firebase
            const pedidosRef = collection(db, "tiendas", tiendaId, "pedidos");
            await addDoc(pedidosRef, {
                productos: resumen,
                estado: "pendiente",
                total,
                fecha: serverTimestamp(),
            });

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

            await Swal.fire({
                icon: "success",
                title: "¡Compra exitosa!",
                text: "Tu pedido ha sido registrado correctamente.",
                confirmButtonText: "Volver al inicio",
                confirmButtonColor: "#28a745",
            });

            vaciarCarrito();
            window.location.href = "/";
        } catch (error) {
            console.error("Error al finalizar la compra:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un problema al procesar tu pedido.",
            });
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
                                    <p>
                                        <strong>{producto.nombre}</strong>
                                    </p>
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
                        <p>
                            Total: <strong>${calcularTotal()}</strong>
                        </p>
                        <button className="boton-finalizar" onClick={finalizarCompra}>
                            Finalizar compra
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
