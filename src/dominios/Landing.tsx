// src/dominios/Landing.tsx
import { useNavigate } from 'react-router-dom';
import '../pages/css/Landing.css';
import '../pages/css/Planes.css';
import Swal from 'sweetalert2';

export default function Landing() {
  const navigate = useNavigate();

  const mostrarProximamente = () => {
    Swal.fire({
      icon: 'info',
      title: '¡Próximamente!',
      text: 'Este plan estará disponible muy pronto. Estamos trabajando para ofrecerte más opciones.',
      confirmButtonColor: '#3085d6',
    });
  };

  return (
    <div className="landing-container">
      <header>
        <h1>🛍️ Creá tu propia tienda online</h1>
        <p>Sin comisiones. Sin complicaciones. Todo listo para vender.</p>
      </header>

      <section>
        <h2>¿Qué incluye tu tienda?</h2>
        <ul>
          <li>✔️ Personalización completa</li>
          <li>✔️ Link propio con dominio o subdominio</li>
          <li>✔️ Cobros con Mercado Pago o transferencia</li>
          <li>✔️ Carga ilimitada de productos o servicios</li>
          <li>✔️ Panel de administración completo</li>
        </ul>
      </section>

      <section>
        <h2 style={{ textAlign: "center", marginTop: "3rem" }}>Nuestros planes</h2>
        <div className="planes-container">

          {/* Básico */}
          <div className="plan-card">
            <div className="plan-title">Básico</div>
            <div className="plan-price">$30 / mes</div>
            <ul className="plan-features">
              <li>1 categoría</li>
              <li>50 productos</li>
              <li>Sin integración de pagos</li>
              <li>Sin WhatsApp</li>
              <li>Dominio temporal</li>
            </ul>
            <button className="plan-button" onClick={mostrarProximamente}>
              Ver más
            </button>
          </div>

          {/* Estándar */}
          <div className="plan-card featured">
            <div className="plan-title">Estándar</div>
            <div className="plan-price">$50 / mes</div>
            <ul className="plan-features">
              <li>Categorías ilimitadas</li>
              <li>Hasta 300 productos</li>
              <li>Integración Mercado Pago</li>
              <li>Botón WhatsApp</li>
              <li>Manejo de empleados y cajas</li>
            </ul>

            {/* Botón para prueba gratuita */}
            <button
              className="plan-button"
              style={{
                backgroundColor: "#3498db",
                marginBottom: "0.5rem",
              }}
              onClick={() => navigate("/gracias?plan=estandar")}
            >
              Probar gratis
            </button>

            {/* Botón para pagar directamente */}
            <button
              className="plan-button"
              style={{
                backgroundColor: "#2ecc71",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/contratar-servicio")}
            >
              Contratar ahora
            </button>
          </div>


          {/* Premium */}
          <div className="plan-card">
            <div className="plan-title">Premium</div>
            <div className="plan-price">$85 / mes</div>
            <ul className="plan-features">
              <li>Todo lo del Estándar</li>
              <li>1000 productos</li>
              <li>Publicidad incluida</li>
              <li>Soporte prioritario</li>
              <li>Consultor personalizado</li>
            </ul>
            <button className="plan-button" onClick={mostrarProximamente}>
              Ver más
            </button>
          </div>
        </div>
      </section>

      {/* 🎥 Apartado de videos */}
      <section style={{ marginTop: "2rem" }}>
        <h2>🎥 Conocé la app</h2>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center"
        }}>
          <div style={{ width: "300px", height: "170px", position: "relative" }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/VIDEO_ID_1"
              title="Video demo 1"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div style={{ width: "300px", height: "170px", position: "relative" }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/VIDEO_ID_2"
              title="Video demo 2"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <footer>
        <p>Hecho con 💙 para emprendedores</p>
      </footer>
    </div>
  );
}
