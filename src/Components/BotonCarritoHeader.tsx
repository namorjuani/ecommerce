import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCarrito } from "../context/CarritoContext";
import "./css/BotonCarritoHeader.css";

export default function BotonCarritoHeader() {
  const { carrito } = useCarrito();
  const cantidadTotal = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);

  return (
    <div className="carrito-header-wrapper">
      <Link to="/checkout" className="carrito-header-icon">
        <ShoppingCart size={24} />
        {cantidadTotal > 0 && <span className="carrito-header-badge">{cantidadTotal}</span>}
      </Link>
    </div>
  );
}
