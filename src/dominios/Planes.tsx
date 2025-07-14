import "../pages/css/Planes.css";
import { useNavigate } from "react-router-dom";

export default function Planes() {
  const navigate = useNavigate();

  return (
    <div className="planes-container">
      {/* Plan Básico */}
      <div className="plan-card">
        <div className="plan-title">Básico</div>
        <div className="plan-price">$10 / mes</div>
        <ul className="plan-features">
          <li>1 categoría</li>
          <li>Sin integración de pagos</li>
          <li>Sin WhatsApp</li>
          <li>Dominio temporal</li>
        </ul>
        <button className="plan-button" onClick={() => alert("Próximamente")}>
          Ver más
        </button>
      </div>

      {/* Plan Estándar (destacado) */}
      <div className="plan-card featured">
        <div className="plan-title">Estándar</div>
        <div className="plan-price">$25 / mes</div>
        <ul className="plan-features">
          <li>Categorías ilimitadas</li>
          <li>Integración Mercado Pago</li>
          <li>Botón WhatsApp</li>
          <li>Dominio personalizado</li>
        </ul>
        <button className="plan-button" onClick={() => navigate("/gracias")}>
          Contratar ahora
        </button>
      </div>

      {/* Plan Premium */}
      <div className="plan-card">
        <div className="plan-title">Premium</div>
        <div className="plan-price">$50.000 / mes</div>
        <ul className="plan-features">
          <li>Todo lo del Estándar</li>
          <li>Publicidad incluida</li>
          <li>Soporte prioritario</li>
          <li>Consultor personalizado</li>
        </ul>
        <button className="plan-button" onClick={() => alert("Próximamente")}>
          Ver más
        </button>
      </div>
    </div>
  );
}
