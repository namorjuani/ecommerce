import { Link, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCarrito } from "../context/CarritoContext";
import "./css/BotonCarritoHeader.css";

export default function BotonCarritoHeader() {
  const { carrito } = useCarrito();
  const cantidadTotal = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  const { slug } = useParams();

  return (
    <div className="carrito-header-wrapper">
      <Link to={slug ? `/tienda/${slug}/checkout` : "/checkout"} className="carrito-header-icon">
        <ShoppingCart size={24} />
        {cantidadTotal > 0 && (
          <span className="carrito-header-badge">{cantidadTotal}</span>
        )}
      </Link>
    </div>
  );
}
